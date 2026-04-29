// @审计已完成
// EPUB 阅读器翻页和页码 Hook

import { useRef, useState, useCallback } from 'react';
import type { Rendition, NavItem } from 'epubjs';
import { showWarning, showError } from '@shared/utils/common/ToastGongJu';

interface UseEPUBReaderFanYeHeYeMaProps {
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  saveImmediately?: (loc: string | number) => void;
  onFanYeCuoWu?: (cuoWu: string) => void;
  onFanYeJiaZaiZhong?: (jiaZai: boolean) => void;
}

export function useEPUBReaderFanYeHeYeMa({
  setYeMaXinXi,
  setLocation,
  tiaoDaoShangYiGe,
  tiaoDaoXiaYiGe,
  externalRenditionRef,
  saveImmediately,
  onFanYeCuoWu,
  onFanYeJiaZaiZhong,
}: UseEPUBReaderFanYeHeYeMaProps) {
  const _renditionRef = useRef<Rendition | undefined>(undefined);
  const renditionRef = externalRenditionRef || _renditionRef;
  const tocRef = useRef<NavItem[]>([]);
  const [renditionJiuXu, setRenditionJiuXu] = useState(false);
  const [fanYeJiaZaiZhong, setFanYeJiaZaiZhong] = useState(false);

  const gengXinYeMaXinXi = useCallback(() => {
    if (renditionRef.current && tocRef.current.length > 0) {
      try {
        const location = renditionRef.current.location;
        if (!location?.start) {
          return;
        }
        const { displayed, href } = location.start;
        const currentHrefBase = href.split('#')[0];
        let chapter: NavItem | undefined;
        for (let i = tocRef.current.length - 1; i >= 0; i--) {
          const item = tocRef.current[i];
          const itemHrefBase = item.href.split('#')[0];
          if (currentHrefBase >= itemHrefBase) {
            chapter = item;
            break;
          }
        }
        const chapterName = chapter ? chapter.label.trim() : '未知章节';
        setYeMaXinXi(`第 ${displayed.page} / ${displayed.total} 页 - ${chapterName}`);
      } catch (error) { 
        console.error('更新页码信息出错:', error);
        setYeMaXinXi(''); 
      }
    }
  }, [setYeMaXinXi]);

  const handleNextPage = useCallback(() => {
    console.log('[翻页] handleNextPage 开始执行');
    const rendition = renditionRef.current;
    if (!rendition) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    if (fanYeJiaZaiZhong) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    setFanYeJiaZaiZhong(true);
    onFanYeJiaZaiZhong?.(true);

    const currentLocation = rendition.location;
    const currentIndex = currentLocation?.start?.index ?? 0;
    console.log('[翻页] 当前章节索引:', currentIndex, '位置:', currentLocation?.start?.href);

    try {
      const book = (rendition as any).book;
      const spine = book?.spine;
      const spineItems = spine?.items?.length;
      
      if (!spine || !spineItems) {
        console.log('[翻页] spine 不存在或为空，总章节数:', spineItems, '尝试使用 rendition.next()');
        rendition.next().then(() => {
          finishPageTurn();
        }).catch((error) => {
          handlePageTurnError(error);
        });
        return;
      }

      if (currentIndex >= spineItems - 1) {
        console.log('[翻页] 已经是最后一章');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是最后一页');
        onFanYeCuoWu?.('已经是最后一页');
        return;
      }

      const nextIndex = currentIndex + 1;
      const nextSection = spine.get(nextIndex);
      
      console.log('[翻页] 下一章节索引:', nextIndex, '总章节数:', spineItems, '章节:', nextSection?.href);
      
      if (nextSection) {
        console.log('[翻页] 使用 rendition.display() 跳转到:', nextSection.href);
        rendition.display(nextSection.href).then(() => {
          console.log('[翻页] rendition.display() 已完成，等待渲染...');
          setTimeout(() => {
            const newLoc = rendition.location?.start?.href;
            console.log('[翻页] 渲染后位置:', newLoc);
            if (newLoc === currentLocation?.start?.href) {
              console.log('[翻页] 位置未变化，强制刷新');
              rendition.queueVisibilityManager?.visibilities?.forEach?.((v: any) => v.update?.());
            }
            finishPageTurn();
          }, 50);
        }).catch((error) => {
          console.log('[翻页] display 失败，尝试 rendition.next()', error);
          rendition.next().then(() => {
            setTimeout(() => finishPageTurn(), 50);
          }).catch(handlePageTurnError);
        });
      } else {
        console.log('[翻页] 没有更多章节，尝试 rendition.next()');
        rendition.next().then(() => {
          setTimeout(() => finishPageTurn(), 50);
        }).catch(handlePageTurnError);
      }
    } catch (e) {
      console.log('[翻页] 获取 spine 失败，尝试 rendition.next()', e);
      rendition.next().then(() => {
        setTimeout(() => finishPageTurn(), 50);
      }).catch(handlePageTurnError);
    }

    const finishPageTurn = () => {
      const prevCfi = rendition.location?.start?.cfi;
      const prevHref = rendition.location?.start?.href;
      console.log('[翻页] 完成翻页 - CFI:', prevCfi, 'href:', prevHref);
      
      if (prevHref === currentLocation?.start?.href && currentLocation?.start?.href) {
        console.log('[翻页] 警告：位置未实际改变，可能需要手动刷新');
      }
      
      const newCfi = rendition.location?.start?.cfi;
      const newHref = rendition.location?.start?.href;
      console.log('[翻页] 完成翻页 - CFI:', newCfi, 'href:', newHref);
      
      if (newCfi) {
        setLocation(newCfi);
      }
      
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      gengXinYeMaXinXi();
      
      const currentHref = rendition.location?.start?.href || '';
      if (currentHref && saveImmediately) {
        saveImmediately(currentHref);
      }
    };

    const handlePageTurnError = (error: any) => {
      console.log('[翻页] 翻页失败:', error);
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    };
  }, [gengXinYeMaXinXi, saveImmediately, fanYeJiaZaiZhong, onFanYeCuoWu, onFanYeJiaZaiZhong, setLocation]);

  const handlePrevPage = useCallback(() => {
    if (!renditionRef.current) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    if (fanYeJiaZaiZhong) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    const rendition = renditionRef.current;
    const currentLocation = rendition.location;
    const currentDisplayed = currentLocation?.start?.displayed;
    const currentPage = currentDisplayed?.page;
    const totalPages = currentDisplayed?.total;

    const fanYeDaoZhangJie = () => {
      setFanYeJiaZaiZhong(true);
      onFanYeJiaZaiZhong?.(true);

      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const prevIndex = currentLocation.start.index - 1;
          const prevSection = spine.get(prevIndex);
          
          if (prevSection) {
            rendition.display(prevSection.href).then(() => {
              setFanYeJiaZaiZhong(false);
              onFanYeJiaZaiZhong?.(false);
              gengXinYeMaXinXi();
              const currentHref = rendition.location?.start?.href || '';
              if (currentHref && saveImmediately) {
                saveImmediately(currentHref);
              }
            }).catch((err) => {
              setFanYeJiaZaiZhong(false);
              onFanYeJiaZaiZhong?.(false);
              const cuoWu = `跳转上一章节失败：${err instanceof Error ? err.message : '未知错误'}`;
              console.error('[翻页错误]', cuoWu);
              showError(cuoWu);
              onFanYeCuoWu?.(cuoWu);
            });
          } else {
            setFanYeJiaZaiZhong(false);
            onFanYeJiaZaiZhong?.(false);
            showWarning('已经是第一页');
            onFanYeCuoWu?.('已经是第一页');
          }
        }
      } catch (e) {
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        const cuoWu = `跳转上一章节失败：${e instanceof Error ? e.message : '未知错误'}`;
        console.error('[翻页错误]', cuoWu);
        showError(cuoWu);
        onFanYeCuoWu?.(cuoWu);
      }
    };

    if (currentPage === totalPages) {
      fanYeDaoZhangJie();
    } else {
      setFanYeJiaZaiZhong(true);
      onFanYeJiaZaiZhong?.(true);

      rendition.prev().then(() => {
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        gengXinYeMaXinXi();
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => {
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
        console.error('[翻页错误]', cuoWu);
        showError(cuoWu);
        onFanYeCuoWu?.(cuoWu);
      });
    }
  }, [gengXinYeMaXinXi, saveImmediately, fanYeJiaZaiZhong, onFanYeCuoWu, onFanYeJiaZaiZhong]);

  const handleShangYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoShangYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoShangYiGe, setLocation]);

  const handleXiaYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoXiaYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoXiaYiGe, setLocation]);

  const handleLocationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi);
    gengXinYeMaXinXi();
  }, [setLocation, gengXinYeMaXinXi]);

  return {
    renditionRef,
    renditionJiuXu,
    setRenditionJiuXu,
    tocRef,
    gengXinYeMaXinXi,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
  };
}
