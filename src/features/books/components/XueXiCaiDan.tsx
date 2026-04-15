// @审计已完成
// 智能学习菜单组件 - 根据文本类型显示相关学习选项

import { useState, useEffect, useRef } from 'react';
import { Brain, BookOpen, Lightbulb, X } from 'lucide-react';
import { aiService, type TextAnalysisResult } from '@shared/services/aiService';
import { showError } from '@shared/utils/common/ToastTiShi';

interface XueXiCaiDanProps {
  show: boolean;
  position: { top: number; left: number };
  startPosition?: { top: number; left: number } | null;
  text: string;
  chapterId?: string;
  darkMode?: boolean;
  onClose: () => void;
  onExplain: (text: string) => void;
  onParaphrase: (text: string) => void;
  onQuiz: (text: string) => void;
}

const XUAN_XIANG_BIAO_TI: Record<string, string> = {
  explain: '解释概念',
  paraphrase: '用自己的话复述',
  quiz: 'AI出题考我',
};

const XUAN_XIANG_TU_BIAO: Record<string, React.ReactNode> = {
  explain: <Lightbulb size={16} />,
  paraphrase: <BookOpen size={16} />,
  quiz: <Brain size={16} />,
};

export function XueXiCaiDan({
  show, position, startPosition, text, chapterId, darkMode, onClose, onExplain, onParaphrase, onQuiz,
}: XueXiCaiDanProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [animatedPosition, setAnimatedPosition] = useState(position);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (show && startPosition) {
      setAnimatedPosition(startPosition);
      startTimeRef.current = performance.now();
      const duation = 300;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duation, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentTop = startPosition.top + (position.top - startPosition.top) * eased;
        const currentLeft = startPosition.left + (position.left - startPosition.left) * eased;
        
        setAnimatedPosition({ top: currentTop, left: currentLeft });
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setAnimatedPosition(position);
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
    if (show && text) {
      huoQuFenXi();
    }
  }, [show, text]);

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
  console.log('[DEBUG XueXiCaiDan] 组件渲染成功');

  const huoQuFenXi = async () => {
    setLoading(true);
    try {
      const { data, error } = await aiService.analyzeText(text);
      if (error) {
        showError('分析失败：' + error);
        setAnalysis({
          type: 'other',
          title: '文本',
          options: ['paraphrase', 'quiz'],
          description: '这段文本可以通过复述或出题来学习',
        });
        return;
      }
      setAnalysis(data);
    } finally {
      setLoading(false);
    }
  };

  const handleXuanXiang = (option: string) => {
    switch (option) {
      case 'explain':
        onExplain(text);
        break;
      case 'paraphrase':
        onParaphrase(text);
        break;
      case 'quiz':
        onQuiz(text);
        break;
    }
    onClose();
  };

  if (!show) return null;

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${animatedPosition.top}px`,
    left: `${animatedPosition.left}px`,
    zIndex: 9999,
    transform: 'translate(-50%, -100%)',
    transition: 'opacity 0.2s ease',
    opacity: show ? 1 : 0,
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    padding: '0.5rem',
    minWidth: '200px',
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    padding: '0.25rem 0.5rem',
  };

  const descStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.7rem',
    marginBottom: '0.5rem',
    padding: '0 0.5rem',
  };

  const optionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    borderRadius: '0.5rem',
    transition: 'all 0.15s',
    width: '100%',
    textAlign: 'left' as const,
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#ff4444',
    border: '2px solid white',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 10000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  };

  const bottomCloseButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    marginTop: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.5rem',
    color: '#ffffff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    width: '100%',
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={closeButtonStyle}
        >
          ✕
        </button>
        {loading ? (
          <div style={{ padding: '1rem', color: '#ffffff', textAlign: 'center', fontSize: '0.8rem' }}>
            分析中...
          </div>
        ) : analysis ? (
          <>
            <div style={titleStyle}>{analysis.title}</div>
            <div style={descStyle}>{analysis.description}</div>
            {analysis.options.map(option => (
              <button
                key={option}
                onClick={(e) => { e.stopPropagation(); handleXuanXiang(option); }}
                style={optionStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(96, 165, 250, 0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {XUAN_XIANG_TU_BIAO[option]}
                {XUAN_XIANG_BIAO_TI[option]}
              </button>
            ))}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={bottomCloseButtonStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
            >
              <X size={14} />
              关闭
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
