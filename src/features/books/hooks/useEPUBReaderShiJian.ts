// @审计已完成
// EPUB 阅读器事件处理 Hook

import { useCallback, useEffect, useRef } from 'react';
import type { Rendition, Contents } from 'epubjs';
import { useEPUBReaderFanYeHeYeMa } from './useEPUBReaderFanYeHeYeMa';

interface UseEPUBReaderShiJianProps {
  yingYongZhuTi?: (rendition: Rendition, zhuTi: string) => void;
  zhuTi: string;
  ziTiDaXiao: number;
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  chuLiSouSuoJieGuo: (jieGuo: any[], rendition?: Rendition) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  huaCiKaiQi: boolean;
  showMenu: boolean;
  setSelectedText: (text: string) => void;
  setShowMenu: (show: boolean) => void;
  setSelectionRect: (rect: DOMRect | null) => void;
  setCurrentCfiRange: (cfiRange: string | null) => void;
}

export function useEPUBReaderShiJian({
  yingYongZhuTi, zhuTi, ziTiDaXiao, setYeMaXinXi, setLocation,
  chuLiSouSuoJieGuo, tiaoDaoShangYiGe, tiaoDaoXiaYiGe, huaCiKaiQi,
  showMenu, setSelectedText, setShowMenu, setSelectionRect, setCurrentCfiRange,
}: UseEPUBReaderShiJianProps) {
  const fanYeHeYeMa = useEPUBReaderFanYeHeYeMa({
    setYeMaXinXi, setLocation, tiaoDaoShangYiGe, tiaoDaoXiaYiGe,
  });

  const cfiRangeRef = useRef<string | null>(null);
  const contentsRef = useRef<Contents | null>(null);
  const bookRef = useRef<any>(null);

  const handleHidePopup = useCallback(() => {
    const contents = contentsRef.current;
    if (!contents) return;
    const selection = contents.window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      setShowMenu(false);
      setSelectedText('');
      setSelectionRect(null);
      setCurrentCfiRange(null);
    }
  }, [setShowMenu, setSelectedText, setSelectionRect, setCurrentCfiRange]);

  const handleRendition = useCallback((rendition: Rendition) => {
    fanYeHeYeMa.renditionRef.current = rendition;
    bookRef.current = rendition.book;
    
    rendition.on("selected", (cfiRange: string, contents: Contents) => {
      if (!huaCiKaiQi) return;
      const selection = contents.window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const selectedText = selection.toString().trim();
      if (!selectedText) return;
      
      console.log('Selection rangeCount:', selection.rangeCount);
      console.log('Selection toString:', selectedText);
      
      const range = selection.getRangeAt(0);
      
      if (selection.rangeCount > 1) {
        console.log('警告: 选区包含多个 range');
        for (let i = 0; i < selection.rangeCount; i++) {
          const r = selection.getRangeAt(i);
          console.log(`Range ${i}:`, r.toString().substring(0, 50));
        }
      }
      
      let accurateCfiRange = cfiRange;
      try {
        const doc = contents.document;
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        let startOffset = range.startOffset;
        let endOffset = range.endOffset;
        
        if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
          endOffset = Math.max(startOffset + 1, endOffset - 1);
          console.log('调整 endOffset:', range.endOffset, '->', endOffset);
        }
        
        function getTextNodePath(node: Node, doc: Document): string {
          if (node.nodeType === Node.TEXT_NODE) {
            let path = '';
            let current = node.parentElement;
            while (current && current !== doc.body) {
              const siblings = Array.from(current.parentElement?.children || []);
              const index = siblings.indexOf(current) + 1;
              path = `/${index}${path}`;
              current = current.parentElement;
            }
            return path;
          }
          return '';
        }
        
        function getCfiTextLocation(node: Node, offset: number): string {
          if (node.nodeType === Node.TEXT_NODE) {
            return `:${offset}`;
          }
          return '';
        }
        
        const startPath = getTextNodePath(startContainer, doc);
        const endPath = getTextNodePath(endContainer, doc);
        const startLocation = getCfiTextLocation(startContainer, startOffset);
        const endLocation = getCfiTextLocation(endContainer, endOffset);
        
        const cfiBaseMatch = cfiRange.match(/epubcfi\(([^!]+)/);
        const base = cfiBaseMatch ? cfiBaseMatch[1] : '/6/4';
        
        let computedCfi = '';
        const adjustedRange = doc.createRange();
        try {
          adjustedRange.setStart(startContainer, startOffset);
          adjustedRange.setEnd(endContainer, endOffset);
          computedCfi = contents.cfiFromRange(adjustedRange) || '';
          console.log('调整后的 range 传入 cfiFromRange');
        } catch (e) {
          console.log('创建 adjustedRange 失败:', e);
          computedCfi = contents.cfiFromRange(range) || '';
        }
        
        console.log('cfiFromRange input - startOffset:', startOffset, 'endOffset:', endOffset);
        console.log('cfiFromRange input - range.toString().length:', range.toString().length);
        if (computedCfi) {
          const pathMatch = computedCfi.match(/epubcfi\([^!]+!(.+)\)/);
          const pathPart = pathMatch ? pathMatch[1] : `${startPath}${startLocation},${endPath}${endLocation}`;
          accurateCfiRange = `epubcfi(${base}!${pathPart})`;
          console.log('使用 cfiFromRange:', computedCfi);
          console.log('替换 base 后:', accurateCfiRange, '原始:', cfiRange);
        } else if (startPath && endPath) {
          const manualCfi = `epubcfi(${base}!${startPath}${startLocation},${endPath}${endLocation})`;
          console.log('手动构建 CFI:', manualCfi, '原始:', cfiRange);
          console.log('Range 信息:', {
            startContainer: startContainer?.nodeName,
            startOffset,
            endContainer: endContainer?.nodeName,
            endOffset,
            text: range.toString()
          });
          accurateCfiRange = manualCfi;
        } else {
          console.log('无法构建路径，使用原始 CFI');
        }
      } catch (error) {
        console.error('CFI 重新计算失败，使用原始值:', error);
      }
      
      const rect = range.getBoundingClientRect();
      const iframe = contents.window.frameElement;
      if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        const correctedRect = {
          top: rect.top + iframeRect.top,
          left: rect.left + iframeRect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right + iframeRect.left,
          bottom: rect.bottom + iframeRect.top,
        };
        setSelectionRect(correctedRect);
      } else {
        setSelectionRect(rect);
      }
      
      setCurrentCfiRange(accurateCfiRange);
      console.log('selected 事件 - 选中文本:', selectedText);
      console.log('selected 事件 - CFI:', accurateCfiRange);
      setSelectedText(selectedText);
      setShowMenu(true);
      contents.window.getSelection().removeAllRanges();
    });
    
    rendition.hooks.content.register((contents: Contents) => {
      contentsRef.current = contents;
      
      contents.window.addEventListener('mousedown', () => {
        setTimeout(handleHidePopup, 10);
      });

      const style = contents.window.document.createElement('style');
      style.textContent = `
        ::selection {
          background-color: rgba(64, 158, 255, 0.3) !important;
        }
        ::-moz-selection {
          background-color: rgba(64, 158, 255, 0.3) !important;
        }
      `;
      contents.window.document.head.appendChild(style);

      return () => {
        contents.window.removeEventListener('mousedown', handleHidePopup);
        contents.window.document.head.removeChild(style);
      };
    });
    rendition.on('rendered', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    rendition.on('relocated', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    if (yingYongZhuTi) {
      yingYongZhuTi(rendition, zhuTi);
    }
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
    rendition.book.loaded.navigation.then((nav) => {
      fanYeHeYeMa.tocRef.current = nav.toc || [];
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
  }, [huaCiKaiQi, handleHidePopup, yingYongZhuTi, zhuTi, ziTiDaXiao, fanYeHeYeMa, setSelectionRect, setCurrentCfiRange, setSelectedText, setShowMenu]);

  useEffect(() => {
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition) return;
    if (yingYongZhuTi) {
      yingYongZhuTi(rendition, zhuTi);
    }
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
  }, [zhuTi, ziTiDaXiao, yingYongZhuTi, fanYeHeYeMa.renditionRef]);

  const handleSouSuoJieGuo = useCallback((jieGuo: any[]) => {
    chuLiSouSuoJieGuo(jieGuo, fanYeHeYeMa.renditionRef.current);
  }, [chuLiSouSuoJieGuo, fanYeHeYeMa.renditionRef]);

  const handleLocationChanged = useCallback((epubcfi: string) => {
    fanYeHeYeMa.handleLocationChanged(epubcfi);
  }, [fanYeHeYeMa]);

  return {
    renditionRef: fanYeHeYeMa.renditionRef, handleRendition,
    handleNextPage: fanYeHeYeMa.handleNextPage, handlePrevPage: fanYeHeYeMa.handlePrevPage,
    handleShangYiGeSouSuoJieGuo: fanYeHeYeMa.handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo: fanYeHeYeMa.handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged, handleSouSuoJieGuo,
    bookRef,
  };
}