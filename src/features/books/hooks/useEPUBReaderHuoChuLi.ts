// @审计已完成
// EPUB 阅读器 Hooks 初始化 Hook

import { useState, useCallback, useRef } from 'react';
import type { Rendition } from 'epubjs';
import { useEPUBReaderJiChuHuo } from './useEPUBReaderJiChuHuo';
import { useEPUBReaderShiJian } from './useEPUBReaderShiJian';
import { useHuaXianDianJi } from './useHuaXianDianJi';

interface UseEPUBReaderHuoChuLiProps {
  bookId: string;
  chapterId?: string;
  onParagraphCreated?: () => void;
  onQuestionGenerated?: () => void;
  activeHuaXian?: import('@shared/services/annotationService').HuaXianXinXi | null;
  menuDistance?: number;
}

export function useEPUBReaderHuoChuLi({ 
  bookId, 
  chapterId, 
  onParagraphCreated,
  onQuestionGenerated,
  activeHuaXian,
  menuDistance = -30,
}: UseEPUBReaderHuoChuLiProps) {
  const renditionRef = useRef<Rendition | undefined>(undefined);
  const bookRef = useRef<any>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [firstLineRect, setFirstLineRect] = useState<DOMRect | null>(null);
  const [currentCfiRange, setCurrentCfiRange] = useState<string | null>(null);
  const [huaCiKaiQi, setHuaCiKaiQi] = useState(true);

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

  const jiChu = useEPUBReaderJiChuHuo({ 
    bookId, 
    chapterId, 
    onParagraphCreated, 
    onQuestionGenerated,
    renditionRef,
    bookRef,
    showMenu,
    setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect,
    setCurrentCfiRange,
    getCurrentCfiRange,
    activeHuaXian,
  });

  const editMenu = useHuaXianDianJi({
    huaXianList: jiChu.huaXianList,
    onDelete: jiChu.handleDeleteHuaXian,
    onChangeYanSe: jiChu.handleChangeYanSe,
    onCloseEdit: () => { handleShowMenu(false); },
    menuDistance,
  });

  const {
    renditionJiuXu,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
  } = useEPUBReaderShiJian({
    yingYongZhuTi: jiChu.yingYongZhuTi,
    zhuTi: jiChu.zhuTi,
    ziTiDaXiao: 100,
    setYeMaXinXi: jiChu.setYeMaXinXi,
    setLocation: jiChu.setLocation,
    chuLiSouSuoJieGuo: jiChu.chuLiSouSuoJieGuo,
    tiaoDaoShangYiGe: jiChu.tiaoDaoShangYiGe,
    tiaoDaoXiaYiGe: jiChu.tiaoDaoXiaYiGe,
    huaCiKaiQi,
    showMenu: showMenu,
    setSelectedText: setSelectedText,
    setShowMenu: handleShowMenu,
    setSelectionRect: setSelectionRect,
    setCurrentCfiRange: setCurrentCfiRange,
    setFirstLineRect: setFirstLineRect,
    externalRenditionRef: renditionRef,
    externalBookRef: bookRef,
    onHuaXianDianJi: editMenu.handleHuaXianDianJi,
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
    firstLineRect: firstLineRect,
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
    showEditMenu: editMenu.showEditMenu,
    editPosition: editMenu.editPosition,
    activeHuaXian: editMenu.activeHuaXian,
    activeHuaXianList: editMenu.activeHuaXianList,
    handleCloseEdit: editMenu.handleCloseEdit,
    handleDeleteHuaXian: editMenu.handleDelete,
    handleDeleteSingleHuaXian: editMenu.handleDeleteSingle,
    handleChangeYanSe: editMenu.handleChangeYanSe,
    handleCopyText: editMenu.handleCopyText,
  };
}