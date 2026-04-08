// @审计已完成
// 概念解释组件 - 解释专业名词

import { useState } from 'react';
import { Copy, ArrowLeft } from 'lucide-react';
import { aiService, type ConceptExplanationResult } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface GaiNianJieShiProps {
  content: string;
  onComplete: () => void;
  onBack: () => void;
}

interface JieShiZhuangTai {
  jieGuo: ConceptExplanationResult | null;
  error: string | null;
}

export function GaiNianJieShi({ content, onComplete, onBack }: GaiNianJieShiProps) {
  const [zhuangTai, setZhuangTai] = useState<JieShiZhuangTai>({ jieGuo: null, error: null });
  const [jiaZai, setJiaZai] = useState(false);

  const huoQuJieShi = async () => {
    setJiaZai(true);
    try {
      const { data, error } = await aiService.explainConcept(content);
      if (error) {
        showError('解释失败：' + error);
        setZhuangTai({ jieGuo: null, error });
        return;
      }
      setZhuangTai({ jieGuo: data, error: null });
    } finally {
      setJiaZai(false);
    }
  };

  useState(() => {
    huoQuJieShi();
  }, []);

  const fuZhiJieShi = async () => {
    if (!zhuangTai.jieGuo) return;
    try {
      await navigator.clipboard.writeText(
        `${content}\n\n解释：${zhuangTai.jieGuo.explanation}\n\n例子：${zhuangTai.jieGuo.example}`
      );
      showSuccess('已复制到剪贴板');
    } catch {
      showError('复制失败');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '32rem', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
            返回阅读
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9375rem', fontWeight: 600 }}>{content}</p>
        </div>

        {jiaZai ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <JiaZaiZhuangTai />
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>正在解释...</p>
          </div>
        ) : zhuangTai.jieGuo ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>解释</p>
              <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9375rem' }}>{zhuangTai.jieGuo.explanation}</p>
            </div>

            {zhuangTai.jieGuo.example && (
              <div style={{ marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>例子</p>
                <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9375rem' }}>{zhuangTai.jieGuo.example}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={fuZhiJieShi} style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Copy size={18} />
                复制
              </button>
              <button onClick={onComplete} style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                完成
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
