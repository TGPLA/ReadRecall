// @审计已完成
// 复述组件 - 展示AI复述的内容

import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

interface FuShuProps {
  text: string;
  onClose: () => void;
}

export function FuShu({ text, onClose }: FuShuProps) {
  const [loading, setLoading] = useState(false);
  const [paraphrase, setParaphrase] = useState('');

  useEffect(() => {
    huoQuFuShu();
  }, [text]);

  const huoQuFuShu = async () => {
    setLoading(true);
    try {
      const { data, error } = await aiService.paraphraseText(text);
      if (error) {
        showError('复述失败：' + error);
        return;
      }
      if (data) {
        setParaphrase(data.paraphrase);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChongXin = () => {
    huoQuFuShu();
  };

  const handleWanCheng = () => {
    showSuccess('复述学习完成！');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'var(--zhi-zhen-bei-jing)',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--bian-kuang)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(96, 165, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>用自己的话复述</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ci-yao-wen-zi)' }}>
                换个方式理解这段内容
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'var(--ci-yao-wen-zi)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--ye-du-bei-jing)',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--wen-zi)',
              lineHeight: 1.8,
            }}>
              "{text}"
            </p>
          </div>

          {loading ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(96, 165, 250, 0.2)',
                borderTopColor: '#60a5fa',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ margin: 0, color: 'var(--ci-yao-wen-zi)', fontSize: '14px' }}>
                AI 正在用另一种方式表达...
              </p>
            </div>
          ) : paraphrase ? (
            <div>
              <div style={{
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>AI 复述版本</span>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '15px',
                  color: 'var(--wen-zi)',
                  lineHeight: 1.9,
                }}>
                  {paraphrase}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleChongXin}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid var(--bian-kuang)',
                    backgroundColor: 'transparent',
                    color: 'var(--wen-zi)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <RefreshCw size={16} />
                  重新复述
                </button>
                <button
                  onClick={handleWanCheng}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    backgroundColor: '#60a5fa',
                    color: '#ffffff',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  完成学习
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
