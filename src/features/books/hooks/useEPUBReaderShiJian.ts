// @审计已完成
// EPUB 阅读器事件处理 Hook

import { useCallback, useEffect, useRef } from 'react';
import type { Rendition, Contents } from 'epubjs';
import { useEPUBReaderFanYeHeYeMa } from './useEPUBReaderFanYeHeYeMa';

const XUAN_ZE_YAN_CHI_MS = 100;
const ZUI_XIAO_WEN_ZI_SHU = 2;

interface UseEPUBReaderShiJianProps {
  yingYongZhuTi?: (rendition: Rendition, zhuTi: string) => void;
  zhuTi: string;
  ziTiDaXiao: number;
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  saveImmediately?: (loc: string | number) => void;
  chuLiSouSuoJieGuo: (jieGuo: any[], rendition?: Rendition) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  huaCiKaiQi: boolean;
  showMenu: boolean;
  setSelectedText: (text: string) => void;
  setShowMenu: (show: boolean) => void;
  setSelectionRect: (rect: DOMRect | null) => void;
  setCurrentCfiRange: (cfiRange: string | null) => void;
  setFirstLineRect?: (rect: DOMRect | null) => void;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  externalBookRef?: React.RefObject<any>;
  onHuaXianDianJi?: (xinXi: { cfi: string; id: string; className: string; rect: { top: number; left: number; width: number; height: number }; text: string }) => void;
}

