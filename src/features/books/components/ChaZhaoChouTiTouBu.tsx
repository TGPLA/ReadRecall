// @审计已完成
// 查找抽屉头部组件 - 搜索栏、标题、关闭按钮

import React from 'react';

interface ChaZhaoChouTiTouBuProps {
  input: string;
  setInput: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onGuanBi: () => void;
}

export function ChaZhaoChouTiTouBu({ input, setInput, inputRef, onGuanBi }: ChaZhaoChouTiTouBuProps) {
  return (
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>查找</h3>
        <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="搜索全书内容..."
          style={{
            width: '100%', padding: '0.625rem 2.25rem 0.625rem 2.25rem', fontSize: '0.9rem',
            backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px',
            color: '#f3f4f6', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {input && (
          <button onClick={() => setInput('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
