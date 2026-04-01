// @审计已完成
// 划线出题 Hook - AI出题、高亮标记、复制文字

import { useState, useCallback, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export interface GaoLiangXinXi {
  text: string;
  cfiRange: string;
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
  huaCiJiaoHuRef?: HuaCiJiaoHuWenJian;
}

export function useHuaXianChuTi({
  userId,
  bookId,
  chapterId,
  onClose,
  renditionRef,
  huaCiJiaoHuRef,
}: UseHuaXianChuTiProps) {
  const [generating, setGenerating] = useState(false);
  const storageKey = `gaoliang_${userId}_${bookId}_${chapterId}`;
  const [highlights, setHighlights] = useLocalStorageState<GaoLiangXinXi[]>(storageKey, { defaultValue: [] });

  const yingYongGaoLiang = useCallback((cfiRange: string) => {
    if (!renditionRef?.current) return;
    try {
      renditionRef.current.annotations.highlight(cfiRange, {}, () => {}, 'highlight', {
        'background-color': 'rgba(255, 235, 59, 0.5)',
      });
    } catch (error) {
      console.error('应用高亮失败:', error);
    }
  }, [renditionRef]);

  useEffect(() => {
    const rendition = renditionRef?.current;
    if (!rendition) return;
    const handleRendered = () => {
      highlights.forEach(h => {
        if (h.cfiRange) {
          try {
            rendition.annotations.highlight(h.cfiRange, {}, () => {}, 'highlight', {
              'background-color': 'rgba(255, 235, 59, 0.5)',
            });
          } catch (error) {
            console.error('渲染高亮失败:', error);
          }
        }
      });
    };
    rendition.on('rendered', handleRendered);
    return () => {
      rendition.off('rendered', handleRendered);
    };
  }, [renditionRef, highlights]);

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

  const handleHighlight = useCallback((selectedText: string) => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    const gaoLiangXinXi: GaoLiangXinXi = { text: selectedText, cfiRange: cfiRange || '' };
    setHighlights(prev => [...prev, gaoLiangXinXi]);
    if (cfiRange) {
      yingYongGaoLiang(cfiRange);
    }
    huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
    showSuccess('已添加高亮标记');
    onClose();
  }, [onClose, yingYongGaoLiang, huaCiJiaoHuRef]);

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
    handleCopy,
  };
}
