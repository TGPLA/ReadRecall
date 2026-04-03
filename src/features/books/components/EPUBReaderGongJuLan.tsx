// @审计已完成
// EPUB 阅读器工具栏组件

import React from 'react';
import type { ZhuTiLeiXing } from '../hooks/useZhuTi';
import { EPUBGongJuLanBiaoTiQu } from './EPUBGongJuLanBiaoTiQu';
import { EPUBGongJuLanSouSuoQu } from './EPUBGongJuLanSouSuoQu';
import { EPUBGongJuLanKongZhiQu } from './EPUBGongJuLanKongZhiQu';

interface EPUBReaderGongJuLanProps {
  darkMode: boolean;
  zhuTi: ZhuTiLeiXing;
  onZhuTiBianHua: (zhuTi: ZhuTiLeiXing) => void;
  ziTiDaXiao: number;
  onZiTiDaXiaoBianHua: (daXiao: number) => void;
  souSuoCi: string;
  onSouSuoCiBianHua: (ci: string) => void;
  souSuoJieGuoShuLiang: number;
  dangQianJieGuo: number;
  onShangYiGe: () => void;
  onXiaYiGe: () => void;
  yeMaXinXi: string;
  onClose: () => void;
  huaCiKaiQi: boolean;
  onHuaCiQieHuan: () => void;
  gaoLiangShuLiang: number;
  onGaoLiangCeLanToggle: () => void;
}

export function EPUBReaderGongJuLan({ 
  darkMode, 
  zhuTi, 
  onZhuTiBianHua,
  ziTiDaXiao,
  onZiTiDaXiaoBianHua,
  souSuoCi,
  onSouSuoCiBianHua,
  souSuoJieGuoShuLiang,
  dangQianJieGuo,
  onShangYiGe,
  onXiaYiGe,
  yeMaXinXi,
  onClose,
  huaCiKaiQi,
  onHuaCiQieHuan,
  gaoLiangShuLiang,
  onGaoLiangCeLanToggle,
}: EPUBReaderGongJuLanProps) {
  return (
    <div style={{ 
      padding: '1rem', 
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
      alignItems: 'center',
      gap: '0.5rem',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      zIndex: 1000
    }}>
      <EPUBGongJuLanBiaoTiQu darkMode={darkMode} yeMaXinXi={yeMaXinXi} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <EPUBGongJuLanSouSuoQu
          darkMode={darkMode}
          souSuoCi={souSuoCi}
          onSouSuoCiBianHua={onSouSuoCiBianHua}
          souSuoJieGuoShuLiang={souSuoJieGuoShuLiang}
          dangQianJieGuo={dangQianJieGuo}
          onShangYiGe={onShangYiGe}
          onXiaYiGe={onXiaYiGe}
        />
        <EPUBGongJuLanKongZhiQu
          darkMode={darkMode}
          zhuTi={zhuTi}
          onZhuTiBianHua={onZhuTiBianHua}
          ziTiDaXiao={ziTiDaXiao}
          onZiTiDaXiaoBianHua={onZiTiDaXiaoBianHua}
          huaCiKaiQi={huaCiKaiQi}
          onHuaCiQieHuan={onHuaCiQieHuan}
          onClose={onClose}
        />
        <button
          onClick={onGaoLiangCeLanToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem 0.75rem',
            border: 'none',
            borderRadius: '0.5rem',
            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
            color: darkMode ? '#f9fafb' : '#374151',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
          title="高亮列表"
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          高亮 ({gaoLiangShuLiang})
        </button>
      </div>
    </div>
  );
}
