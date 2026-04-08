// @审计已完成
// 智能学习菜单组件 - 根据文本类型显示相关学习选项

import { useState, useEffect, useRef } from 'react';
import { Brain, BookOpen, Lightbulb } from 'lucide-react';
import { aiService, type TextAnalysisResult } from '@shared/services/aiService';
import { showError } from '@shared/utils/common/ToastTiShi';

interface XueXiCaiDanProps {
  show: boolean;
  position: { top: number; left: number };
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
  show, position, text, chapterId, darkMode, onClose, onExplain, onParaphrase, onQuiz,
}: XueXiCaiDanProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    transform: 'translate(-50%, -100%)',
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    padding: '0.5rem',
    minWidth: '200px',
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

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
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
                onClick={() => handleXuanXiang(option)}
                style={optionStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(96, 165, 250, 0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {XUAN_XIANG_TU_BIAO[option]}
                {XUAN_XIANG_BIAO_TI[option]}
              </button>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
