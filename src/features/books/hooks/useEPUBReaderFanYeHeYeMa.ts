// @审计已完成
// EPUB 阅读器翻页和页码 Hook

import { useRef, useState, useCallback } from 'react';
import type { Rendition, NavItem } from 'epubjs';

interface UseEPUBReaderFanYeHeYeMaProps {
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  saveImmediately?: (loc: string | number) => void;
}

export function useEPUBReaderFanYeHeYeMa({
  setYeMaXinXi,
  setLocation,
  tiaoDaoShangYiGe,
  tiaoDaoXiaYiGe,
  externalRenditionRef,
  saveImmediately,
}: UseEPUBReaderFanYeHeYeMaProps) {
  const renditionRef = externalRenditionRef || useRef<Rendition | undefined>(undefined);
  const tocRef = useRef<NavItem[]>([]);
  const [renditionJiuXu, setRenditionJiuXu] = useState(false);

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
    console.log('[调试] handleNextPage 被调用');
    const rendition = renditionRef.current;
    if (!rendition) {
      console.log('[调试] handleNextPage: rendition 不存在');
      return;
    }
    
    const currentLocation = rendition.location;
    console.log('[调试] handleNextPage: 当前位置', currentLocation);
    
    const currentDisplayed = currentLocation?.start?.displayed;
    console.log('[调试] handleNextPage: 当前页码信息', currentDisplayed);
    
    const currentPage = currentDisplayed?.page;
    const currentHref = currentLocation?.start?.href;
    
    console.log('[调试] handleNextPage: 当前页码', currentPage, 'href', currentHref);
    
    // 关键判断：如果是章节第一页，直接跳转到下一章节
    if (currentPage === 1) {
      console.log('[调试] handleNextPage: 是章节第一页，直接跳转到下一章节');
      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const nextIndex = currentLocation.start.index + 1;
          const nextSection = spine.get(nextIndex);
          console.log('[调试] handleNextPage: 下一章节索引', nextIndex, '章节信息', nextSection);
          
          if (nextSection) {
            console.log('[调试] handleNextPage: 跳转到下一章节', nextSection.href);
            rendition.display(nextSection.href).then(() => {
              console.log('[调试] handleNextPage: 跳转到下一章节成功');
              const currentHref = rendition.location?.start?.href || '';
              if (currentHref && saveImmediately) {
                saveImmediately(currentHref);
              }
            }).catch((err) => {
              console.error('[调试] handleNextPage: 跳转到下一章节失败', err);
            });
          } else {
            console.log('[调试] handleNextPage: 已经是最后一章了');
          }
        }
      } catch (e) {
        console.error('[调试] handleNextPage: 尝试跳转到下一章节出错', e);
      }
    } else {
      // 不是第一页，正常翻页
      console.log('[调试] handleNextPage: 不是第一页，正常翻页');
      rendition.next().then(() => {
        console.log('[调试] handleNextPage: 翻页成功');
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => { 
        console.error('[调试] handleNextPage: 下一页出错:', error); 
      });
    }
  }, [saveImmediately]);

  const handlePrevPage = useCallback(() => {
    console.log('[调试] handlePrevPage 被调用');
    if (!renditionRef.current) {
      console.log('[调试] handlePrevPage: rendition 不存在');
      return;
    }
    const rendition = renditionRef.current;
    
    const currentLocation = rendition.location;
    console.log('[调试] handlePrevPage: 当前位置', currentLocation);
    
    const currentDisplayed = currentLocation?.start?.displayed;
    console.log('[调试] handlePrevPage: 当前页码信息', currentDisplayed);
    
    const currentPage = currentDisplayed?.page;
    const currentHref = currentLocation?.start?.href;
    
    console.log('[调试] handlePrevPage: 当前页码', currentPage, 'href', currentHref);
    
    const totalPages = currentDisplayed?.total;
    
    // 关键判断：如果是章节最后一页，直接跳转到上一章节
    if (currentPage === totalPages) {
      console.log('[调试] handlePrevPage: 是章节最后一页，直接跳转到上一章节');
      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const prevIndex = currentLocation.start.index - 1;
          const prevSection = spine.get(prevIndex);
          console.log('[调试] handlePrevPage: 上一章节索引', prevIndex, '章节信息', prevSection);
          
          if (prevSection) {
            console.log('[调试] handlePrevPage: 跳转到上一章节', prevSection.href);
            rendition.display(prevSection.href).then(() => {
              console.log('[调试] handlePrevPage: 跳转到上一章节成功');
              const currentHref = rendition.location?.start?.href || '';
              if (currentHref && saveImmediately) {
                saveImmediately(currentHref);
              }
            }).catch((err) => {
              console.error('[调试] handlePrevPage: 跳转到上一章节失败', err);
            });
          } else {
            console.log('[调试] handlePrevPage: 已经是第一章了');
          }
        }
      } catch (e) {
        console.error('[调试] handlePrevPage: 尝试跳转到上一章节出错', e);
      }
    } else {
      // 不是最后一页，正常翻页
      console.log('[调试] handlePrevPage: 不是最后一页，正常翻页');
      rendition.prev().then(() => {
        console.log('[调试] handlePrevPage: 翻页成功');
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => { 
        console.error('[调试] handlePrevPage: 上一页出错:', error); 
      });
    }
  }, [saveImmediately]);

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
