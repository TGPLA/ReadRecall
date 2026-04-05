// @审计已完成
// 右侧悬浮工具栏 - 紧贴阅读卡片右边缘的垂直图标条（fixed定位，不受父容器overflow裁剪）

import React, { useEffect, useCallback, useRef, useState } from 'react';

type GongJuTiaoAnNiu = 'mulu' | 'biji' | 'zihao' | 'zhuti' | 'huaxian';

const KE_PING_KUAN_DU = 1320;
const GU_DING_PIAN_YI = -64;

interface YouCeGongJuTiaoProps {
  dangQianDaKai: string | null;
  onAnNiuDianJi: (anniu: GongJuTiaoAnNiu) => void;
  huaXianShuLiang: number;
  isDarkMode: boolean;
  onQieHuanZhuTi: () => void;
}

const TU_BIAO: Record<GongJuTiaoAnNiu, { path: string; viewBox: string; title: string }> = {
  mulu: { path: 'M4 6h16M4 12h16M4 18h16', viewBox: '0 0 24 24', title: '目录' },
  biji: { path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', viewBox: '0 0 24 24', title: '笔记' },
  zihao: { path: 'M4 6h16M4 10h16M4 14h16M4 18h10', viewBox: '0 0 24 24', title: '字号' },
  zhuti: { path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', viewBox: '0 0 24 24', title: '主题' },
  huaxian: { path: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', viewBox: '0 0 24 24', title: `划线` },
};

export function YouCeGongJuTiao({ dangQianDaKai, onAnNiuDianJi, huaXianShuLiang, isDarkMode, onQieHuanZhuTi }: YouCeGongJuTiaoProps) {
  const [shiJiRight, setShiJiRight] = useState(0);
  const rafRef = useRef<number>(0);

  const jiSuanWeiZhi = useCallback(() => {
    const shiKuan = window.innerWidth;
    const pianYi = Math.max(0, (shiKuan - KE_PING_KUAN_DU) / 2) + GU_DING_PIAN_YI;
    setShiJiRight(pianYi);
  }, []);

  useEffect(() => {
    jiSuanWeiZhi();
    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(jiSuanWeiZhi);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [jiSuanWeiZhi]);

  const anNiuLieBiao: { key: GongJuTiaoAnNiu; badge?: number }[] = [
    { key: 'mulu' }, { key: 'biji' }, { key: 'zihao' }, { key: 'zhuti' }, { key: 'huaxian', badge: huaXianShuLiang },
  ];

  return (
    <div style={{ position: 'fixed', right: `${shiJiRight}px`, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '26px', zIndex: 9999 }}>
      {anNiuLieBiao.map(({ key, badge }) => {
        const isActive = dangQianDaKai === key;
        const tuBiao = TU_BIAO[key];
        const moRen: React.CSSProperties = { 
          width: 44, height: 44, borderRadius: '50%', 
          border: 'none', outline: 'none',
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', 
          color: isDarkMode ? '#9ca3af' : '#4b5563', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', 
          transition: 'all 0.2s ease', boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)' 
        };
        const huoDong: React.CSSProperties = { 
          ...moRen, 
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)', 
          color: isDarkMode ? '#f3f4f6' : '#111827', 
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)' 
        };
        const yangShi = isActive ? huoDong : moRen;

        if (key === 'zhuti') {
          return (
            <button key={key} title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'} onClick={onQieHuanZhuTi} style={yangShi}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; if (!isActive) { el.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'; el.style.transform = 'scale(1.08)'; el.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)'; } }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; if (!isActive) { el.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; el.style.transform = 'scale(1)'; el.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)'; } }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <svg width="20" height="20" fill={isDarkMode ? '#fbbf24' : 'none'} stroke={isDarkMode ? 'none' : '#fbbf24'} strokeWidth={isDarkMode ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {isDarkMode ? <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  : <><circle cx="12" cy="12" r="5" /><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707" /></>}
              </svg>
            </button>
          );
        }

        return (
          <button key={key} title={badge && key === 'huaxian' ? `${tuBiao.title}(${badge})` : tuBiao.title}
            onClick={() => onAnNiuDianJi(key)} style={yangShi}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; if (!isActive) { el.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'; el.style.transform = 'scale(1.08)'; el.style.boxShadow = isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)'; } }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; if (!isActive) { el.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'; el.style.transform = 'scale(1)'; el.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)'; } }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox={tuBiao.viewBox}>
              <path d={tuBiao.path} />
            </svg>
            {badge ? (
              <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 15, height: 15, borderRadius: 8, backgroundColor: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {badge > 99 ? '99+' : badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
