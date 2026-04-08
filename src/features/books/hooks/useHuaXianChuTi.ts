// @审计已完成
// 划线出题 Hook - AI出题、划线标记、马克笔、复制文字
// 划线渲染采用双轨制：SVG overlay（位置追踪+点击检测） + DOM span 包裹（CSS 样式）
// 支持两种标记类型：underline（下划线）/ marker（马克笔高亮）

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Rendition } from 'epubjs';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { annotationService, type HuaXianXinXi } from '@shared/services/annotationService';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export type HuaXianYanSe = 'yellow' | 'green' | 'blue' | 'pink';

export type BiaoJiLeiXing = 'underline' | 'marker';

interface HuaCiJiaoHuWenJian {
  setCurrentCfiRange: (cfiRange: string | null) => void;
  getCurrentCfiRange: () => string | null;
}

interface UseHuaXianChuTiProps {
  userId: string;
  bookId: string;
  chapterId?: string;
  onClose: () => void;
  renditionRef?: React.RefObject<Rendition | undefined>;
  bookRef?: React.RefObject<any>;
  huaCiJiaoHuRef?: HuaCiJiaoHuWenJian;
}

const YAN_SE_PEI_ZHI: Record<HuaXianYanSe, string> = {
  yellow: '#F5C842',
  green: '#4ADE80',
  blue: '#5E94FF',
  pink: '#F472B6',
};

const HL_CLASS_MAP: Record<HuaXianYanSe, string> = {
  yellow: 'hl-underline-yellow',
  green: 'hl-underline-green',
  blue: 'hl-underline-blue',
  pink: 'hl-underline-pink',
};

const MK_CLASS_MAP: Record<HuaXianYanSe, string> = {
  yellow: 'mk-marker-yellow',
  green: 'mk-marker-green',
  blue: 'mk-marker-blue',
  pink: 'mk-marker-pink',
};

