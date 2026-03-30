// @审计已完成
// 概念学习组件 - 左侧概念列表 + 右侧详情，支持自由选择概念

import { useState, useEffect, useRef } from 'react';
import type { Paragraph } from '@infrastructure/types';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface Concept {
  id?: string;
  concept: string;
  explanation: string;
}

interface ConceptState {
  userAnswer: string;
  evaluation: string | null;
  completed: boolean;
}

interface GaiNianXueXiProps {
  chapterId?: string;
  paragraphId?: string;
  content: string;
  onComplete: () => void;
  onBack: () => void;
}

export function GaiNianXueXi({ chapterId, paragraphId, content, onComplete, onBack }: GaiNianXueXiProps) {
  const [loading, setLoading] = useState(true);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [conceptStates, setConceptStates] = useState<Record<number, ConceptState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceKey = chapterId ? `chapter-${chapterId}` : `paragraph-${paragraphId}`;

  useEffect(() => {
    const extractConcepts = async () => {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await aiService.extractConcepts(chapterId, paragraphId, content);
      if (apiError || !data) {
        setError(apiError || '提取概念失败');
        showError(apiError || '提取概念失败');
        setLoading(false);
        return;
      }
      
      const seenConcepts = new Set<string>();
      const uniqueConcepts = data.concepts.filter((concept) => {
        if (seenConcepts.has(concept.concept)) {
          return false;
        }
        seenConcepts.add(concept.concept);
        return true;
      });
      
      if (uniqueConcepts.length !== data.concepts.length) {
        console.log(`⚠️ 发现重复概念，已去重。原数量: ${data.concepts.length}, 去重后数量: ${uniqueConcepts.length}`);
      }
      
      setConcepts(uniqueConcepts);
      const initialStates: Record<number, ConceptState> = {};
      uniqueConcepts.forEach((_, index) => {
        initialStates[index] = { userAnswer: '', evaluation: null, completed: false };
      });
      setConceptStates(initialStates);
      setLoading(false);
    };

    extractConcepts();
  }, [chapterId, paragraphId, content]);

  const currentConcept = concepts[currentIndex];
  const currentState = conceptStates[currentIndex] || { userAnswer: '', evaluation: null, completed: false };

  const handleEvaluate = async () => {
    if (!currentState.userAnswer.trim()) return;
    setEvaluating(true);
    setError(null);
    const { data, error: apiError } = await aiService.evaluateConcept(
      currentConcept.concept,
      currentConcept.explanation,
      currentState.userAnswer
    );
    if (apiError || !data) {
      setError(apiError || '评价失败');
      showError(apiError || '评价失败');
      setEvaluating(false);
      return;
    }

    const evaluation = data.evaluation;

    if (currentConcept.id) {
      const { error: saveError } = await aiService.saveConceptPractice(
        currentConcept.id,
        currentState.userAnswer,
        evaluation
      );
      if (saveError) {
        console.warn('保存练习记录失败:', saveError);
      }
    }

    setConceptStates(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        evaluation: evaluation,
        completed: true
      }
    }));
    setEvaluating(false);
    showSuccess('评价完成');
  };

  const handleSelectConcept = (index: number) => {
    setCurrentIndex(index);
    setError(null);
  };

  const completedCount = Object.values(conceptStates).filter(state => state.completed).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <JiaZaiZhuangTai chiCun="medium" />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>正在提取概念...</p>
        </div>
      </div>
    );
  }

  if (error && concepts.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
          <button onClick={onComplete} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>返回</button>
        </div>
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>未提取到任何概念</p>
          <button onClick={onComplete} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TouBu completedCount={completedCount} total={concepts.length} onBack={onBack} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <GaiNianLieBiao
          concepts={concepts}
          conceptStates={conceptStates}
          currentIndex={currentIndex}
          onSelectConcept={handleSelectConcept}
        />
        <GaiNianXiangQing
          content={content}
          concept={currentConcept}
          conceptState={currentState}
          onUserAnswerChange={(answer) => setConceptStates(prev => ({
            ...prev,
            [currentIndex]: { ...prev[currentIndex], userAnswer: answer }
          }))}
          onEvaluate={handleEvaluate}
          evaluating={evaluating}
          error={error}
        />
      </div>
    </div>
  );
}

