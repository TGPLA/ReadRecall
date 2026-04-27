// @审计已完成
// 划线交互 Hook - 管理文本选择状态和虚线显示

import { useState, useCallback, useRef } from 'react';

export interface HuaXianZhuangTai {
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  enabled: boolean;
}

export function useHuaCiJiaoHu(__enabled: boolean) {
  const [selectedText, setSelectedText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const currentCfiRangeRef = useRef<string | null>(null);

  const handleCancel = useCallback(() => {
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    currentCfiRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
  }, []);

  const setCurrentCfiRange = useCallback((cfiRange: string | null) => {
    currentCfiRangeRef.current = cfiRange;
  }, []);

  const getCurrentCfiRange = useCallback(() => {
    return currentCfiRangeRef.current;
  }, []);

  return {
    selectedText,
    showMenu,
    selectionRect,
    setSelectedText,
    setShowMenu,
    setSelectionRect,
    setCurrentCfiRange,
    getCurrentCfiRange,
    handleCancel,
  };
}
