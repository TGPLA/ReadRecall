// @审计已完成
// 阅读器顶部导航栏 - 左上角书名 + 右上角「我的书架」

import React from 'react';

interface YueDuQiDingBuDaoHangProps {
  shuMing: string;
  zuoZhe: string;
  onClose: () => void;
}

export function YueDuQiDingBuDaoHang({ shuMing, zuoZhe, onClose }: YueDuQiDingBuDaoHangProps) {
  return (
    <div style={{
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'transparent',
      zIndex: 100,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--ci-yao-wen-zi)',
          maxWidth: '400px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {shuMing || '加载中...'}
        </span>
        {zuoZhe && (
          <span style={{ fontSize: '0.8rem', color: 'var(--ci-yao-wen-zi)' }}>
            · {zuoZhe}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          padding: '0.35rem 0.85rem',
          border: '1px solid var(--bian-kuang-yan-se)',
          borderRadius: '6px',
          backgroundColor: 'transparent',
          color: 'var(--ci-yao-wen-zi)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--gong-ju-lan-bei-jing)'; e.currentTarget.style.color = 'var(--zheng-wen-yan-se)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ci-yao-wen-zi)'; }}
      >
        我的书架
      </button>
    </div>
  );
}