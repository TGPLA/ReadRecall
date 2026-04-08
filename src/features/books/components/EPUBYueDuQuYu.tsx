// @审计已完成
// 阅读区域 - 微信读书风格：超大圆角卡片 + 双栏 + 内嵌翻页按钮

import React, { useEffect, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition } from 'epubjs';
import { HuaXianCaiDan } from './HuaXianCaiDan';
import type { HuaXianXinXi, HuaXianYanSe } from '../hooks/useHuaXianChuTi';

interface EPUBYueDuQuYuProps {
  url: string;
  location: string | number;
  onLocationChanged: (epubcfi: string) => void;
  onGetRendition: (rendition: Rendition) => void;
  souSuoCi: string;
  onSouSuoJieGuo: (jieGuo: any[]) => void;
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  firstLineRect?: DOMRect | null;
  generating: boolean;
  onCancel: () => void;
  onGenerateQuestion: (text: string, type: '名词解释' | '意图理解' | '生活应用') => void;
  onHighlight: (text: string) => void;
  onMaKeBi: (text: string) => void;
  onCopy: (text: string) => void;
  onShangYiYe?: () => void;
  onXiaYiYe?: () => void;
  keJian?: boolean;
  darkMode?: boolean;
  showEditMenu?: boolean;
  editPosition?: { top: number; left: number } | null;
  activeHuaXian?: HuaXianXinXi | null;
  onCloseEdit?: () => void;
  onDeleteHuaXian?: (id: string) => void;
  onChangeYanSe?: (id: string, yanSe: HuaXianYanSe) => void;
  onCopyText?: (text: string) => void;
}

const BAO_CHI_QI_YANG_SHI: React.CSSProperties = {
  flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', overflow: 'hidden',
  padding: '32px 24px', maxWidth: '1250px', width: '100%', margin: '0 auto', boxSizing: 'border-box',
};

const KA_PIAN_YANG_SHI: React.CSSProperties = {
  width: '100%', height: '100%', backgroundColor: 'var(--zhi-zhen-bei-jing)',
  borderRadius: '12px', overflow: 'hidden', position: 'relative',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
};

function ShuangLanPaiBan({ rendition, darkMode }: { rendition: Rendition | undefined; darkMode?: boolean }) {
  useEffect(() => {
    if (!rendition) return;
    
    const beiJingSe = darkMode ? '#222228' : '#F2F2F4';
    const wenZiSe = darkMode ? '#BBBBc4' : '#1A1A2E';
    const lieGuiSe = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    
    rendition.themes.register('default', {});
    rendition.themes.default('body', {
      'background-color': `${beiJingSe} !important`,
      'background': `${beiJingSe} !important`,
      'padding': '48px 56px !important', 'column-count': '2 !important',
      'column-gap': '56px !important', 'column-rule': `1px solid ${lieGuiSe} !important`,
      'max-width': 'none !important', 'height': '100% !important', 'box-sizing': 'border-box !important',
      'overflow-y': 'auto !important', 'color': `${wenZiSe} !important`,
    });
    rendition.themes.default('p, li, div, span, h1, h2, h3, h4, h5, h6, a, strong, em, b, i, u, del, ins, mark, sup, sub, code, pre, blockquote', {
      'max-width': 'none !important',
      'break-inside': 'avoid !important',
      'orphans': '3 !important',
      'widows': '3 !important',
      'color': `${wenZiSe} !important`,
      'background-color': 'transparent !important',
      'background': 'transparent !important',
    });
    rendition.themes.default('*', {
      'max-width': 'none !important',
      'color': `${wenZiSe} !important`,
      'background-color': 'transparent !important',
      'background': 'transparent !important',
    });
    (rendition as any).spread = () => true;
  }, [rendition, darkMode]);
  return null;
}

function QingChuKuNeiBuBianJu({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const qingChu = () => {
      const el = containerRef.current;
      if (!el) return;
      const juBu = el.querySelectorAll<HTMLElement>('div[style*="inset"]');
      juBu.forEach(d => { d.style.top = '0'; d.style.left = '0'; d.style.right = '0'; d.style.bottom = '0'; d.style.inset = '0'; });
      const areaList = el.querySelectorAll<HTMLElement>('.readerArea');
      areaList.forEach(d => { (d as any).style.backgroundColor = ''; });
      const jianTou = el.querySelectorAll<HTMLElement>('.arrow, .prev, .next');
      jianTou.forEach(d => { d.style.display = 'none'; });
      const anNiuJianTou = el.querySelectorAll<HTMLButtonElement>('button[style*="position: absolute"]');
      anNiuJianTou.forEach(d => { d.style.display = 'none'; d.style.visibility = 'hidden'; });
    };
    qingChu();
    const timer = setInterval(qingChu, 500);
    setTimeout(() => clearInterval(timer), 8000);
    return () => clearInterval(timer);
  }, [containerRef]);
  return null;
}

