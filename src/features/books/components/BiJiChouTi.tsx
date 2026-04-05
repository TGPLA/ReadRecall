// @审计已完成
// 笔记抽屉面板 - 划线内容列表 + 空状态提示

import React from 'react';
import type { HuaXianXinXi, HuaXianYanSe } from '../hooks/useHuaXianChuTi';

interface BiJiChouTiProps {
  highlights: HuaXianXinXi[];
  onDelete: (id: string) => void;
  onJump: (cfiRange: string) => void;
  onGuanBi: () => void;
}

const YAN_SE_COLOR: Record<HuaXianYanSe, string> = {
  yellow: '#000000',
  green: '#000000',
  blue: '#000000',
  pink: '#000000',
};

export function BiJiChouTi({ highlights, onDelete, onJump, onGuanBi }: BiJiChouTiProps) {
  const paiXuHouDeHuaXian = [...highlights].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div style={{
      width: '360px',
      height: '100%',
      backgroundColor: '#252525',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 300,
      animation: 'slideInRight 0.25s ease-out',
    }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
          笔记 ({highlights.length})
        </h3>
        <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {paiXuHouDeHuaXian.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
            <svg width="48" height="48" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>暂无笔记</p>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.78rem' }}>在阅读时划线并添加想法</p>
          </div>
        ) : (
          paiXuHouDeHuaXian.map(h => (
            <div
              key={h.id}
              onClick={() => onJump(h.cfiRange)}
              style={{
                padding: '0.85rem',
                marginBottom: '0.6rem',
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'border-color 0.12s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: YAN_SE_COLOR[h.yanSe], flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                  {new Date(h.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(h.id); }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.15rem', opacity: 0.6 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.87rem', color: '#d1d5db', lineHeight: 1.6 }}>{h.text}</p>
              {h.beiZhu && (
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #374151', paddingTop: '0.4rem' }}>
                  💡 {h.beiZhu}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