export function useEPUBReaderShiJian({
  yingYongZhuTi, zhuTi, ziTiDaXiao, setYeMaXinXi, setLocation,
  saveImmediately,
  chuLiSouSuoJieGuo, tiaoDaoShangYiGe, tiaoDaoXiaYiGe, huaCiKaiQi,
  showMenu, setSelectedText, setShowMenu, setSelectionRect, setCurrentCfiRange,
  setFirstLineRect,
  externalRenditionRef, externalBookRef, onHuaXianDianJi,
}: UseEPUBReaderShiJianProps) {
  const fanYeHeYeMa = useEPUBReaderFanYeHeYeMa({
    setYeMaXinXi, setLocation, tiaoDaoShangYiGe, tiaoDaoXiaYiGe,
    externalRenditionRef, saveImmediately,
  });

  const cfiRangeRef = useRef<string | null>(null);
  const contentsRef = useRef<Contents | null>(null);
  const bookRef = externalBookRef || useRef<any>(null);
  const xuanZeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const huaCiKaiQiRef = useRef(huaCiKaiQi);
  const linshiBiaoZhuCfiRef = useRef<string | null>(null);
  const showMenuRef = useRef(showMenu);
  const yiZhiXiaYiGeClickRef = useRef(false);

  const firstLineRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    huaCiKaiQiRef.current = huaCiKaiQi;
  }, [huaCiKaiQi]);

  useEffect(() => {
    showMenuRef.current = showMenu;
  }, [showMenu]);

  const handleHidePopup = useCallback(() => {
    if (xuanZeTimerRef.current) {
      clearTimeout(xuanZeTimerRef.current);
      xuanZeTimerRef.current = null;
    }
    const contents = contentsRef.current;
    if (!contents) return;
    const selection = contents.window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      const rendition = fanYeHeYeMa.renditionRef.current;
      if (rendition && linshiBiaoZhuCfiRef.current) {
        try { rendition.annotations.remove(linshiBiaoZhuCfiRef.current, 'temp-selection'); } catch {}
        linshiBiaoZhuCfiRef.current = null;
      }
      setShowMenu(false);
      setSelectedText('');
      setSelectionRect(null);
      setCurrentCfiRange(null);
      if (setFirstLineRect) setFirstLineRect(null);
    }
  }, [setShowMenu, setSelectedText, setSelectionRect, setCurrentCfiRange, setFirstLineRect]);

  const handleRendition = useCallback((rendition: Rendition) => {
    fanYeHeYeMa.renditionRef.current = rendition;
    fanYeHeYeMa.setRenditionJiuXu(true);
    bookRef.current = rendition.book;

    const beiJingSe = zhuTi === 'dark' ? '#222228' : '#F2F2F4';
    const wenZiSe = zhuTi === 'dark' ? '#BBBBc4' : '#1A1A2E';
    const xuanchaSe = 'rgba(64, 158, 255, 0.3)';

    rendition.book.spine.hooks.serialize.register((section: any) => {
      try {
        if (!section.html) return section.html;
        const 注入样式 = `<style data-epub-early-bg>
        html, body { background-color: ${beiJingSe} !important; background: ${beiJingSe} !important; color: ${wenZiSe} !important; }
        ::selection { background-color: ${xuanchaSe} !important; }
      </style>`;
        if (section.html.includes('<head>')) {
          section.html = section.html.replace('<head>', `<head>${注入样式}`);
        } else if (section.html.includes('<html>')) {
          section.html = section.html.replace('<html>', `<html><head>${注入样式}</head>`);
        }
        return section.html;
      } catch (e) {
        return section.html;
      }
    });

    rendition.on("selected", (cfiRange: string, contents: Contents) => {
      if (!huaCiKaiQiRef.current) return;
      const selection = contents.window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const selectedText = selection.toString().trim();
      if (!selectedText) return;
      
      const range = selection.getRangeAt(0);
      
      let accurateCfiRange = cfiRange;
      try {
        const doc = contents.document;
        
        // 使用 epubjs 的 cfiFromRange 获取准确的 CFI
        let computedCfi = contents.cfiFromRange(range) || '';
        
        if (computedCfi) {
          accurateCfiRange = computedCfi;
        }
      } catch (error) {
        console.error('CFI 计算失败，使用原始值:', error);
      }
      
      const rect = range.getBoundingClientRect();
      let totalTop = 0;
      let totalLeft = 0;
      let currentWindow = contents.window;
      while (currentWindow) {
        const frameElement = currentWindow.frameElement;
        if (frameElement) {
          const frameRect = frameElement.getBoundingClientRect();
          totalTop += frameRect.top;
          totalLeft += frameRect.left;
          try {
            const parentWindow = frameElement.ownerDocument?.defaultView?.parent;
            if (parentWindow && parentWindow !== currentWindow) {
              currentWindow = parentWindow as Window;
            } else {
              break;
            }
          } catch {
            break;
          }
        } else {
          break;
        }
      }
      const correctedRect = {
        top: rect.top + totalTop,
        left: rect.left + totalLeft,
        width: rect.width,
        height: rect.height,
        right: rect.right + totalLeft,
        bottom: rect.bottom + totalTop,
      };
      setSelectionRect(correctedRect);
      
      if (setFirstLineRect) {
        const clientRects = range.getClientRects();
        if (clientRects && clientRects.length > 0) {
          const firstRect = clientRects[0];
          const firstLineRect = {
            top: firstRect.top + totalTop,
            left: firstRect.left + totalLeft,
            width: firstRect.width,
            height: firstRect.height,
            right: firstRect.right + totalLeft,
            bottom: firstRect.bottom + totalTop,
          };
          firstLineRectRef.current = firstLineRect;
          setFirstLineRect(firstLineRect);
        }
      }
      
      setCurrentCfiRange(accurateCfiRange);
      setSelectedText(selectedText);
      if (xuanZeTimerRef.current) {
        clearTimeout(xuanZeTimerRef.current);
      }
      if (selectedText.length < ZUI_XIAO_WEN_ZI_SHU) {
        contents.window.getSelection().removeAllRanges();
        return;
      }
      xuanZeTimerRef.current = setTimeout(() => {
        const currentSelection = contents.window.getSelection();
        if (!currentSelection || currentSelection.isCollapsed) return;
        const rend = fanYeHeYeMa.renditionRef.current;
        if (rend && accurateCfiRange) {
          try {
            rend.annotations.add('temp-selection', accurateCfiRange, {}, () => {}, 'temp-hl', { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' });
            linshiBiaoZhuCfiRef.current = accurateCfiRange;
          } catch (e) { console.error('临时标注创建失败:', e); }
        }
        xuanZeTimerRef.current = null;
      }, XUAN_ZE_YAN_CHI_MS);
    });
    
    rendition.hooks.content.register((contents: Contents) => {
      contentsRef.current = contents;
      if (!contents.window?.document?.head) return () => {};

      const beiJingSe = zhuTi === 'dark' ? '#222228' : '#F2F2F4';
      const wenZiSe = zhuTi === 'dark' ? '#BBBBc4' : '#1A1A2E';

      const baseStyle = contents.window.document.createElement('style');
      baseStyle.setAttribute('data-epub-base-bg', '');
      baseStyle.textContent = `
        html, body { background-color: ${beiJingSe} !important; background: ${beiJingSe} !important; color: ${wenZiSe} !important; }
        ::selection { background-color: rgba(64, 158, 255, 0.3) !important; }
        ::-moz-selection { background-color: rgba(64, 158, 255, 0.3) !important; }
        .epub-container svg.epubjs-hl { fill-opacity: 0.1 !important; }
        .epub-container svg.epubjs-hl rect { fill-opacity: 0.1 !important; stroke-width: 0 !important; }
        span.hl-underline-blue, .hl-underline-blue { background: linear-gradient(to right, #5E94FF 0%, #5E94FF 100%) no-repeat !important; background-size: 100% 2px !important; background-position: 0 100% !important; padding-bottom: 4px !important; box-decoration-break: clone !important; -webkit-box-decoration-break: clone !important; border: none !important; display: inline !important; transition: opacity 0.2s ease, background-size 0.25s ease !important; }
        span.hl-underline-yellow, .hl-underline-yellow { background: linear-gradient(to right, #F5C842 0%, #F5C842 100%) no-repeat !important; background-size: 100% 2px !important; background-position: 0 100% !important; padding-bottom: 4px !important; box-decoration-break: clone !important; -webkit-box-decoration-break: clone !important; border: none !important; display: inline !important; transition: opacity 0.2s ease, background-size 0.25s ease !important; }
        span.hl-underline-green, .hl-underline-green { background: linear-gradient(to right, #4ADE80 0%, #4ADE80 100%) no-repeat !important; background-size: 100% 2px !important; background-position: 0 100% !important; padding-bottom: 4px !important; box-decoration-break: clone !important; -webkit-box-decoration-break: clone !important; border: none !important; display: inline !important; transition: opacity 0.2s ease, background-size 0.25s ease !important; }
        span.hl-underline-pink, .hl-underline-pink { background: linear-gradient(to right, #F472B6 0%, #F472B6 100%) no-repeat !important; background-size: 100% 2px !important; background-position: 0 100% !important; padding-bottom: 4px !important; box-decoration-break: clone !important; -webkit-box-decoration-break: clone !important; border: none !important; display: inline !important; transition: opacity 0.2s ease, background-size 0.25s ease !important; }
        span.mk-marker-yellow, .mk-marker-yellow { background-color: rgba(245,200,66,0.3) !important; padding: 0 2px !important; border-radius: 2px !important; display: inline !important; transition: opacity 0.2s ease !important; }
        span.mk-marker-green, .mk-marker-green { background-color: rgba(74,222,128,0.3) !important; padding: 0 2px !important; border-radius: 2px !important; display: inline !important; transition: opacity 0.2s ease !important; }
        span.mk-marker-blue, .mk-marker-blue { background-color: rgba(94,148,255,0.25) !important; padding: 0 2px !important; border-radius: 2px !important; display: inline !important; transition: opacity 0.2s ease !important; }
        span.mk-marker-pink, .mk-marker-pink { background-color: rgba(244,114,182,0.3) !important; padding: 0 2px !important; border-radius: 2px !important; display: inline !important; transition: opacity 0.2s ease !important; }
        span.hl-active.hl-underline-blue, .hl-active.hl-underline-blue { background-size: 100% 4px !important; opacity: 1 !important; }
        span.hl-active.hl-underline-yellow, .hl-active.hl-underline-yellow { background-size: 100% 4px !important; opacity: 1 !important; }
        span.hl-active.hl-underline-green, .hl-active.hl-underline-green { background-size: 100% 4px !important; opacity: 1 !important; }
        span.hl-active.hl-underline-pink, .hl-active.hl-underline-pink { background-size: 100% 4px !important; opacity: 1 !important; }
        span.hl-active.mk-marker-yellow { background-color: rgba(245,200,66,0.5) !important; }
        span.hl-active.mk-marker-green { background-color: rgba(74,222,128,0.5) !important; }
        span.hl-active.mk-marker-blue { background-color: rgba(94,148,255,0.45) !important; }
        span.hl-active.mk-marker-pink { background-color: rgba(244,114,182,0.5) !important; }
      `;
      contents.window.document.head.insertBefore(baseStyle, contents.window.document.head.firstChild);

      const huaXianProxyScript = contents.window.document.createElement('script');
      huaXianProxyScript.textContent = `(function(){
        var activeId=null;
        function setActive(id){
          if(activeId){
            var p=document.querySelector('[data-huaxian-id="'+activeId+'"]');
            if(p)p.classList.remove('hl-active')
          }
          activeId=id;
          if(id){
            var e=document.querySelector('[data-huaxian-id="'+id+'"]');
            if(e)e.classList.add('hl-active')
          }
        }
        function handleClick(e){
          var t=e.target.closest('[data-biaoji]');
          if(t){
            e.preventDefault();
            e.stopPropagation();
            var cfi=t.getAttribute('data-cfi')||'',id=t.getAttribute('data-huaxian-id')||'',cls=t.className||'',txt=t.textContent||'',r=t.getBoundingClientRect();
            window.parent.postMessage({type:'huaxian-click',cfi:cfi,id:id,className:cls,rect:{top:r.top,left:r.left,width:r.width,height:r.height},text:txt},'*')
          }else{
            window.parent.postMessage({type:'close-edit-menu'},'*')
          }
        }
        document.addEventListener('click',handleClick,true);
        window.addEventListener('message',function(e){
          if(e.data&&e.data.type==='set-hl-active')setActive(e.data.id)
        });
        var obs=new MutationObserver(function(ms){
          ms.forEach(function(m){
            m.addedNodes.forEach(function(n){
              if(n.nodeType===1){
                var s=n.querySelectorAll?n.querySelectorAll('[data-biaoji]'):[];
                if(n.hasAttribute&&n.hasAttribute('data-biaoji')){
                  s=Array.prototype.slice.call(s||[]);
                  s.unshift(n)
                }
                s.forEach(function(){})
              }
            })
          })
        });
        obs.observe(document.body||document.documentElement,{childList:true,subtree:true})
      })()`;
      contents.window.document.head.appendChild(huaXianProxyScript);

      function handleIframeClick(e: Event) {
    console.log('[调试] handleIframeClick 被调用', e);
    var target = (e as any).target;
    if (target && target.closest && target.closest('[data-biaoji]')) { return; }
    // 清除可能残留的标记
    yiZhiXiaYiGeClickRef.current = false;
    if (!showMenuRef.current) { 
      console.log('[调试] handleIframeClick: 菜单未显示，不执行任何操作');
      return; 
    }
    console.log('[调试] handleIframeClick: 关闭菜单');
    const rend = fanYeHeYeMa.renditionRef.current;
    if (rend && linshiBiaoZhuCfiRef.current) {
      try { rend.annotations.remove(linshiBiaoZhuCfiRef.current, 'temp-selection'); } catch {}
      linshiBiaoZhuCfiRef.current = null;
    }
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    setCurrentCfiRange(null);
    if (setFirstLineRect) setFirstLineRect(null);
  }

      contents.window.addEventListener('click', handleIframeClick);

      function handleIframeMouseUp() {
        if (!huaCiKaiQiRef.current) return;
        const selection = contents.window.getSelection();
        if (!selection || selection.isCollapsed) return;
        const text = selection.toString().trim();
        if (!text || text.length < ZUI_XIAO_WEN_ZI_SHU) return;
        if (showMenuRef.current) return;
        showMenuRef.current = true;
        // 移除这个标记，因为它会导致第一次点击翻页按钮失效
        // yiZhiXiaYiGeClickRef.current = true;
        setShowMenu(true);
      }

      contents.window.addEventListener('mouseup', handleIframeMouseUp);

      const handleMessage = (msg: MessageEvent) => {
        if (!msg.data || msg.data.type !== 'huaxian-click') return;
        const frameElement = contents.window.frameElement;
        let totalTop = 0, totalLeft = 0;
        let currentWindow = contents.window;
        while (currentWindow) {
          const fe = currentWindow.frameElement;
          if (fe) {
            const fr = fe.getBoundingClientRect();
            totalTop += fr.top;
            totalLeft += fr.left;
            try {
              const pw = fe.ownerDocument?.defaultView?.parent;
              if (pw && pw !== currentWindow) { currentWindow = pw as Window; } else { break; }
            } catch { break; }
          } else { break; }
        }
        onHuaXianDianJi?.({
          cfi: msg.data.cfi,
          id: msg.data.id,
          className: msg.data.className,
          rect: { top: msg.data.rect.top + totalTop, left: msg.data.rect.left + totalLeft, width: msg.data.rect.width, height: msg.data.rect.height },
          text: msg.data.text,
        });
      };
      contents.window.addEventListener('message', handleMessage);

      window.addEventListener('message', (msg: MessageEvent) => {
        if (!msg.data || msg.data.type !== 'huaxian-click') return;
        const frameElement = contents.window.frameElement;
        let totalTop = 0, totalLeft = 0;
        let currentWindow = contents.window;
        while (currentWindow) {
          const fe = currentWindow.frameElement;
          if (fe) {
            const fr = fe.getBoundingClientRect();
            totalTop += fr.top;
            totalLeft += fr.left;
            try {
              const pw = fe.ownerDocument?.defaultView?.parent;
              if (pw && pw !== currentWindow) { currentWindow = pw as Window; } else { break; }
            } catch { break; }
          } else { break; }
        }
        onHuaXianDianJi?.({
          cfi: msg.data.cfi,
          id: msg.data.id,
          className: msg.data.className,
          rect: { top: msg.data.rect.top + totalTop, left: msg.data.rect.left + totalLeft, width: msg.data.rect.width, height: msg.data.rect.height },
          text: msg.data.text,
        });
      });

      return () => {
        contents.window.removeEventListener('click', handleIframeClick);
        contents.window.removeEventListener('mouseup', handleIframeMouseUp);
        contents.window.removeEventListener('message', handleMessage);
        const oldBase = contents.window.document.querySelector('style[data-epub-base-bg]');
        if (oldBase) oldBase.remove();
        const oldProxy = contents.window.document.querySelector('script');
        if (oldProxy && oldProxy.parentNode === contents.window.document.head) oldProxy.remove();
      };
    });
    rendition.on('rendered', () => {
      console.log('[调试] rendition: rendered 事件触发');
      fanYeHeYeMa.gengXinYeMaXinXi();
      try {
        const location = rendition.location;
        console.log('[调试] rendition: rendered 中的 location', location);
        if (location?.start?.cfi) {
          fanYeHeYeMa.handleLocationChanged(location.start.cfi);
        }
      } catch (e) {
        console.error('[调试] rendition: rendered 出错', e);
      }
    });
    rendition.on('relocated', (location: any) => {
      console.log('[调试] rendition: relocated 事件触发，location:', location);
      fanYeHeYeMa.gengXinYeMaXinXi();
      try {
        if (location?.start?.cfi) {
          fanYeHeYeMa.handleLocationChanged(location.start.cfi);
        }
      } catch (e) {
        console.error('[调试] rendition: relocated 出错', e);
      }
    });
    rendition.on('error', (error: any) => {
      console.warn('epub.js 内部错误（已捕获）:', error?.message || error);
    });
    if (yingYongZhuTi) {
      yingYongZhuTi(rendition, zhuTi);
    }
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
    rendition.book.loaded.navigation.then((nav) => {
      fanYeHeYeMa.tocRef.current = nav.toc || [];
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
  }, [huaCiKaiQi, handleHidePopup, yingYongZhuTi, zhuTi, ziTiDaXiao, fanYeHeYeMa, setSelectionRect, setCurrentCfiRange, setSelectedText, setShowMenu]);

  useEffect(() => {
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition) return;
    if (yingYongZhuTi) {
      yingYongZhuTi(rendition, zhuTi);
    }
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
  }, [zhuTi, ziTiDaXiao, yingYongZhuTi, fanYeHeYeMa.renditionRef]);

  const handleSouSuoJieGuo = useCallback((jieGuo: any[]) => {
    chuLiSouSuoJieGuo(jieGuo, fanYeHeYeMa.renditionRef.current);
  }, [chuLiSouSuoJieGuo, fanYeHeYeMa.renditionRef]);

  const handleLocationChanged = useCallback((epubcfi: string) => {
    fanYeHeYeMa.handleLocationChanged(epubcfi);
  }, [fanYeHeYeMa]);

  return {
    renditionRef: fanYeHeYeMa.renditionRef,
    renditionJiuXu: fanYeHeYeMa.renditionJiuXu,
    handleRendition,
    handleNextPage: fanYeHeYeMa.handleNextPage, handlePrevPage: fanYeHeYeMa.handlePrevPage,
    handleShangYiGeSouSuoJieGuo: fanYeHeYeMa.handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo: fanYeHeYeMa.handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged, handleSouSuoJieGuo,
    bookRef,
  };
}