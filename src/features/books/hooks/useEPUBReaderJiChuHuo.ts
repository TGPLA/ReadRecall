// @审计已完成
// EPUB 阅读器基础 Hooks

import { useState, useCallback } from 'react';
import type { Rendition } from 'epubjs';
import { useHuaCiJiaoHu } from './useHuaCiChuangJian';
import { useHuaXianChuTi } from './useHuaXianChuTi';
import { useYueDuJinDu } from './useYueDuJinDu';
import { useZhuTi } from './useZhuTi';
import { useSouSuo } from './useSouSuo';
import { authService } from '../../../shared/services/auth';

interface UseEPUBReaderJiChuHuoProps {
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
  renditionRef?: React.RefObject<Rendition | undefined>;
  bookRef?: React.RefObject<any>;
  showMenu?: boolean;
  setSelectedText?: (text: string) => void;
  setShowMenu?: (show: boolean) => void;
  setSelectionRect?: (rect: DOMRect | null) => void;
  setCurrentCfiRange?: (cfiRange: string | null) => void;
  getCurrentCfiRange?: () => string | null;
}

export function useEPUBReaderJiChuHuo({ 
  bookId, 
  chapterId, 
  onParagraphCreated,
  renditionRef,
  bookRef,
  showMenu: externalShowMenu,
  setSelectedText: externalSetSelectedText,
  setShowMenu: externalSetShowMenu,
  setSelectionRect: externalSetSelectionRect,
  setCurrentCfiRange: externalSetCurrentCfiRange,
  getCurrentCfiRange: externalGetCurrentCfiRange,
}: UseEPUBReaderJiChuHuoProps) {
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || 'guest';

  const { location, setLocation } = useYueDuJinDu({ userId, bookId });
  const { zhuTi, setZhuTi, qieHuanZhuTi, yingYongZhuTi } = useZhuTi({ userId, bookId });
  const {
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
  } = useSouSuo();

  const [yeMaXinXi, setYeMaXinXi] = useState('');
  const [ziTiDaXiao, setZiTiDaXiao] = useState(100);
  const [huaCiKaiQi, setHuaCiKaiQi] = useState(true);

  const huaCiJiaoHu = useHuaCiJiaoHu(huaCiKaiQi);

  const {
    generating,
    huaXianList,
    handleGenerateQuestion,
    handleHuaXian,
    handleDeleteHuaXian,
    handleCopy,
  } = useHuaXianChuTi({
    userId,
    bookId,
    chapterId,
    onClose: huaCiJiaoHu.handleCancel,
    renditionRef,
    bookRef,
    huaCiJiaoHuRef: {
      getCurrentCfiRange: externalGetCurrentCfiRange || huaCiJiaoHu.getCurrentCfiRange,
      setCurrentCfiRange: externalSetCurrentCfiRange || huaCiJiaoHu.setCurrentCfiRange,
    },
  });

  return {
    location,
    setLocation,
    zhuTi,
    setZhuTi,
    qieHuanZhuTi,
    yingYongZhuTi,
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
    yeMaXinXi,
    setYeMaXinXi,
    ziTiDaXiao,
    setZiTiDaXiao,
    selectedText: externalShowMenu !== undefined ? huaCiJiaoHu.selectedText : huaCiJiaoHu.selectedText,
    showMenu: externalShowMenu !== undefined ? externalShowMenu : huaCiJiaoHu.showMenu,
    selectionRect: externalShowMenu !== undefined ? huaCiJiaoHu.selectionRect : huaCiJiaoHu.selectionRect,
    generating,
    huaXianList: huaXianList,
    huaCiKaiQi,
    setHuaCiKaiQi,
    setSelectedText: externalSetSelectedText || huaCiJiaoHu.setSelectedText,
    setShowMenu: externalSetShowMenu || huaCiJiaoHu.setShowMenu,
    setSelectionRect: externalSetSelectionRect || huaCiJiaoHu.setSelectionRect,
    setCurrentCfiRange: externalSetCurrentCfiRange || huaCiJiaoHu.setCurrentCfiRange,
    handleCancel: huaCiJiaoHu.handleCancel,
    handleGenerateQuestion,
    handleHuaXian,
    handleDeleteHuaXian,
    handleCopy,
  };
}
