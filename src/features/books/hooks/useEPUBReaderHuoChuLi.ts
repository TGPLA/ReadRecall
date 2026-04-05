// @审计已完成
// EPUB 阅读器 Hooks 初始化 Hook

import { useState, useCallback } from 'react';
import { useEPUBReaderJiChuHuo } from './useEPUBReaderJiChuHuo';
import { useEPUBReaderShiJian } from './useEPUBReaderShiJian';

interface UseEPUBReaderHuoChuLiProps {
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function useEPUBReaderHuoChuLi({ 
  bookId, 
  chapterId, 
  onParagraphCreated 
}: UseEPUBReaderHuoChuLiProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [currentCfiRange, setCurrentCfiRange] = useState<string | null>(null);
  const [huaCiKaiQi, setHuaCiKaiQi] = useState(true);

  const handleShowMenu = useCallback((show: boolean) => {
    setShowMenu(show);
    if (!show) {
      const rendition = renditionRef.current;
      if (rendition && currentCfiRange) {
        try { rendition.annotations.remove(currentCfiRange, 'temp-selection'); } catch {}
      }
      setSelectedText('');
      setSelectionRect(null);
      setCurrentCfiRange(null);
    }
  }, []);

  const getCurrentCfiRange = useCallback(() => {
    return currentCfiRange;
  }, [currentCfiRange]);

  const jiChu = useEPUBReaderJiChuHuo({ 
    bookId, 
    chapterId, 
    onParagraphCreated, 
    renditionRef: undefined as any, 
    bookRef: undefined as any,
    showMenu,
    setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect,
    setCurrentCfiRange,
    getCurrentCfiRange,
  });

  const {
    renditionRef,
    renditionJiuXu,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
    bookRef,
  } = useEPUBReaderShiJian({
    yingYongZhuTi: jiChu.yingYongZhuTi,
    zhuTi: jiChu.zhuTi,
    ziTiDaXiao: 100,
    setYeMaXinXi: () => {},
    setLocation: () => {},
    chuLiSouSuoJieGuo: () => {},
    tiaoDaoShangYiGe: () => undefined,
    tiaoDaoXiaYiGe: () => undefined,
    huaCiKaiQi,
    showMenu: showMenu,
    setSelectedText: setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect: setSelectionRect,
    setCurrentCfiRange: setCurrentCfiRange,
  });

  return {
    location: jiChu.location,
    zhuTi: jiChu.zhuTi,
    setZhuTi: jiChu.setZhuTi,
    qieHuanZhuTi: jiChu.qieHuanZhuTi,
    souSuoCi: jiChu.souSuoCi,
    setSouSuoCi: jiChu.setSouSuoCi,
    souSuoJieGuo: jiChu.souSuoJieGuo,
    dangQianJieGuoSuoYin: jiChu.dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe: jiChu.tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe: jiChu.tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo: jiChu.chuLiSouSuoJieGuo,
    yeMaXinXi: jiChu.yeMaXinXi,
    ziTiDaXiao: jiChu.ziTiDaXiao,
    setZiTiDaXiao: jiChu.setZiTiDaXiao,
    selectedText: selectedText,
    showMenu: showMenu,
    selectionRect: selectionRect,
    generating: jiChu.generating,
    highlights: jiChu.huaXianList,
    huaXianList: jiChu.huaXianList,
    huaCiKaiQi,
    setHuaCiKaiQi,
    handleCancel: jiChu.handleCancel,
    handleGenerateQuestion: jiChu.handleGenerateQuestion,
    handleHighlight: jiChu.handleHuaXian,
    handleDeleteHighlight: jiChu.handleDeleteHuaXian,
    handleCopy: jiChu.handleCopy,
    renditionRef,
    renditionJiuXu,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
    bookRef,
  };
}