function TouBu({ completedCount, total, onBack }: { completedCount: number; total: number; onBack: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ padding: '1rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>名词解释</h1>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{completedCount} / {total} 已完成</span>
        </div>
        <div style={{ marginTop: '0.5rem', height: '0.25rem', backgroundColor: '#e5e7eb', borderRadius: '0.125rem' }}>
          <div style={{ height: '100%', width: `${(completedCount / total) * 100}%`, backgroundColor: '#8b5cf6', borderRadius: '0.125rem', transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}

function GaiNianLieBiao({
  concepts,
  conceptStates,
  currentIndex,
  onSelectConcept
}: {
  concepts: Concept[];
  conceptStates: Record<number, ConceptState>;
  currentIndex: number;
  onSelectConcept: (index: number) => void;
}) {
  return (
    <div style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>概念列表</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {concepts.map((concept, index) => {
            const state = conceptStates[index];
            const isSelected = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => onSelectConcept(index)}
                style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  border: isSelected ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#111827', flex: 1, wordBreak: 'break-word' }}>
                    {concept.concept}
                  </span>
                  {state?.completed && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', flexShrink: 0 }}>✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GaiNianXiangQing({
  content,
  concept,
  conceptState,
  onUserAnswerChange,
  onEvaluate,
  evaluating,
  error
}: {
  content: string;
  concept: Concept;
  conceptState: ConceptState;
  onUserAnswerChange: (answer: string) => void;
  onEvaluate: () => void;
  evaluating: boolean;
  error: string | null;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <DuanLuoXianShi content={content} />
        <GaiNianKa concept={concept.concept} />
        <JieShiKa explanation={concept.explanation} />
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}
        {!conceptState.evaluation ? (
          <FuShuShuRu
            userAnswer={conceptState.userAnswer}
            setUserAnswer={onUserAnswerChange}
            loading={evaluating}
            onSubmit={onEvaluate}
          />
        ) : (
          <DianPingXianShi evaluation={conceptState.evaluation} />
        )}
      </div>
    </div>
  );
}

function DuanLuoXianShi({ content }: { content: string }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>原文</h2>
      <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.875rem' }}>{content}</p>
    </div>
  );
}

function GaiNianKa({ concept }: { concept: string }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem', borderLeft: '4px solid #8b5cf6' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.5rem' }}>概念</h2>
      <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>{concept}</p>
    </div>
  );
}

function JieShiKa({ explanation }: { explanation: string }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>专业解释</h2>
      <p style={{ color: '#374151', lineHeight: 1.6 }}>{explanation}</p>
    </div>
  );
}

function FuShuShuRu({ userAnswer, setUserAnswer, loading, onSubmit }: { userAnswer: string; setUserAnswer: (a: string) => void; loading: boolean; onSubmit: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>用自己的话复述</h2>
      <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="请用自己的话解释这个概念..." disabled={loading} style={{ width: '100%', minHeight: '6rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', backgroundColor: loading ? '#f3f4f6' : '#ffffff' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={onSubmit} disabled={!userAnswer.trim() || loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: !userAnswer.trim() || loading ? '#9ca3af' : '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !userAnswer.trim() || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? <><JiaZaiZhuangTai chiCun="small" /><span>评价中...</span></> : '提交复述'}
        </button>
      </div>
    </div>
  );
}

function DianPingXianShi({ evaluation }: { evaluation: string }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>AI 点评</h2>
      <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem' }}>
        <p style={{ color: '#7c3aed', lineHeight: 1.6 }}>{evaluation}</p>
      </div>
    </div>
  );
}