export function EPUBYueDuQuYu({
  url, location, onLocationChanged, onGetRendition,
  souSuoCi, onSouSuoJieGuo, selectedText, showMenu,
  selectionRect, firstLineRect, generating, onCancel, onGenerateQuestion,
  onHighlight, onMaKeBi, onCopy, onShangYiYe, onXiaYiYe, keJian, darkMode,
  showEditMenu, editPosition, activeHuaXian, onCloseEdit,
  onDeleteHuaXian, onChangeYanSe, onCopyText,
}: EPUBYueDuQuYuProps) {
  const renditionRef = useRef<Rendition>();
  const rongQiRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleGetRendition = (rendition: Rendition) => {
    renditionRef.current = rendition;
    onGetRendition(rendition);
    
    rendition.on('rendered', () => {
      setIsLoading(false);
    });
    
    setIsLoading(false);
  };

  const handleLocationChanged = (epubcfi: string) => {
    setIsLoading(false);
    onLocationChanged(epubcfi);
  };

  const anNiuYangShi: React.CSSProperties = {
    padding: '6px 14px', border: 'none', borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--ci-yao-wen-zi)',
    cursor: 'pointer', fontSize: '13px', opacity: 0.7, transition: 'all 0.2s ease',
    userSelect: 'none' as const, fontFamily: 'inherit',
  };

  return (
    <div style={BAO_CHI_QI_YANG_SHI} ref={rongQiRef}>
      <QingChuKuNeiBuBianJu containerRef={rongQiRef} />
      <div style={KA_PIAN_YANG_SHI}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ShuangLanPaiBan rendition={renditionRef.current} darkMode={darkMode} />
          {url && (
            <ReactReader
              url={url}
              location={location}
              locationChanged={handleLocationChanged}
              showToc={false}
              getRendition={handleGetRendition}
              searchQuery={souSuoCi}
              onSearchResults={onSouSuoJieGuo}
              contextLength={20}
              epubOptions={{
                flow: 'paginated',
                allowScriptedContent: true,
                width: '100%',
                height: '100%',
                styles: darkMode ? {
                  body: { 'background-color': '#222228', 'color': '#BBBBc4' },
                  '*': { 'background-color': '#222228', 'color': '#BBBBc4' },
                } : {
                  body: { 'background-color': '#F2F2F4', 'color': '#1A1A2E' },
                  '*': { 'background-color': '#F2F2F4', 'color': '#1A1A2E' },
                },
              }}
            />
          )}
          {isLoading && url && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--zhi-zhen-bei-jing)', zIndex: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: 'var(--ci-yao-wen-zi)', fontSize: '14px' }}>正在加载书籍内容...</p>
              </div>
            </div>
          )}
          {showMenu && selectedText && selectionRect && (
            (() => {
              const rect = selectionRect;
              const firstLine = firstLineRect;
              const menuDistance = -202;
              
              const menuWidth = 200;
              const menuHeight = 250;
              const safeMargin = 20;
              
              const referenceX = firstLine ? firstLine.left + firstLine.width / 2 : rect.left + rect.width / 2;
              const firstLineTop = firstLine ? firstLine.top : rect.top;
              const firstLineBottom = firstLine ? firstLine.bottom : rect.bottom;
              
              // 尝试放在第一行上方
              let menuTop = firstLineTop - menuHeight - menuDistance;
              let showCaretUp = false;
              
              // 检查上方空间是否足够
              const canShowAbove = menuTop >= safeMargin;
              
              if (!canShowAbove) {
                // 放在第一行下方
                menuTop = firstLineBottom + menuDistance;
                showCaretUp = true;
                
                // 检查下方空间
                const menuBottom = menuTop + menuHeight;
                const canShowBelow = menuBottom <= window.innerHeight - safeMargin;
                
                if (!canShowBelow) {
                  // 贴边显示
                  menuTop = Math.max(safeMargin, window.innerHeight - safeMargin - menuHeight);
                  showCaretUp = firstLineTop > menuTop + menuHeight / 2;
                }
              }
              
              let menuLeft = referenceX;
              if (menuLeft - menuWidth / 2 < safeMargin) {
                menuLeft = safeMargin + menuWidth / 2;
              } else if (menuLeft + menuWidth / 2 > window.innerWidth - safeMargin) {
                menuLeft = window.innerWidth - safeMargin - menuWidth / 2;
              }
              
              return (
                <HuaXianCaiDan
                  selectedText={selectedText}
                  showMenu={showMenu}
                  position={{ top: menuTop, left: menuLeft }}
                  showCaretUp={showCaretUp}
                  darkMode={darkMode}
                  onHuaXian={onHighlight}
                  onMaKeBi={onMaKeBi}
                  onCopy={onCopy}
                  onCancel={onCancel}
                />
              );
            })()
          )}
        </div>

        {keJian && (onShangYiYe || onXiaYiYe) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', flexShrink: 0 }}>
            {onShangYiYe && (
              <button onClick={onShangYiYe} style={anNiuYangShi}
                onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}>
                ← 上一页
              </button>
            )}
            <div />
            {onXiaYiYe && (
              <button onClick={onXiaYiYe} style={anNiuYangShi}
                onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}>
                下一页 →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
