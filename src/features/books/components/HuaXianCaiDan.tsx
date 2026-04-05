// @审计已完成
// 划线多功能菜单组件 - 微信读书风格

import { useState, useRef, useEffect } from 'react';
import type { ChuTiLeiXing, HuaXianYanSe } from '../hooks/useHuaXianChuTi';

interface HuaXianCaiDanProps {
  selectedText: string;
  position: { top: number; left: number };
  showMenu: boolean;
  generating: boolean;
  darkMode?: boolean;
  onGenerateQuestion: (text: string, type: ChuTiLeiXing) => void;
  onHuaXian: (text: string, yanSe: HuaXianYanSe, beiZhu: string) => void;
  onCopy: (text: string) => void;
  onCancel: () => void;
}

export function HuaXianCaiDan({
  selectedText,
  position,
  generating,
  darkMode,
  onGenerateQuestion,
  onHuaXian,
  onCopy,
  onCancel,
}: HuaXianCaiDanProps) {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [yanSe] = useState<HuaXianYanSe>('yellow');
  const [beiZhu, setBeiZhu] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onCancel]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 9999,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    gap: '0.25rem',
    transition: 'all 0.2s',
  };

  const handleHuaXianClick = () => {
    onHuaXian(selectedText, yanSe, beiZhu);
    setBeiZhu('');
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={{
        display: 'flex',
        backgroundColor: '#333333',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        padding: '0.25rem',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => setShowSubMenu(!showSubMenu)}
            disabled={generating}
            style={{
              ...buttonStyle,
              color: showSubMenu ? '#3b82f6' : '#ffffff',
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.5 : 1,
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            AI问书
          </button>

          <button
            onClick={() => onCopy(selectedText)}
            style={{
              ...buttonStyle,
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制
          </button>

          <button
            onClick={handleHuaXianClick}
            style={{
              ...buttonStyle,
            }}
          >
            <div style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              borderRadius: '0.25rem', 
              backgroundColor: '#000000',
              border: `2px solid ${darkMode ? '#ffffff' : '#000000'}`
            }} />
            划线
          </button>
        </div>

        <div style={{ padding: '0.5rem', borderTop: '1px solid #444444' }}>
            <input
              type="text"
              value={beiZhu}
              onChange={(e) => setBeiZhu(e.target.value)}
              placeholder="添加备注（可选）"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #555555',
                backgroundColor: '#222222',
                color: '#ffffff',
                fontSize: '0.75rem',
              }}
            />
            <button
              onClick={handleHuaXianClick}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.25rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              保存划线
            </button>
          </div>

          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-8px',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #333333',
          }} />
        </div>

        {showSubMenu && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '0.5rem',
          backgroundColor: '#333333',
          borderRadius: '0.75rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          minWidth: '8rem',
        }}>
          {CHU_TI_LEI_XING.map(type => (
            <button
              key={type}
              onClick={() => {
                onGenerateQuestion(selectedText, type);
                setShowSubMenu(false);
              }}
              disabled={generating}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#444444')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {generating ? '生成中...' : type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
