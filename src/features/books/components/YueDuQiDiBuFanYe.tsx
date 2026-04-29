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

  return (
    <>
      <style>{`
        .di-bu-fan-ye-an-niu:hover {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 1.5rem 0.75rem',
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('[翻页按钮] 上一页 clicked');
            onShangYiYe();
          }}
          style={{
            padding: '0.4rem 0.8rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--ci-yao-wen-zi)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: 0.6,
            transition: 'opacity 0.15s ease',
            userSelect: 'none' as const,
          }}
          className="di-bu-fan-ye-an-niu"
        >
          （上一页）
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('[翻页按钮] 下一页 clicked');
            onXiaYiYe();
          }}
          style={{
            padding: '0.4rem 0.8rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--ci-yao-wen-zi)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            opacity: 0.6,
            transition: 'opacity 0.15s ease',
            userSelect: 'none' as const,
          }}
          className="di-bu-fan-ye-an-niu"
        >
          （下一页）
        </button>
      </div>
    </>
  );
}