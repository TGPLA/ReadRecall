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
  activeHuaXianList: HuaXianXinXi[];
  activeId: string | null;
}

interface UseHuaXianDianJiProps {
  huaXianList: HuaXianXinXi[];
  onDelete: (id: string) => void;
  onChangeYanSe: (id: string, yanSe: HuaXianYanSe) => void;
  onCopy?: (text: string) => void;
  onCloseEdit?: () => void;
  menuDistance?: number;
}

function tiQuCfiLuJing(cfi: string): string {
  const m = cfi.match(/epubcfi\(([^,!]+(?:![^,]*)?)/);
  return m ? m[1] : '';
}

function quYiCeng(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx > 0 ? path.slice(0, idx) : '';
}

function cfiPiPei(cfi1: string, cfi2: string): boolean {
  if (!cfi1 || !cfi2) return false;
  if (cfi1 === cfi2) return true;
  const p1 = tiQuCfiLuJing(cfi1);
  const p2 = tiQuCfiLuJing(cfi2);
  if (!p1 || !p2) return false;
  if (p1 === p2) return true;
  if (quYiCeng(p1) === p2 || quYiCeng(p2) === p1) return true;
  return false;
}

export function useHuaXianDianJi({
  huaXianList,
  onDelete,
  onChangeYanSe,
  onCopy,
  onCloseEdit,
  menuDistance = -30,
}: UseHuaXianDianJiProps) {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editPosition, setEditPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeHuaXian, setActiveHuaXian] = useState<HuaXianXinXi | null>(null);
  const [activeHuaXianList, setActiveHuaXianList] = useState<HuaXianXinXi[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const huaXianListRef = useRef(huaXianList);
  const menuDistanceRef = useRef(menuDistance);

  useEffect(() => {
    huaXianListRef.current = huaXianList;
  }, [huaXianList]);

  useEffect(() => {
    menuDistanceRef.current = menuDistance;
  }, [menuDistance]);

  const handleHuaXianDianJi = useCallback((xinXi: HuaXianDianJiXinXi) => {
    const list = huaXianListRef.current;
    let matchedList = list.filter(h => cfiPiPei(h.cfiRange, xinXi.cfi));
    matchedList = matchedList.filter((h, i, self) => i === self.findIndex(x => x.leiXing === h.leiXing && cfiPiPei(x.cfiRange, h.cfiRange)));
    if (matchedList.length === 0) return;

    const matched = matchedList[0];
    const rect = xinXi.rect;
    const menuWidth = 220;
    const menuHeight = 120;
    const safeMargin = 20;
    const distance = menuDistanceRef.current;
    
    let menuTop = rect.top - menuHeight - distance;
    if (menuTop < safeMargin) {
      menuTop = rect.bottom + distance;
    }

    let menuLeft = rect.left + rect.width / 2;
    if (menuLeft - menuWidth / 2 < safeMargin) menuLeft = safeMargin + menuWidth / 2;
    else if (menuLeft + menuWidth / 2 > window.innerWidth - safeMargin) menuLeft = window.innerWidth - safeMargin - menuWidth / 2;

    setActiveHuaXian(matched);
    setActiveHuaXianList(matchedList);
    setActiveId(matched.id);
    setEditPosition({ top: menuTop, left: menuLeft });
    setShowEditMenu(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditMenu(false);
    setEditPosition(null);
    setActiveHuaXian(null);
    setActiveHuaXianList([]);
    setActiveId(null);
    if (window.parent !== window) window.parent.postMessage({ type: 'set-hl-active', id: null }, '*');
    else window.postMessage({ type: 'set-hl-active', id: null }, '*');
    onCloseEdit?.();
  }, [onCloseEdit]);

  const handleDelete = useCallback(() => {
    if (!activeHuaXianList.length) return;
    activeHuaXianList.forEach(h => onDelete(h.id));
    handleCloseEdit();
  }, [activeHuaXianList, onDelete, handleCloseEdit]);

  const handleDeleteSingle = useCallback((id: string) => {
    onDelete(id);
    if (activeHuaXianList.length <= 1) {
      handleCloseEdit();
    } else {
      setActiveHuaXianList(prev => prev.filter(h => h.id !== id));
    }
  }, [activeHuaXianList, onDelete, handleCloseEdit]);

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
    showEditMenu, editPosition, activeHuaXian, activeHuaXianList, activeId,
    handleHuaXianDianJi, handleCloseEdit, handleDelete, handleDeleteSingle, handleChangeYanSe, handleCopyText,
  };
}
