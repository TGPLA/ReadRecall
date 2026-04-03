// @审计已完成
// 高亮侧边栏组件 - 展示已保存的高亮列表

import type { GaoLiangXinXi, GaoLiangYanSe } from '../hooks/useHuaXianChuTi';

interface GaoLiangCeLanProps {
  darkMode: boolean;
  highlights: GaoLiangXinXi[];
  onDelete: (id: string) => void;
  onJump: (cfiRange: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const YAN_SE_COLOR: Record<GaoLiangYanSe, string> = {
  yellow: '#fef08a',
  green: '#86efac',
  blue: '#93c5fd',
  pink: '#f9a8d4',
};

export function GaoLiangCeLan({ darkMode, highlights, onDelete, onJump, isOpen, onToggle }: GaoLiangCeLanProps) {
  const sortedHighlights = [...highlights].sort((a, b) => b.createdAt - a.createdAt);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '0.5rem 0.25rem',
          backgroundColor: darkMode ? '#374151' : '#e5e7eb',
          border: 'none',
          borderRadius: '0.5rem 0 0 0.5rem',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          color: darkMode ? '#9ca3af' : '#6b7280',
          fontSize: '0.875rem',
        }}
      >
        高亮列表 ({highlights.length})
      </button>
    );
  }

  return (
    <div style={{
      width: '280px',
      height: '100%',
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      borderLeft: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>
          高亮列表 ({highlights.length})
        </h3>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {sortedHighlights.length === 0 ? (
          <p style={{ textAlign: 'center', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem', padding: '2rem 1rem' }}>
            暂无高亮记录
          </p>
        ) : (
          sortedHighlights.map(h => (
            <div
              key={h.id}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
              onClick={() => onJump(h.cfiRange)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: YAN_SE_COLOR[h.yanSe] }} />
                <span style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  {new Date(h.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(h.id); }}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: darkMode ? '#ef4444' : '#dc2626',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: darkMode ? '#f9fafb' : '#374151', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.text}
              </p>
              {h.beiZhu && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#9ca3af', fontStyle: 'italic' }}>
                  📝 {h.beiZhu}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}