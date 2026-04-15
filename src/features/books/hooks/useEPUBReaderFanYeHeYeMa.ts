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
    const rendition = renditionRef.current;
    if (!rendition) {
      return;
    }
    
    // 获取当前 spine 位置
    const book = (rendition as any).book;
    const currentLocation = rendition.location;
    const currentHref = currentLocation?.start?.href || '';
    
    // 直接使用 spine 计算下一页
    book.loaded.spine.then((spine: any) => {
      const spineItems = spine?.items || [];
      if (spineItems.length === 0) {
        return;
      }
      
      const currentHrefBase = currentHref.split('#')[0];
      let currentIndex = -1;
      
      for (let i = 0; i < spineItems.length; i++) {
        const itemHrefBase = (spineItems[i].href || '').split('#')[0];
        if (itemHrefBase === currentHrefBase) {
          currentIndex = i;
          break;
        }
      }
      
      // 如果不是最后一章，跳转到下一章
      if (currentIndex >= 0 && currentIndex < spineItems.length - 1) {
        const nextItem = spineItems[currentIndex + 1];
        rendition.display(nextItem.href).then(() => {
          if (nextItem.href && saveImmediately) {
            saveImmediately(nextItem.href);
          }
        });
      } else if (currentIndex === -1) {
        // 当前页面不在 spine 中（如封面），直接跳转到第一章
        if (spineItems.length > 0) {
          rendition.display(spineItems[0].href).then(() => {
            if (spineItems[0].href && saveImmediately) {
              saveImmediately(spineItems[0].href);
            }
          });
        }
      }
    });
  }, [saveImmediately]);

  const handlePrevPage = useCallback(() => {
    if (!renditionRef.current) return;
    const rendition = renditionRef.current;
    const book = (rendition as any).book;
    
    rendition.prev().then(() => {
      const currentLocation = rendition.location;
      const currentHref = currentLocation?.start?.href || '';
      if (currentHref && saveImmediately) {
        saveImmediately(currentHref);
      }
    }).catch((error) => { 
      console.error('上一页出错:', error); 
    });
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
