// @审计已完成
// 划线出题 Hook - AI出题、划线标记、复制文字

import { useState, useCallback, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export type HuaXianYanSe = 'yellow' | 'green' | 'blue' | 'pink';

export interface HuaXianXinXi {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: HuaXianYanSe;
  beiZhu: string;
  createdAt: number;
}

interface HuaCiJiaoHuWenJian {
  setCurrentCfiRange: (cfiRange: string | null) => void;
  getCurrentCfiRange: () => string | null;
}

interface UseHuaXianChuTiProps {
  userId: string;
  bookId: string;
  chapterId: string;
  onClose: () => void;
  renditionRef?: React.RefObject<Rendition | undefined>;
  bookRef?: React.RefObject<any>;
  huaCiJiaoHuRef?: HuaCiJiaoHuWenJian;
}

export function useHuaXianChuTi({
  userId,
  bookId,
  chapterId,
  onClose,
  renditionRef,
  bookRef,
  huaCiJiaoHuRef,
}: UseHuaXianChuTiProps) {
  const [generating, setGenerating] = useState(false);
  const storageKey = `huaxian_${userId}_${bookId}_${chapterId}`;
  const [huaXianList, setHuaXianList] = useLocalStorageState<HuaXianXinXi[]>(storageKey, { defaultValue: [] });

  const yingYongHuaXian = useCallback(async (cfiRange: string, qingChuJiuHuaXian: boolean = false, yanSe: HuaXianYanSe = 'yellow') => {
    const rendition = renditionRef?.current;
    if (!rendition) {
      console.error('应用划线失败: rendition 不存在');
      return;
    }
    try {
      if (qingChuJiuHuaXian) {
        console.log('清除所有旧划线');
        rendition.annotations.remove('highlight');
      }
      console.log('尝试应用划线, cfiRange:', cfiRange);
      
      const classMap: Record<HuaXianYanSe, string> = {
        yellow: 'hl-yellow',
        green: 'hl-green',
        blue: 'hl-blue',
        pink: 'hl-pink',
      };
      const styleMap: Record<HuaXianYanSe, { fill: string; 'fill-opacity': string; stroke: string; 'stroke-width': string; 'stroke-dasharray': string }> = {
        yellow: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        green: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        blue: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        pink: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
      };
      
      rendition.annotations.add('highlight', cfiRange, {}, () => {
        console.log('划线点击回调');
      }, classMap[yanSe], styleMap[yanSe]);
      console.log('划线应用成功');
    } catch (error) {
      console.error('应用划线失败:', error);
    }
  }, [renditionRef]);

  useEffect(() => {
    let rendition = renditionRef?.current;
    if (!rendition) {
      const checkRendition = setInterval(() => {
        rendition = renditionRef?.current;
        if (rendition) {
          clearInterval(checkRendition);
          setupRenditionListener(rendition);
        }
      }, 100);
      return () => clearInterval(checkRendition);
    }
    
    setupRenditionListener(rendition);
    
    function setupRenditionListener(r: typeof rendition) {
      const classMap: Record<HuaXianYanSe, string> = {
        yellow: 'hl-yellow',
        green: 'hl-green',
        blue: 'hl-blue',
        pink: 'hl-pink',
      };
      const styleMap: Record<HuaXianYanSe, { fill: string; 'fill-opacity': string; stroke: string; 'stroke-width': string; 'stroke-dasharray': string }> = {
        yellow: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        green: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        blue: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
        pink: { 'fill': 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
      };
      
      const applyHuaXian = () => {
        const currentRendition = renditionRef?.current;
        if (!currentRendition) return;
        
        currentRendition.annotations.remove('highlight');
        
        const currentHuaXian = JSON.parse(localStorage.getItem(`huaxian_${userId}_${bookId}_${chapterId}`) || '[]');

        if (currentHuaXian.length === 0) return;

        const quChongHuaXian = currentHuaXian.filter((h: HuaXianXinXi, index: number, self: HuaXianXinXi[]) =>
          index === self.findIndex(item => item.cfiRange === h.cfiRange)
        );

        quChongHuaXian.forEach((h: HuaXianXinXi) => {
          if (!h.cfiRange) return;
          try {
            const cls = classMap[h.yanSe] || classMap.yellow;
            const sty = styleMap[h.yanSe] || styleMap.yellow;
            currentRendition.annotations.add('highlight', h.cfiRange, {}, () => {}, cls, sty);
          } catch (error) {
            console.error('渲染划线失败:', error);
          }
        });
      };
      
      r.on('rendered', applyHuaXian);
      applyHuaXian();
      
      return () => r.off('rendered', applyHuaXian);
    }
  }, [userId, bookId, chapterId]);

  const handleGenerateQuestion = useCallback(async (selectedText: string, questionType: ChuTiLeiXing) => {
    if (!selectedText.trim()) return;

    setGenerating(true);
    try {
      const { data, error } = await aiService.generateFromSelection(chapterId, selectedText, questionType, 1);
      if (error) {
        showError('AI 出题失败：' + error);
        return;
      }
      showSuccess(`已生成 1 道${questionType}题目`);
      onClose();
    } finally {
      setGenerating(false);
    }
  }, [chapterId, onClose]);

  const handleHuaXian = useCallback((selectedText: string, yanSe: HuaXianYanSe = 'yellow', beiZhu: string = '') => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    console.log('handleHuaXian - 选中文本:', selectedText);
    console.log('handleHuaXian - CFI:', cfiRange);

    const cunZaiHuaXian = huaXianList.find(h => h.cfiRange === cfiRange);
    if (cunZaiHuaXian) {
      showError('该文本已划线，请先删除后再重新标记');
      onClose();
      return;
    }

    const huaXianXinXi: HuaXianXinXi = { id: Date.now().toString(), text: selectedText, cfiRange: cfiRange || '', yanSe, beiZhu, createdAt: Date.now() };
    setHuaXianList([...huaXianList, huaXianXinXi]);
    if (cfiRange) {
      yingYongHuaXian(cfiRange, false, yanSe);
    }
    huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
    showSuccess('已添加划线');
    onClose();
  }, [onClose, yingYongHuaXian, huaCiJiaoHuRef, huaXianList]);

  const handleDeleteHuaXian = useCallback((id: string) => {
    const deletedHuaXian = huaXianList.find(h => h.id === id);
    
    const rendition = renditionRef?.current;
    console.log('删除划线 - rendition:', !!rendition, 'cfiRange:', deletedHuaXian?.cfiRange);

    if (rendition && deletedHuaXian?.cfiRange) {
      try {
        rendition.annotations.remove(deletedHuaXian.cfiRange, 'highlight');
      } catch (error) {
        console.error('清除划线失败:', error);
      }
    }

    setHuaXianList(prev => prev.filter(h => h.id !== id));
    showSuccess('已删除划线');

    setTimeout(() => {
      const currentLocation = rendition?.location?.start?.cfi;
      if (currentLocation && rendition) {
        console.log('延迟重新渲染当前章节');
        const manager = (rendition as any).manager;
        if (manager && manager.clear) {
          manager.clear();
        }
        rendition.display(currentLocation).then(() => {
          console.log('已重新渲染当前章节');
        }).catch(err => {
          console.error('重新渲染失败:', err);
        });
      }
    }, 150);
  }, [huaXianList, renditionRef]);

  const handleCopy = useCallback(async (selectedText: string) => {
    try {
      await navigator.clipboard.writeText(selectedText);
      showSuccess('已复制到剪贴板');
      onClose();
    } catch {
      showError('复制失败');
    }
  }, [onClose]);

  return {
    generating,
    huaXianList,
    handleGenerateQuestion,
    handleHuaXian,
    handleDeleteHuaXian,
    handleCopy,
  };
}
