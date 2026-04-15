// @审计已完成
// 划线编辑菜单组件 - 点击已有划线时弹出（删除/复制/换色）

import { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, Brain } from 'lucide-react';
import type { HuaXianYanSe, HuaXianXinXi } from '../hooks/useHuaXianChuTi';

const YAN_SE_XUAN_XIANG: { value: HuaXianYanSe; color: string }[] = [
  { value: 'yellow', color: '#F5C842' },
  { value: 'green', color: '#4ADE80' },
  { value: 'blue', color: '#5E94FF' },
  { value: 'pink', color: '#F472B6' },
];

interface HuaXianBianJiCaiDanProps {
  show: boolean;
  position: { top: number; left: number } | null;
  currentYanSe: HuaXianYanSe;
  activeHuaXianList: HuaXianXinXi[];
  activeHuaXianText?: string;
  onDelete: () => void;
  onDeleteSingle: (id: string) => void;
  onCopy: () => void;
  onChangeYanSe: (yanSe: HuaXianYanSe) => void;
  onXueXi?: (text: string) => void;
  onClose: () => void;
}

export function HuaXianBianJiCaiDan({
  show, position, currentYanSe, activeHuaXianList, activeHuaXianText, onDelete, onDeleteSingle, onCopy, onChangeYanSe, onXueXi, onClose,
}: HuaXianBianJiCaiDanProps) {
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (show) requestAnimationFrame(() => setVisible(true)); else setVisible(false); }, [show]);

  useEffect(() => {
    if (!show) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        requestAnimationFrame(() => onClose());
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [show, onClose]);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show || !position) return null;

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: `translate(-50%, 0) scale(${visible ? 1 : 0.9}) translateY(${visible ? '0' : '8'}px)`,
    zIndex: 9999,
    opacity: visible ? 1 : 0,
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '0.35rem',
    backgroundColor: 'rgba(51, 51, 51, 0.95)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 2px 16px rgba(0,0,0,0.3)',
    padding: '0.4rem 0.5rem', minWidth: '11rem',
  };

  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.6rem' };

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.45rem 0.65rem', border: 'none', borderRadius: '0.45rem',
    backgroundColor: 'transparent', color: '#ffffff', cursor: 'pointer',
    fontSize: '0.78rem', whiteSpace: 'nowrap', transition: 'background-color 0.15s',
  };

  const dotStyle = (isActive: boolean): React.CSSProperties => ({
    width: '22px', height: '22px', borderRadius: '50%',
    border: isActive ? '2.5px solid #ffffff' : '2px solid transparent',
    boxSizing: 'border-box', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
  });

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
        {activeHuaXianList.length > 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.25rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '0.15rem' }}>
              同时选中 {activeHuaXianList.length} 个标记
            </div>
            {activeHuaXianList.map(h => (
              <button key={h.id}
                onClick={(e) => { e.stopPropagation(); onDeleteSingle(h.id); }}
                style={{ ...btnStyle, justifyContent: 'flex-start' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#ef4444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <Trash2 size={12} />
                <span style={{ fontSize: '0.72rem' }}>
                  删除划线
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={rowStyle}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="删除划线"
              style={btnStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor='#ef4444'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              <Trash2 size={14} /><span>删除</span>
            </button>
            <div style={{ width: '1px', height: '1.2rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />
            {onXueXi && activeHuaXianText && (
              <button onClick={(e) => { e.stopPropagation(); onXueXi(activeHuaXianText!); }} title="学习"
                style={{ ...btnStyle, color: '#8b5cf6' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(139, 92, 246, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <Brain size={14} /><span>学习</span>
              </button>
            )}
            <div style={{ width: '1px', height: '1.2rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <button onClick={(e) => { e.stopPropagation(); onCopy(); }} title="复制文字"
              style={btnStyle} onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(96,165,250,0.25)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              <Copy size={14} /><span>复制</span>
            </button>
          </div>
        )}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ ...rowStyle, justifyContent: 'center', paddingTop: '0.2rem' }}>
          {YAN_SE_XUAN_XIANG.map(opt => (
            <button key={opt.value} title={`切换为${opt.color}`}
              onClick={(e) => { e.stopPropagation(); onChangeYanSe(opt.value); }}
              style={{ ...dotStyle(currentYanSe === opt.value), backgroundColor: opt.color }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: '50%', bottom: '-10px', transform: 'translateX(-50%)',
          width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
          borderTop: '10px solid rgba(51, 51, 51, 0.95)', zIndex: 10000,
        }} />
      </div>
    </div>
  );
}
