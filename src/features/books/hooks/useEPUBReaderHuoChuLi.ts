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

  const handleShowMenu = useCallback((show: boolean) => {
    setShowMenu(show);
    if (!show) {
      setSelectedText('');
      setSelectionRect(null);
      setCurrentCfiRange(null);
    }
  }, []);

  const getCurrentCfiRange = useCallback(() => {
    return currentCfiRange;
  }, [currentCfiRange]);

  const {
    renditionRef,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
    bookRef,
  } = useEPUBReaderShiJian({
    yingYongZhuTi: undefined,
    zhuTi: 'light',
    ziTiDaXiao: 100,
    setYeMaXinXi: () => {},
    setLocation: () => {},
    chuLiSouSuoJieGuo: () => {},
    tiaoDaoShangYiGe: () => undefined,
    tiaoDaoXiaYiGe: () => undefined,
    huaCiKaiQi: true,
    showMenu: showMenu,
    setSelectedText: setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect: setSelectionRect,
    setCurrentCfiRange: setCurrentCfiRange,
  });

  const jiChu = useEPUBReaderJiChuHuo({ 
    bookId, 
    chapterId, 
    onParagraphCreated, 
    renditionRef, 
    bookRef,
    showMenu,
    setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect,
    setCurrentCfiRange,
    getCurrentCfiRange,
  });

  return {
    location: jiChu.location,
    zhuTi: jiChu.zhuTi,
    setZhuTi: jiChu.setZhuTi,
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
    highlights: jiChu.highlights,
    handleDeleteHighlight: jiChu.handleDeleteHighlight,
    huaCiKaiQi: jiChu.huaCiKaiQi,
    setHuaCiKaiQi: jiChu.setHuaCiKaiQi,
    handleCancel: jiChu.handleCancel,
    handleGenerateQuestion: jiChu.handleGenerateQuestion,
    handleHighlight: jiChu.handleHighlight,
    handleCopy: jiChu.handleCopy,
    renditionRef,
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