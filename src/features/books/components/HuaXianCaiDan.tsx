// @审计已完成
// 划线多功能菜单组件 - 微信读书风格（划线 / 马克笔 分离）

import { useState, useRef, useEffect } from 'react';
import type { HuaXianYanSe } from '../hooks/useHuaXianChuTi';

interface HuaXianCaiDanProps {
  selectedText: string;
  position: { top: number; left: number };
  showMenu: boolean;
  darkMode?: boolean;
  showCaretUp?: boolean;
  onHuaXian: (text: string, yanSe: HuaXianYanSe, beiZhu: string) => void;
  onCopy: (text: string) => void;
  onCancel: () => void;
  onXueXi?: (text: string) => void;
}

export function HuaXianCaiDan({
  selectedText,
  position,
  showMenu,
  darkMode,
  showCaretUp,
  onHuaXian,
  onCopy,
  onCancel,
  onXueXi,
}: HuaXianCaiDanProps) {
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMenu) requestAnimationFrame(() => setIsVisible(true));
    else setIsVisible(false);
  }, [showMenu]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onCancel();
    };
    if (showMenu) {
      timeoutId = setTimeout(() => document.addEventListener('click', handleClickOutside), 200);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, onCancel]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    opacity: isVisible ? 1 : 0,
    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.9}) translateY(${isVisible ? 0 : 10}px)`,
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: showMenu ? 'auto' : 'none',
  };

  const menuContainerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 2px 16px rgba(0, 0, 0, 0.3)',
    padding: '0.25rem',
    flexDirection: 'column',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.6rem 0.85rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.7rem',
    whiteSpace: 'nowrap',
    gap: '0.2rem',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={menuContainerStyle}>
        <div style={{ display: 'flex' }}>
          <button onClick={(e) => { e.stopPropagation(); onCopy(selectedText); }}
            style={buttonStyle}>
            <svg style={{ width: '1.15rem', height: '1.15rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制
          </button>

          <button onClick={(e) => { e.stopPropagation(); onHuaXian(selectedText, 'blue', ''); }}
            style={buttonStyle}>
            <svg style={{ width: '1.15rem', height: '1.15rem' }} fill="none" stroke="#5E94FF" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M7 16l5-8 5 8" />
            </svg>
            划线
          </button>

          {onXueXi && (
            <button onClick={(e) => { e.stopPropagation(); console.log('[DEBUG HuaXianCaiDan] 学习按钮被点击'); onXueXi(selectedText); }}
              style={buttonStyle}>
              <svg style={{ width: '1.15rem', height: '1.15rem' }} fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              学习
            </button>
          )}
        </div>

        {showCaretUp ? (
          <div style={{ position: 'absolute', left: '50%', top: '-8px', transform: 'translateX(-50%)', zIndex: 10000, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '10px solid rgba(51, 51, 51, 0.95)' }} />
        ) : (
          <div style={{ position: 'absolute', left: '50%', bottom: '-10px', transform: 'translateX(-50%)', zIndex: 10000, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid rgba(51, 51, 51, 0.95)' }} />
        )}
      </div>
    </div>
  );
}