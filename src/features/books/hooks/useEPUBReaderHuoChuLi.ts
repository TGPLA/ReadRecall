// @审计已完成
// EPUB 阅读器 Hooks 初始化 Hook

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
  const jiChu = useEPUBReaderJiChuHuo({ bookId, chapterId, onParagraphCreated });
  
  const {
    renditionRef,
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
    ziTiDaXiao: jiChu.ziTiDaXiao,
    setYeMaXinXi: jiChu.setYeMaXinXi,
    setLocation: jiChu.setLocation,
    chuLiSouSuoJieGuo: jiChu.chuLiSouSuoJieGuo,
    tiaoDaoShangYiGe: jiChu.tiaoDaoShangYiGe,
    tiaoDaoXiaYiGe: jiChu.tiaoDaoXiaYiGe,
    huaCiKaiQi: jiChu.huaCiKaiQi,
    setSelectedText: jiChu.setSelectedText,
    setShowMenu: jiChu.setShowMenu,
    setSelectionRect: jiChu.setSelectionRect,
    setCurrentCfiRange: jiChu.setCurrentCfiRange,
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
    selectedText: jiChu.selectedText,
    showMenu: jiChu.showMenu,
    selectionRect: jiChu.selectionRect,
    generating: jiChu.generating,
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
  };
}
