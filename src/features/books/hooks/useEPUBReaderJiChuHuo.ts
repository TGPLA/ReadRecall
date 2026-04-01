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
}

export function useEPUBReaderJiChuHuo({ 
  bookId, 
  chapterId, 
  onParagraphCreated,
  renditionRef,
}: UseEPUBReaderJiChuHuoProps) {
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || 'guest';

  const { location, setLocation } = useYueDuJinDu({ userId, bookId });
  const { zhuTi, setZhuTi, yingYongZhuTi } = useZhuTi({ userId, bookId });
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
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  } = useHuaXianChuTi({
    userId,
    bookId,
    chapterId,
    onClose: huaCiJiaoHu.handleCancel,
    renditionRef,
    huaCiJiaoHuRef: {
      getCurrentCfiRange: huaCiJiaoHu.getCurrentCfiRange,
      setCurrentCfiRange: huaCiJiaoHu.setCurrentCfiRange,
    },
  });

  return {
    location,
    setLocation,
    zhuTi,
    setZhuTi,
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
    selectedText: huaCiJiaoHu.selectedText,
    showMenu: huaCiJiaoHu.showMenu,
    selectionRect: huaCiJiaoHu.selectionRect,
    generating,
    huaCiKaiQi,
    setHuaCiKaiQi,
    setSelectedText: huaCiJiaoHu.setSelectedText,
    setShowMenu: huaCiJiaoHu.setShowMenu,
    setSelectionRect: huaCiJiaoHu.setSelectionRect,
    setCurrentCfiRange: huaCiJiaoHu.setCurrentCfiRange,
    handleCancel: huaCiJiaoHu.handleCancel,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  };
}
