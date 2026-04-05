// @审计已完成
// 阅读器底部翻页按钮 - 阅读区下方左右各一个

import React from 'react';

interface YueDuQiDiBuFanYeProps {
  onShangYiYe: () => void;
  onXiaYiYe: () => void;
  keJian: boolean;
  isDarkMode: boolean;
}

export function YueDuQiDiBuFanYe({ onShangYiYe, onXiaYiYe, keJian }: YueDuQiDiBuFanYeProps) {
  if (!keJian) return null;

  const anNiuYangShi = {
    padding: '0.4rem 0.8rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--ci-yao-wen-zi)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    opacity: 0.6,
    transition: 'opacity 0.2s ease',
    userSelect: 'none' as const,
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 1.5rem 0.75rem',
    }}>
      <button
        onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
        onClick={onShangYiYe}
        style={anNiuYangShi}
      >
        （上一页）
      </button>
      <button
        onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
        onClick={onXiaYiYe}
        style={anNiuYangShi}
      >
        （下一页）
      </button>
    </div>
  );
}
