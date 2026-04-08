// @审计已完成
// 查找抽屉列表组件 - 搜索结果展示

import React from 'react';

interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle: string;
  chapterHref: string;
  weiZhi: number;
}

interface ChaZhaoChouTiLieBiaoProps {
  results: SearchResult[];
  loading: boolean;
  searched: boolean;
  input: string;
  currentIndex: number;
  onJump: (result: SearchResult, index: number) => void;
}

const highlightKeyword = (text: string, keyword: string): React.ReactNode => {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i} style={{ backgroundColor: '#fbbf24', color: '#000', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> : part
  );
};

export function ChaZhaoChouTiLieBiao({ results, loading, searched, input, currentIndex, onJump }: ChaZhaoChouTiLieBiaoProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#9ca3af' }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        搜索中...
      </div>
    );
  }

  if (!searched) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.5rem' }}>
        <svg width="40" height="40" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>输入关键词搜索</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.5rem' }}>
        <svg width="40" height="40" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>未找到相关结果</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '0.5rem 1rem', color: '#9ca3af', fontSize: '0.8rem', borderBottom: '1px solid #333' }}>
        找到 {results.length} 个结果
      </div>
      {results.map((result, idx) => (
        <div key={idx} onClick={() => onJump(result, idx)}
          style={{
            padding: '0.85rem 1rem', borderBottom: '1px solid #333', cursor: 'pointer',
            transition: 'background-color 0.12s ease',
            backgroundColor: idx === currentIndex ? '#374151' : 'transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = idx === currentIndex ? '#4b5563' : '#374151'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = idx === currentIndex ? '#374151' : 'transparent'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {result.chapterTitle}
            </span>
            {idx === currentIndex && (
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px' }}>
                当前
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {highlightKeyword(result.excerpt, input)}
          </p>
        </div>
      ))}
    </div>
  );
}
