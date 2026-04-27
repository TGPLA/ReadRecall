// @审计已完成
// 划线出题 Hook - AI出题、划线标记、马克笔、复制文字
// 划线渲染采用双轨制：SVG overlay（位置追踪+点击检测） + DOM span 包裹（CSS 样式）
// 支持两种标记类型：underline（下划线）/ marker（马克笔高亮）

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Rendition } from 'epubjs';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { annotationService, type HuaXianXinXi } from '@shared/services/annotationService';

export type HuaXianYanSe = 'yellow' | 'green' | 'blue' | 'pink';

interface HuaCiJiaoHuWenJian {
  setCurrentCfiRange: (cfiRange: string | null) => void;
  getCurrentCfiRange: () => string | null;
}

interface UseHuaXianChuTiProps {
  userId: string;
  bookId: string;
  chapterId?: string;
  onClose: () => void;
  onQuestionGenerated?: () => void;
  renditionRef?: React.RefObject<Rendition | undefined>;
  bookRef?: React.RefObject<any>;
  huaCiJiaoHuRef?: HuaCiJiaoHuWenJian;
  activeHuaXian?: HuaXianXinXi | null;
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

function xiuFuCfiGeShi(cfiRange: string): string {
  // CFI格式已经是正确的，不需要修复
  // 保持原始格式：epubcfi(/base!path,start,end)
  return cfiRange;
}

function baoGuaSpan(rendition: Rendition, cfiRange: string, className: string, id?: string) {
  // 检查渲染是否完成
  const contents = rendition.getContents();
  if (!contents || contents.length === 0) {
    console.warn('[baoGuaSpan] 渲染未完成，跳过');
    return;
  }
  
  // 先修复CFI格式
  const fixedCfi = xiuFuCfiGeShi(cfiRange);
  try {
    const range = rendition.getRange(fixedCfi);
    if (!range || range.collapsed) {
      console.warn('[baoGuaSpan] getRange 返回无效 range, cfiRange:', cfiRange);
      return;
    }
    console.log('[baoGuaSpan] getRange 成功, startContainer:', range.startContainer?.nodeType, 'endContainer:', range.endContainer?.nodeType);
    console.log('[baoGuaSpan] startOffset:', range.startOffset, 'endOffset:', range.endOffset);
    console.log('[baoGuaSpan] startContainer内容:', range.startContainer?.textContent?.substring(0, 30));
    console.log('[baoGuaSpan] endContainer内容:', range.endContainer?.textContent?.substring(0, 30));
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
      console.log('[baoGuaSpan] 同节点文本选区，使用surroundContents');
      return;
    }
    // 跨节点选区：使用更安全的方法
    console.log('[baoGuaSpan] 跨节点选区,startContainerType:', startContainer?.nodeType, 'endContainerType:', endContainer?.nodeType);
    try {
      // 保存起始位置（在extractContents之前）
      const originalStartContainer = range.startContainer;
      const originalStartOffset = range.startOffset;
      
      const fragment = range.extractContents();
      span.appendChild(fragment);
      
      // 在原始起始位置创建新range插入span
      const insertRange = doc.createRange();
      insertRange.setStart(originalStartContainer, originalStartOffset);
      insertRange.setEnd(originalStartContainer, originalStartOffset);
      insertRange.insertNode(span);
      
      // 验证span是否插入成功
      console.log('[baoGuaSpan] span元素:', span.outerHTML?.substring(0, 100));
      console.log('[baoGuaSpan] span父元素:', span.parentNode?.nodeName);
      console.log('[baoGuaSpan] 跨节点处理完成');
    } catch (e) {
      console.warn('[baoGuaSpan] 跨节点处理失败:', e);
    }
  } catch (e) {
    console.warn('baoGuaSpan 失败:', e);
  }
}

