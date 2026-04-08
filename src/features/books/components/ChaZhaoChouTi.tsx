// @审计已完成
// 查找抽屉主视图 - 整合所有子组件

import React, { useCallback } from 'react';
import type { NavItem } from 'epubjs';
import { useChaZhaoChouTi } from '../hooks/useChaZhaoChouTi';
import { ChaZhaoChouTiTouBu } from './ChaZhaoChouTiTouBu';
import { ChaZhaoChouTiLieBiao } from './ChaZhaoChouTiLieBiao';
import { showInfo } from '../../../shared/utils/common/ToastGongJu';

interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle: string;
  chapterHref: string;
  weiZhi: number;
}

interface ChaZhaoChouTiProps {
  bookRef: React.RefObject<any>;
  renditionRef: React.RefObject<any>;
  zhangJieLieBiao: NavItem[];
  onJump: (cfi: string, keyword?: string, onlyOne?: boolean, weiZhi?: number) => void;
  onGuanBi: () => void;
}

const PANEL_STYLE = {
  width: '360px', height: '100%', backgroundColor: '#252525', borderLeft: '1px solid #333',
  display: 'flex', flexDirection: 'column' as const, position: 'fixed' as const, right: 0, top: 0, zIndex: 10000,
  animation: 'slideInRight 0.25s ease-out'
};

export function ChaZhaoChouTi({ bookRef, renditionRef, zhangJieLieBiao, onJump, onGuanBi }: ChaZhaoChouTiProps) {
  const { input, setInput, results, loading, searched, inputRef, dangQianSuoYin, shangYiGe, xiaYiGe } = useChaZhaoChouTi(bookRef);

  const handleJump = useCallback((result: SearchResult, index: number) => {
    onJump(result.cfi, input, false);
    onGuanBi();
  }, [onJump, onGuanBi, input]);

  return (
    <div style={PANEL_STYLE}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <ChaZhaoChouTiTouBu
        input={input}
        setInput={setInput}
        inputRef={inputRef}
        onGuanBi={onGuanBi}
      />
      {results.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderBottom: '1px solid #333', gap: '1rem' }}>
          <button onClick={() => { if (dangQianSuoYin <= 0) { showInfo('已是第一个结果'); return; } const newIdx = dangQianSuoYin - 1; const r = results[newIdx]; if (r) { shangYiGe(); onJump(r.cfi, input, true, r.weiZhi); } }}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#d1d5db', cursor: 'pointer' }}>
            ‹ 上一个
          </button>
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            {dangQianSuoYin + 1} / {results.length}
          </span>
          <button onClick={() => { if (dangQianSuoYin >= results.length - 1) { showInfo('已是最后一个结果'); return; } const newIdx = dangQianSuoYin + 1; const r = results[newIdx]; if (r) { xiaYiGe(); onJump(r.cfi, input, true, r.weiZhi); } }}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#d1d5db', cursor: 'pointer' }}>
            下一个 ›
          </button>
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ChaZhaoChouTiLieBiao
          results={results}
          loading={loading}
          searched={searched}
          input={input}
          currentIndex={dangQianSuoYin}
          onJump={handleJump}
        />
      </div>
    </div>
  );
}
