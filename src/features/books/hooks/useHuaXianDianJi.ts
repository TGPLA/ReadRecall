// @审计已完成
// 划线点击交互 Hook - 管理"点击已有划线→弹出编辑菜单"的全流程

import { useState, useCallback, useEffect, useRef } from 'react';
import type { HuaXianXinXi, HuaXianYanSe } from './useHuaXianChuTi';

interface HuaXianDianJiXinXi {
  cfi: string;
  id: string;
  className: string;
  rect: { top: number; left: number; width: number; height: number };
  text: string;
}

export interface HuaXianBianJiZhuangTai {
  showEditMenu: boolean;
  editPosition: { top: number; left: number } | null;
  activeHuaXian: HuaXianXinXi | null;
  activeId: string | null;
}

interface UseHuaXianDianJiProps {
  huaXianList: HuaXianXinXi[];
  onDelete: (id: string) => void;
  onChangeYanSe: (id: string, yanSe: HuaXianYanSe) => void;
  onCopy?: (text: string) => void;
  onCloseEdit?: () => void;
}

export function useHuaXianDianJi({
  huaXianList,
  onDelete,
  onChangeYanSe,
  onCopy,
  onCloseEdit,
}: UseHuaXianDianJiProps) {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editPosition, setEditPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeHuaXian, setActiveHuaXian] = useState<HuaXianXinXi | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const huaXianListRef = useRef(huaXianList);

  useEffect(() => {
    huaXianListRef.current = huaXianList;
  }, [huaXianList]);

  const handleHuaXianDianJi = useCallback((xinXi: HuaXianDianJiXinXi) => {
    const list = huaXianListRef.current;
    let matched = list.find(h => String(h.id) === String(xinXi.id));
    if (!matched) matched = list.find(h => String(h.cfiRange) === String(xinXi.cfi));
    if (!matched) matched = list.find(h => String(xinXi.cfi).includes(String(h.cfiRange)) || String(h.cfiRange).includes(String(xinXi.cfi)));
    if (!matched) return;

    const rect = xinXi.rect;
    const menuWidth = 220;
    const menuHeight = 120;
    const safeMargin = 20;

    let menuTop = rect.top - menuHeight - 12;
    if (menuTop < safeMargin) menuTop = rect.bottom + 12;

    let menuLeft = rect.left + rect.width / 2;
    if (menuLeft - menuWidth / 2 < safeMargin) menuLeft = safeMargin + menuWidth / 2;
    else if (menuLeft + menuWidth / 2 > window.innerWidth - safeMargin) menuLeft = window.innerWidth - safeMargin - menuWidth / 2;

    setActiveHuaXian(matched);
    setActiveId(matched.id);
    setEditPosition({ top: menuTop, left: menuLeft });
    setShowEditMenu(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditMenu(false);
    setEditPosition(null);
    setActiveHuaXian(null);
    setActiveId(null);
    if (window.parent !== window) window.parent.postMessage({ type: 'set-hl-active', id: null }, '*');
    else window.postMessage({ type: 'set-hl-active', id: null }, '*');
    onCloseEdit?.();
  }, [onCloseEdit]);

  const handleDelete = useCallback(() => {
    if (!activeHuaXian) return;
    onDelete(activeHuaXian.id);
    handleCloseEdit();
  }, [activeHuaXian, onDelete, handleCloseEdit]);

  const handleChangeYanSe = useCallback((yanSe: HuaXianYanSe) => {
    if (!activeHuaXian) return;
    onChangeYanSe(activeHuaXian.id, yanSe);
    setActiveHuaXian(prev => prev ? { ...prev, yanSe } : null);
  }, [activeHuaXian, onChangeYanSe]);

  const handleCopyText = useCallback(async () => {
    if (!activeHuaXian) return;
    if (onCopy) { onCopy(activeHuaXian.text); }
    else { try { await navigator.clipboard.writeText(activeHuaXian.text); } catch {} }
    handleCloseEdit();
  }, [activeHuaXian, onCopy, handleCloseEdit]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'set-hl-active') setActiveId(e.data.id || null);
      if (e.data && e.data.type === 'close-edit-menu' && showEditMenu) {
        handleCloseEdit();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [showEditMenu, handleCloseEdit]);

  return {
    showEditMenu, editPosition, activeHuaXian, activeId,
    handleHuaXianDianJi, handleCloseEdit, handleDelete, handleChangeYanSe, handleCopyText,
  };
}
