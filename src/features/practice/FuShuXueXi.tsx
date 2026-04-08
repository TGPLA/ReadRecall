// @审计已完成
// 复述学习组件 - 选中文字 → 复述 → AI评价

import { useState } from 'react';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface FuShuState {
  userAnswer: string;
  evaluation: string | null;
}

interface FuShuXueXiProps {
  chapterId?: string;
  paragraphId?: string;
  content: string;
  onComplete: () => void;
  onBack: () => void;
}

export function FuShuXueXi({ content, onComplete, onBack }: FuShuXueXiProps) {
  const [state, setState] = useState<FuShuState>({ userAnswer: '', evaluation: null });
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!state.userAnswer.trim()) return;
    setEvaluating(true);
    setError(null);
    const { data, error: apiError } = await aiService.evaluateConcept('', content, state.userAnswer);
    if (apiError || !data) {
      setError(apiError || '评价失败');
      showError(apiError || '评价失败');
      setEvaluating(false);
      return;
    }
    setState(prev => ({ ...prev, evaluation: data.evaluation }));
    setEvaluating(false);
    showSuccess('评价完成');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '32rem', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回阅读
          </button>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9375rem' }}>{content}</p>
        </div>
        {!state.evaluation ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>用自己的话复述</p>
            <textarea
              value={state.userAnswer}
              onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
              placeholder="读完之后，用你自己的话怎么说？"
              disabled={evaluating}
              style={{ width: '100%', minHeight: '8rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.9375rem', resize: 'vertical', backgroundColor: evaluating ? '#f3f4f6' : '#ffffff', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={handleEvaluate} disabled={!state.userAnswer.trim() || evaluating} style={{ padding: '0.75rem 2rem', backgroundColor: !state.userAnswer.trim() || evaluating ? '#9ca3af' : '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !state.userAnswer.trim() || evaluating ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem' }}>
                {evaluating ? '评价中...' : '提交复述'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>AI 点评</p>
            <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem' }}>
              <p style={{ color: '#7c3aed', lineHeight: 1.6 }}>{state.evaluation}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setState({ userAnswer: '', evaluation: null })} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                再次练习
              </button>
              <button onClick={onComplete} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                完成学习
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
