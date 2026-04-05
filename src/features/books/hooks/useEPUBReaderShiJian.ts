// @审计已完成
// EPUB 阅读器事件处理 Hook

import { useCallback, useEffect, useRef } from 'react';
import type { Rendition, Contents } from 'epubjs';
import { useEPUBReaderFanYeHeYeMa } from './useEPUBReaderFanYeHeYeMa';

const XUAN_ZE_YAN_CHI_MS = 300;
const ZUI_XIAO_WEN_ZI_SHU = 2;

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
  const xuanZeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const huaCiKaiQiRef = useRef(huaCiKaiQi);
  const linshiBiaoZhuCfiRef = useRef<string | null>(null);
  const showMenuRef = useRef(showMenu);

  useEffect(() => {
    huaCiKaiQiRef.current = huaCiKaiQi;
  }, [huaCiKaiQi]);

  useEffect(() => {
    showMenuRef.current = showMenu;
  }, [showMenu]);

  const handleHidePopup = useCallback(() => {
    if (xuanZeTimerRef.current) {
      clearTimeout(xuanZeTimerRef.current);
      xuanZeTimerRef.current = null;
    }
    const contents = contentsRef.current;
    if (!contents) return;
    const selection = contents.window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      const rendition = fanYeHeYeMa.renditionRef.current;
      if (rendition && linshiBiaoZhuCfiRef.current) {
        try { rendition.annotations.remove(linshiBiaoZhuCfiRef.current, 'temp-selection'); } catch {}
        linshiBiaoZhuCfiRef.current = null;
      }
      setShowMenu(false);
      setSelectedText('');
      setSelectionRect(null);
      setCurrentCfiRange(null);
    }
  }, [setShowMenu, setSelectedText, setSelectionRect, setCurrentCfiRange]);

  const handleRendition = useCallback((rendition: Rendition) => {
    fanYeHeYeMa.renditionRef.current = rendition;
    fanYeHeYeMa.setRenditionJiuXu(true);
    bookRef.current = rendition.book;

    const beiJingSe = zhuTi === 'dark' ? '#222228' : '#F2F2F4';
    const wenZiSe = zhuTi === 'dark' ? '#BBBBc4' : '#1A1A2E';
    const xuanchaSe = 'rgba(64, 158, 255, 0.3)';

    rendition.book.spine.hooks.serialize.register((section: any) => {
      try {
        if (!section.html) return section.html;
        const 注入样式 = `<style data-epub-early-bg>
        html, body { background-color: ${beiJingSe} !important; background: ${beiJingSe} !important; color: ${wenZiSe} !important; }
        ::selection { background-color: ${xuanchaSe} !important; }
      </style>`;
        if (section.html.includes('<head>')) {
          section.html = section.html.replace('<head>', `<head>${注入样式}`);
        } else if (section.html.includes('<html>')) {
          section.html = section.html.replace('<html>', `<html><head>${注入样式}</head>`);
        }
        return section.html;
      } catch (e) {
        return section.html;
      }
    });

    rendition.on("selected", (cfiRange: string, contents: Contents) => {
      if (!huaCiKaiQiRef.current) return;
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
          console.log('同文本节点选择 - startOffset:', startOffset, 'endOffset:', endOffset);
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
      if (xuanZeTimerRef.current) {
        clearTimeout(xuanZeTimerRef.current);
      }
      if (selectedText.length < ZUI_XIAO_WEN_ZI_SHU) {
        contents.window.getSelection().removeAllRanges();
        return;
      }
      xuanZeTimerRef.current = setTimeout(() => {
        const currentSelection = contents.window.getSelection();
        if (!currentSelection || currentSelection.isCollapsed) return;
        const rend = fanYeHeYeMa.renditionRef.current;
        if (rend && accurateCfiRange) {
          try {
            rend.annotations.add('temp-selection', accurateCfiRange, {}, () => {}, 'temp-hl', { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' });
            linshiBiaoZhuCfiRef.current = accurateCfiRange;
          } catch (e) { console.log('临时标注创建失败:', e); }
        }
        setShowMenu(true);
        xuanZeTimerRef.current = null;
      }, XUAN_ZE_YAN_CHI_MS);
    });
    
    rendition.hooks.content.register((contents: Contents) => {
      contentsRef.current = contents;
      if (!contents.window?.document?.head) return () => {};

      const beiJingSe = zhuTi === 'dark' ? '#222228' : '#F2F2F4';
      const wenZiSe = zhuTi === 'dark' ? '#BBBBc4' : '#1A1A2E';

      const baseStyle = contents.window.document.createElement('style');
      baseStyle.setAttribute('data-epub-base-bg', '');
      baseStyle.textContent = `
        html, body { background-color: ${beiJingSe} !important; background: ${beiJingSe} !important; color: ${wenZiSe} !important; }
        ::selection { background-color: rgba(64, 158, 255, 0.3) !important; }
        ::-moz-selection { background-color: rgba(64, 158, 255, 0.3) !important; }
        .epub-container svg.epubjs-hl { fill: transparent !important; }
        .epub-container svg.epubjs-hl rect { fill: transparent !important; stroke-width: 1px !important; }
        .hl-yellow { border-bottom: 1px dashed #000000 !important; padding-bottom: 2px !important; background: none !important; }
        .hl-green { border-bottom: 1px dashed #000000 !important; padding-bottom: 2px !important; background: none !important; }
        .hl-blue { border-bottom: 1px dashed #000000 !important; padding-bottom: 2px !important; background: none !important; }
        .hl-pink { border-bottom: 1px dashed #000000 !important; padding-bottom: 2px !important; background: none !important; }
        .temp-hl { border-bottom: 1px dashed #000000 !important; padding-bottom: 2px !important; background: none !important; }
      `;
      contents.window.document.head.insertBefore(baseStyle, contents.window.document.head.firstChild);

      function handleIframeClick() {
        if (!showMenuRef.current) return;
        const rend = fanYeHeYeMa.renditionRef.current;
        if (rend && linshiBiaoZhuCfiRef.current) {
          try { rend.annotations.remove(linshiBiaoZhuCfiRef.current, 'temp-selection'); } catch {}
          linshiBiaoZhuCfiRef.current = null;
        }
        setShowMenu(false);
        setSelectedText('');
        setSelectionRect(null);
        setCurrentCfiRange(null);
      }

      contents.window.addEventListener('click', handleIframeClick);

      return () => {
        contents.window.removeEventListener('click', handleIframeClick);
        const oldBase = contents.window.document.querySelector('style[data-epub-base-bg]');
        if (oldBase) oldBase.remove();
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
    renditionRef: fanYeHeYeMa.renditionRef,
    renditionJiuXu: fanYeHeYeMa.renditionJiuXu,
    handleRendition,
    handleNextPage: fanYeHeYeMa.handleNextPage, handlePrevPage: fanYeHeYeMa.handlePrevPage,
    handleShangYiGeSouSuoJieGuo: fanYeHeYeMa.handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo: fanYeHeYeMa.handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged, handleSouSuoJieGuo,
    bookRef,
  };
}