function baoGuaSpan(rendition: Rendition, cfiRange: string, className: string, id?: string) {
  try {
    const range = rendition.getRange(cfiRange);
    if (!range || range.collapsed) return;
    const doc = range.commonAncestorContainer.ownerDocument as Document;
    const span = doc.createElement('span');
    span.className = className;
    span.setAttribute('data-biaoji', 'true');
    span.setAttribute('data-cfi', cfiRange);
    if (id) span.setAttribute('data-huaxian-id', id);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      range.surroundContents(span);
      return;
    }
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  } catch (e) {
  }
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
  const [huaXianList, setHuaXianList] = useState<HuaXianXinXi[]>([]);
  const [loading, setLoading] = useState(true);
  const applyBiaoJiRef = useRef<(() => void) | null>(null);
  const huaXianListRef = useRef<HuaXianXinXi[]>([]);

  useEffect(() => {
    annotationService.setUserId(userId);
  }, [userId]);

  const huoQuBiaoZhu = useCallback(async () => {
    console.log('从后端获取划线数据，bookId:', bookId);
    const { annotations, error } = await annotationService.getAnnotationsByBook(bookId);
    if (error) {
      console.error('获取划线失败:', error);
      return;
    }
    console.log('从后端获取到的划线数据:', annotations);
    setHuaXianList(annotations);
    huaXianListRef.current = annotations;
    setLoading(false);
  }, [bookId]);

  useEffect(() => {
    huoQuBiaoZhu();
  }, [huoQuBiaoZhu]);

  useEffect(() => {
    huaXianListRef.current = huaXianList;
  }, [huaXianList]);

  const yingYongBiaoJi = useCallback(async (cfiRange: string, qingChuJiu: boolean = false, yanSe: HuaXianYanSe = 'blue', leiXing: BiaoJiLeiXing = 'underline', id?: string) => {
    const rendition = renditionRef?.current;
    if (!rendition) {
      console.error('应用标记失败: rendition 不存在');
      return;
    }
    if (qingChuJiu) {
      rendition.annotations.remove('highlight');
    }
    const se = YAN_SE_PEI_ZHI[yanSe];
    const cls = leiXing === 'marker' ? MK_CLASS_MAP[yanSe] : HL_CLASS_MAP[yanSe];
    const svgStyle = { fill: se, 'fill-opacity': leiXing === 'marker' ? '0.25' : '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
    rendition.annotations.add('highlight', cfiRange, {}, () => {}, cls, svgStyle);
    baoGuaSpan(rendition, cfiRange, cls, id);
  }, [renditionRef]);

  useEffect(() => {
    console.log('useHuaXianChuTi useEffect 执行', { userId, bookId });
    let rendition = renditionRef?.current;
    let checkRenditionInterval: ReturnType<typeof setInterval> | null = null;
    
    if (!rendition) {
      console.log('rendition 不存在，开始轮询');
      checkRenditionInterval = setInterval(() => {
        rendition = renditionRef?.current;
        if (rendition) {
          console.log('rendition 已获取成功，设置监听器');
          if (checkRenditionInterval) {
            clearInterval(checkRenditionInterval);
            checkRenditionInterval = null;
          }
          applyBiaoJiRef.current = setupRenditionListener(rendition);
        }
      }, 100);
    } else {
      console.log('rendition 已存在，直接设置监听器');
      applyBiaoJiRef.current = setupRenditionListener(rendition);
    }

    function setupRenditionListener(r: typeof rendition) {
      let isApplying = false;
      
      const qingLiDOMBiaoJi = () => {
        try {
          const contents = r.getContents();
          if (contents && contents[0]) {
            const doc = contents[0].window?.document;
            if (doc) {
              const spans = doc.querySelectorAll('[data-biaoji="true"]');
              spans.forEach(span => {
                if (span.parentNode) {
                  const parent = span.parentNode;
                  while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                  }
                  parent.removeChild(span);
                }
              });
              const sousuoGaoLiang = doc.querySelectorAll('.search-highlight');
              console.log('搜索高亮清理: 找到', sousuoGaoLiang.length, '个');
              sousuoGaoLiang.forEach(span => {
                if (span.parentNode) {
                  const parent = span.parentNode;
                  while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                  }
                  parent.removeChild(span);
                }
              });
            }
          }
        } catch (e) {
          console.warn('清理 DOM 标记失败:', e);
        }
      };

      const applyBiaoJi = () => {
        if (isApplying) {
          console.log('applyBiaoJi 正在执行中，跳过本次调用');
          return;
        }
        console.log('applyBiaoJi 被调用');
        if (!r) return;
        isApplying = true;
        try {
          r.annotations.remove('highlight');
          qingLiDOMBiaoJi();
          
          const currentData = huaXianListRef.current;
          console.log('当前划线数据:', { count: currentData.length, data: currentData });
          
          if (currentData.length === 0) {
            console.log('没有划线数据可应用');
            return;
          }
          
          const quChong = currentData.filter((h, index, self) =>
            index === self.findIndex((item) => item.cfiRange === h.cfiRange && item.leiXing === h.leiXing)
          );
          console.log('去重后的划线数量:', quChong.length);
          quChong.forEach((h, idx) => {
            console.log(`应用划线 ${idx + 1}/${quChong.length}:`, h.text?.substring(0, 30));
            if (!h.cfiRange) {
              console.warn('划线没有 cfiRange，跳过:', h);
              return;
            }
            const se = YAN_SE_PEI_ZHI[h.yanSe] || YAN_SE_PEI_ZHI.blue;
            const lx = h.leiXing || 'underline';
            const cls = lx === 'marker' ? (MK_CLASS_MAP[h.yanSe] || MK_CLASS_MAP.yellow) : (HL_CLASS_MAP[h.yanSe] || HL_CLASS_MAP.blue);
            const svgStyle = { fill: se, 'fill-opacity': lx === 'marker' ? '0.25' : '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
            try {
              r.annotations.add('highlight', h.cfiRange, {}, () => {}, cls, svgStyle);
              console.log('annotations.add 成功');
            } catch (e) { console.warn('annotations.add 失败:', e, 'CFI:', h.cfiRange); }
            try {
              baoGuaSpan(r, h.cfiRange, cls, h.id);
              console.log('baoGuaSpan 成功');
            } catch (e) { }
          });
        } finally {
          isApplying = false;
        }
      };
      r.on('rendered', applyBiaoJi);
      requestAnimationFrame(() => applyBiaoJi());
      return applyBiaoJi;
    }

    return () => {
      if (checkRenditionInterval) {
        clearInterval(checkRenditionInterval);
      }
      if (rendition && applyBiaoJiRef.current) {
        rendition.off('rendered', applyBiaoJiRef.current);
      }
    };
  }, [userId, bookId, chapterId, renditionRef]);

  useEffect(() => {
    console.log('huaXianList 已更新，数量:', huaXianList.length);
    if (applyBiaoJiRef.current) {
      console.log('huaXianList 变化，重新应用划线');
      applyBiaoJiRef.current();
    }
  }, [huaXianList]);

  const handleGenerateQuestion = useCallback(async (selectedText: string) => {
    if (!selectedText.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await aiService.generateFromSelectionAuto(chapterId || '', selectedText, 1);
      if (error) {
        showError('AI 出题失败：' + error);
        return;
      }
      showSuccess(`已生成 1 道${data?.questionType || ''}题目`);
      onClose();
    } finally {
      setGenerating(false);
    }
  }, [chapterId, onClose]);

  const handleHuaXian = useCallback(async (selectedText: string, yanSe: HuaXianYanSe = 'blue', beiZhu: string = '') => {
    console.log('handleHuaXian 被调用', { selectedText, yanSe, beiZhu });
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    
    const existingUnderline = huaXianList.find(h => h.cfiRange === cfiRange && h.leiXing === 'underline');
    if (existingUnderline) {
      showError('该文本已有划线，请先删除后再重新操作');
      onClose();
      return;
    }

    const { annotation, error } = await annotationService.createAnnotation({
      bookId,
      text: selectedText,
      cfiRange,
      yanSe,
      leiXing: 'underline',
      beiZhu,
    });

    if (error) {
      showError('添加划线失败：' + error.message);
      return;
    }

    if (annotation) {
      setHuaXianList(prev => [...prev, annotation]);
      huaXianListRef.current = [...huaXianList, annotation];
      
      if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'underline', annotation.id);
      huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
      showSuccess('已添加划线');
      onClose();
    }
  }, [onClose, yingYongBiaoJi, huaCiJiaoHuRef, huaXianList, bookId]);

  const handleMaKeBi = useCallback(async (selectedText: string, yanSe: HuaXianYanSe = 'yellow', beiZhu: string = '') => {
    console.log('handleMaKeBi 被调用', { selectedText, yanSe, beiZhu });
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    
    const existingMarker = huaXianList.find(h => h.cfiRange === cfiRange && h.leiXing === 'marker');
    if (existingMarker) {
      showError('该文本已有高亮，请先删除后再重新操作');
      onClose();
      return;
    }

    const { annotation, error } = await annotationService.createAnnotation({
      bookId,
      text: selectedText,
      cfiRange,
      yanSe,
      leiXing: 'marker',
      beiZhu,
    });

    if (error) {
      showError('添加高亮失败：' + error.message);
      return;
    }

    if (annotation) {
      setHuaXianList(prev => [...prev, annotation]);
      huaXianListRef.current = [...huaXianList, annotation];
      
      if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'marker', annotation.id);
      huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
      showSuccess('已添加马克笔');
      onClose();
    }
  }, [onClose, yingYongBiaoJi, huaCiJiaoHuRef, huaXianList, bookId]);

  const handleDeleteHuaXian = useCallback(async (id: string) => {
    const deleted = huaXianList.find(h => h.id === id);
    const rendition = renditionRef?.current;
    
    if (rendition && deleted?.cfiRange) {
      try {
        rendition.annotations.remove(deleted.cfiRange, 'highlight');
      } catch (error) {
        console.warn('清除标记失败:', error);
      }
      try {
        const contents = rendition.getContents();
        if (contents && contents[0]) {
          const doc = contents[0].window?.document;
          if (doc) {
            const span = doc.querySelector(`[data-huaxian-id="${id}"]`);
            if (span && span.parentNode) {
              const parent = span.parentNode;
              while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
              }
              parent.removeChild(span);
            }
          }
        }
      } catch (error) {
        console.warn('移除 DOM 标记失败:', error);
      }
    }

    const { error } = await annotationService.deleteAnnotation(id);
    if (error) {
      showError('删除标记失败：' + error.message);
      return;
    }

    setHuaXianList(prev => prev.filter(h => h.id !== id));
    huaXianListRef.current = huaXianList.filter(h => h.id !== id);
    showSuccess('已删除标记');
  }, [huaXianList, renditionRef]);

  const handleChangeYanSe = useCallback(async (id: string, yanSe: HuaXianYanSe) => {
    const target = huaXianList.find(h => h.id === id);
    if (!target) return;

    const { annotation, error } = await annotationService.updateAnnotation(id, { yanSe });
    if (error) {
      showError('更新颜色失败：' + error.message);
      return;
    }

    if (annotation) {
      const rendition = renditionRef?.current;
      if (rendition && target.cfiRange) {
        const se = YAN_SE_PEI_ZHI[yanSe];
        const cls = target.leiXing === 'marker' ? MK_CLASS_MAP[yanSe] : HL_CLASS_MAP[yanSe];
        const span = rendition.getContents()?.[0]?.window?.document?.querySelector(`[data-huaxian-id="${id}"]`);
        if (span) {
          span.className = cls;
          span.setAttribute('data-biaoji', 'true');
        }
      }
      setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, yanSe } : h));
    }
  }, [huaXianList, renditionRef]);

  const handleChangeLeiXing = useCallback(async (id: string, leiXing: 'underline' | 'marker') => {
    const target = huaXianList.find(h => h.id === id);
    if (!target) return;

    const { annotation, error } = await annotationService.updateAnnotation(id, { leiXing });
    if (error) {
      showError('更新类型失败：' + error.message);
      return;
    }

    if (annotation) {
      const rendition = renditionRef?.current;
      if (rendition && target.cfiRange) {
        const se = YAN_SE_PEI_ZHI[target.yanSe];
        const cls = leiXing === 'marker' ? MK_CLASS_MAP[target.yanSe] : HL_CLASS_MAP[target.yanSe];
        const span = rendition.getContents()?.[0]?.window?.document?.querySelector(`[data-huaxian-id="${id}"]`);
        if (span) {
          span.className = cls;
          span.setAttribute('data-biaoji', 'true');
        }
      }
      setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, leiXing } : h));
    }
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
    loading,
    handleGenerateQuestion,
    handleHuaXian,
    handleMaKeBi,
    handleDeleteHuaXian,
    handleChangeYanSe,
    handleChangeLeiXing,
    handleCopy,
    refresh: huoQuBiaoZhu,
  };
}
