// @审计已完成
// 笔记抽屉面板 - 划线笔记和复述记录，标签页切换

import React, { useState, useEffect } from 'react';
import type { HuaXianYanSe } from '../hooks/useHuaXianChuTi';
import type { HuaXianXinXi } from '@shared/services/annotationService';
import type { NavItem } from 'epubjs';
import { paraphraseService, type ParaphraseRecord } from '@shared/services/paraphraseService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

interface BiJiChouTiProps {
  highlights: HuaXianXinXi[];
  bookId: string;
  onDelete: (id: string) => void;
  onJump: (huaXian: HuaXianXinXi) => void;
  onGuanBi: () => void;
  zhangJieLieBiao?: NavItem[];
}

const YAN_SE_COLOR: Record<HuaXianYanSe, string> = {
  yellow: '#000000',
  green: '#000000',
  blue: '#000000',
  pink: '#000000',
};

type BiaoQian = 'huaxian' | 'fushu';

export function BiJiChouTi({ highlights, bookId, onDelete, onJump, onGuanBi, zhangJieLieBiao }: BiJiChouTiProps) {
  const [biaoQian, setBiaoQian] = useState<BiaoQian>('huaxian');
  const [fuShuJiLu, setFuShuJiLu] = useState<ParaphraseRecord[]>([]);
  const [jiaZaiZhong, setJiaZaiZhong] = useState(false);
  const [zhanKaiJiLu, setZhanKaiJiLu] = useState<Set<string>>(new Set());

  function huoQuZhangJieMing(chapterId?: string): string {
    if (!chapterId || !zhangJieLieBiao?.length) return '';
    const zhang = zhangJieLieBiao.find(z => z.href.includes(chapterId) || z.id === chapterId);
    return zhang?.label || '';
  }

  const paiXuHouDeHuaXian = [...highlights].sort((a, b) => b.createdAt - a.createdAt);

  const qieHuanZhanKai = (id: string) => {
    const xinZhanKai = new Set(zhanKaiJiLu);
    if (xinZhanKai.has(id)) {
      xinZhanKai.delete(id);
    } else {
      xinZhanKai.add(id);
    }
    setZhanKaiJiLu(xinZhanKai);
  };

  useEffect(() => {
    if (biaoQian === 'fushu') {
      jiaZaiFuShuJiLu();
    }
  }, [biaoQian, bookId]);

  const jiaZaiFuShuJiLu = async () => {
    setJiaZaiZhong(true);
    try {
      const { records, error } = await paraphraseService.getParaphrasesByBook(bookId);
      if (error) {
        showError('加载复述记录失败：' + error);
        return;
      }
      setFuShuJiLu(records);
    } finally {
      setJiaZaiZhong(false);
    }
  };

  const shanChuFuShu = async (id: string) => {
    try {
      const { error } = await paraphraseService.deleteParaphrase(id);
      if (error) {
        showError('删除失败：' + error);
        return;
      }
      setFuShuJiLu(prev => prev.filter(r => r.id !== id));
      showSuccess('删除成功');
    } catch (e) {
      console.error('删除复述记录失败:', e);
      showError('删除失败，请稍后重试');
    }
  };

  return (
    <div style={{
      width: '360px',
      height: '100%',
      backgroundColor: '#252525',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 10001,
      animation: 'slideInRight 0.25s ease-out',
    }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
          {biaoQian === 'huaxian' ? `笔记 (${highlights.length})` : `复述 (${fuShuJiLu.length})`}
        </h3>
        <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        <button
          onClick={() => setBiaoQian('huaxian')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: biaoQian === 'huaxian' ? '#2d2d2d' : 'transparent',
            color: biaoQian === 'huaxian' ? '#f3f4f6' : '#6b7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderBottom: biaoQian === 'huaxian' ? '2px solid #60a5fa' : '2px solid transparent',
          }}
        >
          划线笔记
        </button>
        <button
          onClick={() => setBiaoQian('fushu')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: biaoQian === 'fushu' ? '#2d2d2d' : 'transparent',
            color: biaoQian === 'fushu' ? '#f3f4f6' : '#6b7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderBottom: biaoQian === 'fushu' ? '2px solid #60a5fa' : '2px solid transparent',
          }}
        >
          复述记录
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {biaoQian === 'huaxian' ? (
          paiXuHouDeHuaXian.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <svg width="48" height="48" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>暂无笔记</p>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.78rem' }}>在阅读时划线并添加想法</p>
            </div>
          ) : (
            paiXuHouDeHuaXian.map(h => (
              <div
                key={h.id}
                onClick={() => onJump(h)}
                style={{
                  padding: '0.85rem',
                  marginBottom: '0.6rem',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'border-color 0.12s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: YAN_SE_COLOR[h.yanSe], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    {new Date(h.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(h.id); }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.15rem', opacity: 0.6 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.87rem', color: '#d1d5db', lineHeight: 1.6 }}>{h.text}</p>
                {h.beiZhu && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid #374151', paddingTop: '0.4rem' }}>
                    💡 {h.beiZhu}
                  </p>
                )}
              </div>
            ))
          )
        ) : (
          jiaZaiZhong ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid rgba(96, 165, 250, 0.2)',
                borderTopColor: '#60a5fa',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>加载中...</p>
            </div>
          ) : fuShuJiLu.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
              <svg width="48" height="48" fill="none" stroke="#4b5563" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>暂无复述记录</p>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.78rem' }}>选择文本后使用「用自己的话复述」</p>
            </div>
          ) : (
            fuShuJiLu.map(jiLu => {
              // 确定类型标签和颜色
              let leiXingBiaoQian = '';
              let leiXingYanSe = '';
              let leiXingBeiJing = '';
              let leiXingTuBiao = '';
              let xianShiYuanWen = true;
              
              if (jiLu.type === 'concept') {
                leiXingBiaoQian = '概念';
                leiXingYanSe = '#3b82f6';
                leiXingBeiJing = 'rgba(59, 130, 246, 0.15)';
                leiXingTuBiao = '📚';
                xianShiYuanWen = false;
              } else if (jiLu.type === 'understanding') {
                leiXingBiaoQian = '理解';
                leiXingYanSe = '#8b5cf6';
                leiXingBeiJing = 'rgba(139, 92, 246, 0.15)';
                leiXingTuBiao = '💡';
              } else if (jiLu.type === 'ai_paraphrase') {
                leiXingBiaoQian = 'AI复述';
                leiXingYanSe = '#10b981';
                leiXingBeiJing = 'rgba(16, 185, 129, 0.15)';
                leiXingTuBiao = '🤖';
              } else {
                leiXingBiaoQian = '其他';
                leiXingYanSe = '#6b7280';
                leiXingBeiJing = 'rgba(107, 114, 128, 0.15)';
                leiXingTuBiao = '📝';
              }

              const shiFouZhanKai = zhanKaiJiLu.has(jiLu.id);
              const yuanWenGuoChang = jiLu.original_text.length > 120;
              const fuShuGuoChang = jiLu.paraphrased_text.length > 200;
              const pingJiaGuoChang = (jiLu.ai_evaluation?.length || 0) > 300;
              const xuYaoZhanKai = yuanWenGuoChang || fuShuGuoChang || pingJiaGuoChang;

              const xianShiYuanWenNeiRong = shiFouZhanKai || !yuanWenGuoChang 
                ? jiLu.original_text 
                : jiLu.original_text.substring(0, 120) + '...';

              const xianShiFuShuNeiRong = shiFouZhanKai || !fuShuGuoChang 
                ? jiLu.paraphrased_text 
                : jiLu.paraphrased_text.substring(0, 200) + '...';

              const xianShiPingJiaNeiRong = !jiLu.ai_evaluation 
                ? '' 
                : (shiFouZhanKai || !pingJiaGuoChang 
                  ? jiLu.ai_evaluation 
                  : jiLu.ai_evaluation.substring(0, 300) + '...');
              
              return (
                <div
                  key={jiLu.id}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.backgroundColor = '#333333';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.backgroundColor = '#2d2d2d';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {jiLu.type === 'concept' && jiLu.concept_name && (
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: '#f3f4f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}>
                          {jiLu.concept_name}
                        </span>
                      )}
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 600, 
                        color: leiXingYanSe,
                        backgroundColor: leiXingBeiJing,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>{leiXingTuBiao}</span>
                        {leiXingBiaoQian}
                      </span>
                      {jiLu.type === 'understanding' && jiLu.chapter_id && huoQuZhangJieMing(jiLu.chapter_id) && (
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#9ca3af',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                        }}>
                          {huoQuZhangJieMing(jiLu.chapter_id)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {new Date(jiLu.created_at).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => shanChuFuShu(jiLu.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#6b7280', 
                          cursor: 'pointer', 
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {xianShiYuanWen && (
                    <div style={{ marginBottom: '0.6rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        marginBottom: '0.35rem',
                      }}>
                        <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
                          📖 原文
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.8rem', 
                        color: '#9ca3af', 
                        lineHeight: 1.6,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                      }}>
                        {xianShiYuanWenNeiRong}
                      </p>
                    </div>
                  )}
                  
                  <div style={{ marginBottom: jiLu.ai_evaluation ? '0.6rem' : '0' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
                        ✍️ 复述
                      </span>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.85rem', 
                      color: '#e5e7eb', 
                      lineHeight: 1.7,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.55rem 0.7rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      {xianShiFuShuNeiRong}
                    </p>
                  </div>
                  
                  {jiLu.ai_evaluation && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        marginBottom: '0.35rem',
                      }}>
                        <span style={{ fontSize: '0.72rem', color: leiXingYanSe, fontWeight: 500 }}>
                          🤔 AI 评价
                        </span>
                      </div>
                      <div style={{ 
                        padding: '0.65rem 0.75rem', 
                        backgroundColor: leiXingBeiJing, 
                        borderRadius: '8px',
                        border: '1px solid ' + leiXingYanSe + '33',
                      }}>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.8rem', 
                          color: leiXingYanSe, 
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          fontWeight: 400,
                        }}>
                          {xianShiPingJiaNeiRong}
                        </p>
                      </div>
                    </div>
                  )}

                  {xuYaoZhanKai && (
                    <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => qieHuanZhanKai(jiLu.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#9ca3af';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {shiFouZhanKai ? (
                          <>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                            收起
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            展开查看全部
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
