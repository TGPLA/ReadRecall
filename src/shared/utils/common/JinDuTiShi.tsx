// @审计已完成
// 进度提示组件 - 显示长时间操作的进度

interface JinDuTiShiProps {
  zhuangTai: string;
  jinDu?: number;
  chiCun?: 'small' | 'medium' | 'large';
}

export function JinDuTiShi({ zhuangTai, jinDu, chiCun = 'medium' }: JinDuTiShiProps) {
  const chiCunMap = {
    small: { spinner: '1.25rem', text: '0.75rem', bar: '0.25rem' },
    medium: { spinner: '1.5rem', text: '0.875rem', bar: '0.375rem' },
    large: { spinner: '2rem', text: '1rem', bar: '0.5rem' },
  };

  const { spinner, text, bar } = chiCunMap[chiCun];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{
          width: spinner,
          height: spinner,
          border: '2px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: '#6b7280', fontSize: text }}>{zhuangTai}</span>
      </div>
      {jinDu !== undefined && (
        <div style={{
          width: '100%',
          maxWidth: '200px',
          height: bar,
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${jinDu}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function QuanPingJinDu({ zhuangTai, jinDu }: { zhuangTai: string; jinDu?: number }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <JinDuTiShi zhuangTai={zhuangTai} jinDu={jinDu} chiCun="large" />
    </div>
  );
}