// @审计已完成
// EPUB 阅读器事件处理 Hook

import { useCallback, useEffect, useRef } from 'react';
import type { Rendition, Contents } from 'epubjs';
import { useEPUBReaderFanYeHeYeMa } from './useEPUBReaderFanYeHeYeMa';

interface UseEPUBReaderShiJianProps {
  yingYongZhuTi: (rendition: Rendition, zhuTi: string) => void;
  zhuTi: string;
  ziTiDaXiao: number;
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  chuLiSouSuoJieGuo: (jieGuo: any[], rendition?: Rendition) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  huaCiKaiQi: boolean;
  setSelectedText: (text: string) => void;
  setShowMenu: (show: boolean) => void;
  setSelectionRect: (rect: DOMRect | null) => void;
  setCurrentCfiRange: (cfiRange: string | null) => void;
}

export function useEPUBReaderShiJian({
  yingYongZhuTi, zhuTi, ziTiDaXiao, setYeMaXinXi, setLocation,
  chuLiSouSuoJieGuo, tiaoDaoShangYiGe, tiaoDaoXiaYiGe, huaCiKaiQi,
  setSelectedText, setShowMenu, setSelectionRect, setCurrentCfiRange,
}: UseEPUBReaderShiJianProps) {
  const fanYeHeYeMa = useEPUBReaderFanYeHeYeMa({
    setYeMaXinXi, setLocation, tiaoDaoShangYiGe, tiaoDaoXiaYiGe,
  });

  const cfiRangeRef = useRef<string | null>(null);

  const handleTextSelected = useCallback((cfiRange: string, contents: Contents) => {
    if (!huaCiKaiQi) return;
    cfiRangeRef.current = cfiRange;
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition) return;
    try {
      const text = rendition.getRange(cfiRange).toString().trim();
      if (text) {
        setSelectedText(text);
        setCurrentCfiRange(cfiRange);
      }
    } catch (error) { console.error('处理选中文本时出错:', error); }
  }, [huaCiKaiQi, setSelectedText, setCurrentCfiRange, fanYeHeYeMa.renditionRef]);

  const handleMouseUp = useCallback((contents: Contents) => {
    if (!huaCiKaiQi) return;
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition || !cfiRangeRef.current) return;
    try {
      const text = rendition.getRange(cfiRangeRef.current).toString().trim();
      if (text) {
        setShowMenu(true);
        const range = rendition.getRange(cfiRangeRef.current);
        const rect = range.getBoundingClientRect();
        const iframeRect = contents.window.document.documentElement.getBoundingClientRect();
        const correctedRect = {
          top: rect.top - iframeRect.top + contents.window.scrollY,
          left: rect.left - iframeRect.left + contents.window.scrollX,
          width: rect.width,
          height: rect.height,
          right: rect.right - iframeRect.left + contents.window.scrollX,
          bottom: rect.bottom - iframeRect.top + contents.window.scrollY,
        };
        setSelectionRect(correctedRect);
      }
      contents.window.getSelection()?.removeAllRanges();
      cfiRangeRef.current = null;
    } catch (error) { console.error('处理鼠标松开时出错:', error); }
  }, [huaCiKaiQi, setShowMenu, setSelectionRect, fanYeHeYeMa.renditionRef]);

  const handleRendition = useCallback((rendition: Rendition) => {
    fanYeHeYeMa.renditionRef.current = rendition;
    rendition.on('selected', handleTextSelected);
    rendition.hooks.content.register((contents: Contents) => {
      contents.window.addEventListener('mouseup', () => handleMouseUp(contents));
      return () => {
        contents.window.removeEventListener('mouseup', () => handleMouseUp(contents));
      };
    });
    rendition.on('rendered', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    rendition.on('relocated', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    yingYongZhuTi(rendition, zhuTi);
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
    rendition.book.loaded.navigation.then((nav) => {
      fanYeHeYeMa.tocRef.current = nav.toc || [];
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
  }, [handleTextSelected, handleMouseUp, yingYongZhuTi, zhuTi, ziTiDaXiao, fanYeHeYeMa]);

  useEffect(() => {
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition) return;
    yingYongZhuTi(rendition, zhuTi);
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
  }, [zhuTi, ziTiDaXiao, yingYongZhuTi, fanYeHeYeMa.renditionRef]);

  useEffect(() => {
    return () => {
      const rendition = fanYeHeYeMa.renditionRef.current;
      if (rendition) {
        rendition.off('selected', handleTextSelected);
      }
    };
  }, [handleTextSelected, fanYeHeYeMa.renditionRef]);

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
  };
}
