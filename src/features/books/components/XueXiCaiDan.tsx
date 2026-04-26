// @审计已完成
// 智能学习菜单组件 - 简化版：AI智能理解选中内容

import { useState, useEffect, useRef, useMemo } from 'react';
import { Brain, X, RefreshCw } from 'lucide-react';

interface XueXiCaiDanProps {
  show: boolean;
  position: { top: number; left: number };
  startPosition?: { top: number; left: number } | null;
  text: string;
  chapterId?: string;
  darkMode?: boolean;
  onClose: () => void;
  onExplain: (text: string) => void;
  onZiJiHuaFuShu: (text: string) => void;
  onParaphrase?: (text: string) => void;
}

const CAI_DAN_KUAN_DU = 200;
const CAI_DAN_GAO_DU = 220;
const AN_QUAN_BIAN_JU = 16;

function jiSuanZuiJiaWeiZhi(
  yuanShiWeiZhi: { top: number; left: number },
  kuanDu: number,
  gaoDu: number,
  anQuanBianJu: number
): { top: number; left: number; fangXiang: 'shang' | 'xia' } {
  let { top, left } = yuanShiWeiZhi;
  let fangXiang: 'shang' | 'xia' = 'shang';
  
  const danQianShangBu = top - gaoDu;
  const danQianXiaBu = top;
  const zuiDiWeiZhi = anQuanBianJu;
  const zuiGaoWeiZhi = window.innerHeight - anQuanBianJu;
  const zuiZuoWeiZhi = anQuanBianJu;
  const zuiYouWeiZhi = window.innerWidth - kuanDu - anQuanBianJu;
  
  if (danQianShangBu < zuiDiWeiZhi) {
    if (danQianXiaBu + gaoDu <= zuiGaoWeiZhi) {
      top = top + gaoDu;
      fangXiang = 'xia';
    } else {
      top = zuiGaoWeiZhi;
      fangXiang = 'xia';
    }
  } else if (danQianXiaBu > zuiGaoWeiZhi) {
    if (danQianShangBu >= zuiDiWeiZhi) {
      top = top - gaoDu;
      fangXiang = 'shang';
    } else {
      top = zuiDiWeiZhi + gaoDu;
      fangXiang = 'shang';
    }
  }
  
  if (left - kuanDu / 2 < zuiZuoWeiZhi) {
    left = zuiZuoWeiZhi + kuanDu / 2;
  } else if (left + kuanDu / 2 > zuiYouWeiZhi) {
    left = zuiYouWeiZhi + kuanDu / 2;
  }
  
  return { top, left, fangXiang };
}

export function XueXiCaiDan({
  show, position, startPosition, text, onClose, onExplain,
  onZiJiHuaFuShu, onParaphrase,
}: XueXiCaiDanProps) {
  const [animatedPosition, setAnimatedPosition] = useState(position);
  const [fangXiang, setFangXiang] = useState<'shang' | 'xia'>('shang');
  const menuRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const zuiJiaWeiZhi = useMemo(
    () => jiSuanZuiJiaWeiZhi(position, CAI_DAN_KUAN_DU, CAI_DAN_GAO_DU, AN_QUAN_BIAN_JU),
    [position.top, position.left]
  );

  useEffect(() => {
    setFangXiang(zuiJiaWeiZhi.fangXiang);
  }, [zuiJiaWeiZhi.fangXiang]);
  
  useEffect(() => {
    if (show && startPosition) {
      const zuiJiaMuDiWeiZhi = jiSuanZuiJiaWeiZhi(
        { top: startPosition.top - 10, left: startPosition.left },
        CAI_DAN_KUAN_DU,
        CAI_DAN_GAO_DU,
        AN_QUAN_BIAN_JU
      );
      setAnimatedPosition(startPosition);
      setFangXiang(zuiJiaMuDiWeiZhi.fangXiang);
      startTimeRef.current = performance.now();
      const duation = 300;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duation, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const muDiWeiZhi = jiSuanZuiJiaWeiZhi(
          { top: position.top - 10, left: position.left },
          CAI_DAN_KUAN_DU,
          CAI_DAN_GAO_DU,
          AN_QUAN_BIAN_JU
        );
        
        const currentTop = startPosition.top + (muDiWeiZhi.top - startPosition.top) * eased;
        const currentLeft = startPosition.left + (muDiWeiZhi.left - startPosition.left) * eased;
        
        setAnimatedPosition({ top: currentTop, left: currentLeft });
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setAnimatedPosition({ top: zuiJiaWeiZhi.top, left: zuiJiaWeiZhi.left });
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [show, startPosition, position.top, position.left]);

  useEffect(() => {
    if (!startPosition) {
      setAnimatedPosition(position);
    }
  }, [position.top, position.left]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (show) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  const handleXueXi = () => {
    onExplain(text);
    onClose();
  };

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${animatedPosition.top}px`,
    left: `${animatedPosition.left}px`,
    zIndex: 9999,
    transform: fangXiang === 'shang' 
      ? 'translate(-50%, -100%)' 
      : 'translate(-50%, 0)',
    transition: 'opacity 0.2s ease',
    opacity: show ? 1 : 0,
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9998,
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    ...(fangXiang === 'shang'
      ? { bottom: '-10px', borderTop: '10px solid rgba(51, 51, 51, 0.95)' }
      : { top: '-10px', borderBottom: '10px solid rgba(51, 51, 51, 0.95)' }),
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    padding: '0.75rem',
    minWidth: '200px',
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    textAlign: 'center' as const,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.875rem',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    width: '100%',
    marginBottom: '0.5rem',
  };

  const handleParaphrase = () => {
    if (onParaphrase) {
      onParaphrase(text);
      onClose();
    }
  };

  const handleZiJiHuaFuShu = () => {
    onZiJiHuaFuShu(text);
    onClose();
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  return (
    <>
      <div style={overlayStyle} onClick={(e) => { e.stopPropagation(); onClose(); }} />
      <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
        <div style={arrowStyle} />
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={closeButtonStyle}
        >
          <X size={16} />
        </button>
        <div style={titleStyle}>智能学习</div>
        <button
          onClick={(e) => { e.stopPropagation(); handleXueXi(); }}
          style={{ ...buttonStyle, backgroundColor: '#8b5cf6', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#7c3aed'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#8b5cf6'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <Brain size={18} />
          AI概念解释
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZiJiHuaFuShu(); }}
          style={{ ...buttonStyle, backgroundColor: '#3b82f6', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#3b82f6'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <Brain size={18} />
          考考我
        </button>
        {onParaphrase && (
          <button
            onClick={(e) => { e.stopPropagation(); handleParaphrase(); }}
            style={{ ...buttonStyle, backgroundColor: '#10b981', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#059669'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#10b981'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            <RefreshCw size={18} />
            AI改写
          </button>
        )}
      </div>
      </div>
    </>
  );
}
