// @审计已完成
// 空状态组件 - 内容为空时显示的友好提示

import { getResponsiveValue } from '@shared/utils/responsive';

interface KongZhuangTaiProps {
  biaoTi?: string;
  tiaoShi?: string;
  tuBiao?: string;
  anNiu?: {
    wenAn: string;
    onClick: () => void;
  };
  darkMode?: boolean;
}

export function KongZhuangTai({ 
  biaoTi = '暂无内容', 
  tiaoShi, 
  tuBiao = '📭',
  anNiu,
  darkMode = false,
}: KongZhuangTaiProps) {
  const beiJingYanSe = darkMode ? '#1f2937' : '#ffffff';
  const wenBenYanSe = darkMode ? '#f9fafb' : '#111827';
  const ciJiYanSe = darkMode ? '#9ca3af' : '#6b7280';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveValue({ mobile: '2rem', tablet: '3rem' }),
      textAlign: 'center',
      minHeight: '200px',
    }}>
      <div style={{
        fontSize: getResponsiveValue({ mobile: '2.5rem', tablet: '3rem' }),
        marginBottom: '1rem',
      }}>
        {tuBiao}
      </div>
      <h3 style={{
        fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }),
        fontWeight: 600,
        color: wenBenYanSe,
        marginBottom: '0.5rem',
        margin: 0,
      }}>
        {biaoTi}
      </h3>
      {tiaoShi && (
        <p style={{
          fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }),
          color: ciJiYanSe,
          margin: 0,
          maxWidth: '300px',
        }}>
          {tiaoShi}
        </p>
      )}
      {anNiu && (
        <button
          onClick={anNiu.onClick}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {anNiu.wenAn}
        </button>
      )}
    </div>
  );
}