// @审计已完成
// 划线出题 Hook - AI出题、高亮标记、复制文字

import { useState, useCallback, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export type GaoLiangYanSe = 'yellow' | 'green' | 'blue' | 'pink';

export interface GaoLiangXinXi {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: GaoLiangYanSe;
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
  const storageKey = `gaoliang_${userId}_${bookId}_${chapterId}`;
  const [highlights, setHighlights] = useLocalStorageState<GaoLiangXinXi[]>(storageKey, { defaultValue: [] });

  const yingYongGaoLiang = useCallback(async (cfiRange: string, qingChuJiuGaoLiang: boolean = false, yanSe: GaoLiangYanSe = 'yellow') => {
    const rendition = renditionRef?.current;
    if (!rendition) {
      console.error('应用高亮失败: rendition 不存在');
      return;
    }
    try {
      if (qingChuJiuGaoLiang) {
        console.log('清除所有旧高亮');
        rendition.annotations.remove('highlight');
      }
      console.log('尝试应用高亮, cfiRange:', cfiRange);
      
      const colorMap: Record<GaoLiangYanSe, string> = {
        yellow: '#fef08a',
        green: '#86efac',
        blue: '#93c5fd',
        pink: '#f9a8d4',
      };
      
      rendition.annotations.highlight(cfiRange, { fill: colorMap[yanSe] }, () => {
        console.log('高亮点击回调');
      });
      console.log('高亮应用成功');
    } catch (error) {
      console.error('应用高亮失败:', error);
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
      const colorMap: Record<GaoLiangYanSe, string> = {
        yellow: '#fef08a',
        green: '#86efac',
        blue: '#93c5fd',
        pink: '#f9a8d4',
      };
      
      const applyHighlights = () => {
        const currentRendition = renditionRef?.current;
        if (!currentRendition) return;
        
        currentRendition.annotations.remove('highlight');
        
        const currentHighlights = JSON.parse(localStorage.getItem(`gaoliang_${userId}_${bookId}_${chapterId}`) || '[]');
        
        if (currentHighlights.length === 0) return;
        
        currentHighlights.forEach((h: GaoLiangXinXi) => {
          if (!h.cfiRange) return;
          try {
            const fill = colorMap[h.yanSe] || colorMap.yellow;
            currentRendition.annotations.highlight(h.cfiRange, { fill }, () => {});
          } catch (error) {
            console.error('渲染高亮失败:', error);
          }
        });
      };
      
      r.on('rendered', applyHighlights);
      applyHighlights();
      
      return () => r.off('rendered', applyHighlights);
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

  const handleHighlight = useCallback((selectedText: string, yanSe: GaoLiangYanSe = 'yellow', beiZhu: string = '') => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    console.log('handleHighlight - 选中文本:', selectedText);
    console.log('handleHighlight - CFI:', cfiRange);
    const gaoLiangXinXi: GaoLiangXinXi = {
      id: Date.now().toString(),
      text: selectedText,
      cfiRange: cfiRange || '',
      yanSe,
      beiZhu,
      createdAt: Date.now(),
    };
    setHighlights([...highlights, gaoLiangXinXi]);
    if (cfiRange) {
      yingYongGaoLiang(cfiRange, false, yanSe);
    }
    huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
    showSuccess('已添加高亮标记');
    onClose();
  }, [onClose, yingYongGaoLiang, huaCiJiaoHuRef, highlights]);

  const handleDeleteHighlight = useCallback((id: string) => {
    const deletedHighlight = highlights.find(h => h.id === id);
    
    const rendition = renditionRef?.current;
    console.log('删除高亮 - rendition:', !!rendition, 'cfiRange:', deletedHighlight?.cfiRange);

    if (rendition && deletedHighlight?.cfiRange) {
      try {
        rendition.annotations.remove(deletedHighlight.cfiRange, 'highlight');
      } catch (error) {
        console.error('清除高亮失败:', error);
      }
    }

    setHighlights(prev => prev.filter(h => h.id !== id));
    showSuccess('已删除高亮');

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
  }, [highlights, renditionRef]);

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
    highlights,
    handleGenerateQuestion,
    handleHighlight,
    handleDeleteHighlight,
    handleCopy,
  };
}