export function useHuaXianChuTi({
  userId,
  bookId,
  chapterId,
  onClose,
  _onQuestionGenerated,
  renditionRef,
  _bookRef,
  huaCiJiaoHuRef,
  _activeHuaXian,
}: UseHuaXianChuTiProps) {
  const [huaXianList, setHuaXianList] = useState<HuaXianXinXi[]>([]);
  const [loading, setLoading] = useState(true);
  const applyBiaoJiRef = useRef<(() => void) | null>(null);
  const huaXianListRef = useRef<HuaXianXinXi[]>([]);

  useEffect(() => {
    annotationService.setUserId(userId);
  }, [userId]);

  const huoQuBiaoZhu = useCallback(async () => {
    const { annotations, error } = await annotationService.getAnnotationsByBook(bookId);
    if (error) {
      console.error('获取划线失败:', error);
      return;
    }
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

  const yingYongBiaoJi = useCallback(async (cfiRange: string, qingChuJiu: boolean = false, yanSe: HuaXianYanSe = 'blue', id?: string) => {
    console.log('[yingYongBiaoJi] 收到CFI:', cfiRange);
    const fixedCfi = xiuFuCfiGeShi(cfiRange);
    console.log('[yingYongBiaoJi] 修复后CFI:', fixedCfi);
    const rendition = renditionRef?.current;
    if (!rendition) {
      console.error('应用标记失败: rendition 不存在');
      return;
    }
    
    // 检查渲染是否完成
    const contents = rendition.getContents();
    if (!contents || contents.length === 0) {
      console.warn('[yingYongBiaoJi] 渲染未完成，跳过');
      return;
    }
    
    let range = null;
    try {
      range = rendition.getRange(fixedCfi);
      console.log('[yingYongBiaoJi] getRange结果:', range ? '成功' : '失败', range?.collapsed ? '(collapsed)' : '');
    } catch (e) {
      console.warn('getRange 失败:', e);
    }
    
    if (!range || range.collapsed) {
      console.warn('CFI无效，跳过应用标记:', cfiRange);
      return;
    }
    
    if (qingChuJiu) {
      rendition.annotations.remove('highlight');
    }
    const _se = YAN_SE_PEI_ZHI[yanSe];
    const cls = HL_CLASS_MAP[yanSe];
    const svgStyle = { fill: se, 'fill-opacity': '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
    try {
      rendition.annotations.add('highlight', fixedCfi, {}, () => {}, cls, svgStyle);
    } catch (e) {
      console.warn('annotations.add 失败:', e, 'CFI:', fixedCfi);
    }
    baoGuaSpan(rendition, fixedCfi, cls, id);
  }, [renditionRef]);

  useEffect(() => {
    let rendition = renditionRef?.current;
    let checkRenditionInterval: ReturnType<typeof setInterval> | null = null;
    
    if (!rendition) {
      checkRenditionInterval = setInterval(() => {
        rendition = renditionRef?.current;
        if (rendition) {
          if (checkRenditionInterval) {
            clearInterval(checkRenditionInterval);
            checkRenditionInterval = null;
          }
          applyBiaoJiRef.current = setupRenditionListener(rendition);
        }
      }, 100);
    } else {
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
        if (isApplying) return;
        if (!r) return;
        
        // 检查渲染是否完成
        const contents = r.getContents();
        if (!contents || contents.length === 0) {
          console.warn('[applyBiaoJi] 渲染未完成，推迟到 rendered 事件');
          return;
        }
        
        isApplying = true;
        try {
          r.annotations.remove('highlight');
          qingLiDOMBiaoJi();
          
          const currentData = huaXianListRef.current;
          if (currentData.length === 0) return;
          
          const quChong = currentData.filter((h, index, self) =>
            index === self.findIndex((item) => item.cfiRange === h.cfiRange && item.leiXing === h.leiXing)
          );
          quChong.forEach((h) => {
            if (!h.cfiRange) return;
            
            // 修复CFI格式
            const fixedCfi = xiuFuCfiGeShi(h.cfiRange);
            let range = null;
            try {
              range = r.getRange(fixedCfi);
            } catch (e) {
              console.warn('getRange 失败:', e);
            }
            if (!range) {
              console.warn('已有划线CFI无效，跳过:', h.cfiRange);
              return;
            }
            
            const se = YAN_SE_PEI_ZHI[h.yanSe] || YAN_SE_PEI_ZHI.blue;
            const cls = HL_CLASS_MAP[h.yanSe] || HL_CLASS_MAP.blue;
            const svgStyle = { fill: se, 'fill-opacity': '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
            try {
              r.annotations.add('highlight', fixedCfi, {}, () => {}, cls, svgStyle);
            } catch (e) { console.warn('annotations.add 失败:', e, 'CFI:', fixedCfi); }
            try {
              baoGuaSpan(r, fixedCfi, cls, h.id);
            } catch (_e) { /* 忽略单行高亮失败 */ }
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
    if (applyBiaoJiRef.current) {
      applyBiaoJiRef.current();
    }
  }, [huaXianList]);

  const handleHuaXian = useCallback(async (selectedText: string, yanSe: HuaXianYanSe = 'blue', beiZhu: string = '') => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    console.log('[handleHuaXian] 收到CFI:', cfiRange);
    console.log('[handleHuaXian] 选中文本:', selectedText);
    
    // 检查是否已存在相同的划线
    const fixedCfi = xiuFuCfiGeShi(cfiRange);
    const existingUnderline = huaXianList.find(h => h.cfiRange === fixedCfi);
    if (existingUnderline) {
      showError('该文本已有划线，请先删除后再重新操作');
      onClose();
      return;
    }

    const { annotation, error } = await annotationService.createAnnotation({
      bookId,
      text: selectedText,
      cfiRange: fixedCfi,
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
      huaXianListRef.current = [...huaXianListRef.current, annotation];
      
      if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, annotation.id);
      huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
      showSuccess('已添加划线');
      onClose();
    }
  }, [onClose, yingYongBiaoJi, huaCiJiaoHuRef, huaXianList, bookId]);

  const handleDeleteHuaXian = useCallback(async (id: string) => {
    const deleted = huaXianList.find(h => h.id === id);
    const rendition = renditionRef?.current;
    
    if (rendition && deleted?.cfiRange) {
      // 直接使用原始CFI（3部分格式是正确的）
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
    huaXianListRef.current = huaXianListRef.current.filter(h => h.id !== id);
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
        const _se = YAN_SE_PEI_ZHI[yanSe];
        const cls = HL_CLASS_MAP[yanSe];
        const span = rendition.getContents()?.[0]?.window?.document?.querySelector(`[data-huaxian-id="${id}"]`);
        if (span) {
          span.className = cls;
          span.setAttribute('data-biaoji', 'true');
        }
      }
      setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, yanSe } : h));
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
    huaXianList,
    loading,
    handleHuaXian,
    handleDeleteHuaXian,
    handleChangeYanSe,
    handleCopy,
    refresh: huoQuBiaoZhu,
  };
}