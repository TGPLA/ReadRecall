// @审计已完成
// 目录抽屉面板 - 书名作者头部 + 章节列表 + 当前章节高亮

import React, { useEffect, useRef, useState } from 'react';
import type { NavItem } from 'epubjs';

interface MuLuChouTiProps {
  shuMing: string; zuoZhe: string; zhangJieLieBiao: NavItem[];
  dangQianCfi: string; onZhangJieDianJi: (href: string) => void; onGuanBi: () => void;
}

const TOU_BU_YANG_SHI = { padding: '1.25rem 1.5rem', borderBottom: '1px solid #333' };
const CHOU_TI_YANG_SHI = { width: '360px', height: '100%', backgroundColor: '#252525', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', position: 'fixed' as const, right: 0, top: 0, zIndex: 10000, animation: 'slideInRight 0.25s ease-out' };

export function MuLuChouTi({ shuMing, zuoZhe, zhangJieLieBiao, dangQianCfi, onZhangJieDianJi, onGuanBi }: MuLuChouTiProps) {
  const lieBiaoRef = useRef<HTMLDivElement>(null);
  const [gaoLiangId, setGaoLiangId] = useState<string>('');

  useEffect(() => {
    const xunZhao = (items: NavItem[]): string | null => { for (const item of items) { if (dangQianCfi && item.href && dangQianCfi.includes(item.href.split('#')[0])) return item.id || item.href; if (item.subitems?.length) { const f = xunZhao(item.subitems); if (f) return f; } } return null; };
    const id = xunZhao(zhangJieLieBiao);
    if (id) setGaoLiangId(id);
    const t = setTimeout(() => { lieBiaoRef.current?.querySelector(`[data-chapter-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    return () => clearTimeout(t);
  }, [zhangJieLieBiao, dangQianCfi]);

  const xiangMuYangShi = (id: string, cengJi: number): React.CSSProperties => ({
    padding: `${cengJi ? '0.5rem' : '0.65rem'} ${1 + cengJi * 1.2}rem 0.65rem`, cursor: 'pointer',
    fontSize: cengJi ? '0.85rem' : '0.9rem', color: gaoLiangId === id ? '#fbbf24' : '#d1d5db',
    borderRadius: '6px', transition: 'background-color 0.12s ease', fontWeight: gaoLiangId === id ? 600 : 400,
    paddingLeft: `${1 + cengJi * 1.2}rem`,
  });

  const render = (items: NavItem[], c = 0): React.ReactNode[] => items.flatMap(item => [
    <div key={item.id || item.href} data-chapter-id={item.id || item.href}
      onClick={() => item.href && onZhangJieDianJi(item.href)} style={xiangMuYangShi(item.id || item.href, c)}
      onMouseEnter={e => { if (gaoLiangId !== (item.id || item.href)) e.currentTarget.style.backgroundColor = '#3f3f46'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>{item.label}</div>,
    ...(item.subitems?.length ? render(item.subitems, c + 1) : []),
  ]);

  return (
    <div style={CHOU_TI_YANG_SHI}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={TOU_BU_YANG_SHI}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>目录</h3>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shuMing}{zuoZhe && <span> · {zuoZhe}</span>}</p>
          </div>
          <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem', flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <div ref={lieBiaoRef} style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {!zhangJieLieBiao.length ? <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 1rem', fontSize: '0.875rem' }}>暂无目录</p> : render(zhangJieLieBiao)}
      </div>
    </div>
  );
}
