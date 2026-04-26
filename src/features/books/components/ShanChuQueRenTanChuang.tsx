// @审计已完成
// 确认模态框 - 支持深色模式和自定义按钮

interface ShanChuQueRenTanChuangProps {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  darkMode?: boolean;
  isDestructive?: boolean;
}

export function ShanChuQueRenTanChuang({ 
  title, 
  content, 
  onConfirm, 
  onCancel, 
  confirmText = '确定',
  cancelText = '取消',
  darkMode = false,
  isDestructive = false,
}: ShanChuQueRenTanChuangProps) {
  const beiJingYanSe = darkMode ? '#1f2937' : '#ffffff';
  const wenBenYanSe = darkMode ? '#f9fafb' : '#111827';
  const ciJiYanSe = darkMode ? '#9ca3af' : '#4b5563';
  const anNiuYanSe = darkMode ? '#374151' : '#d1d5db';
  const poHuaiYanSe = isDestructive ? '#dc2626' : '#3b82f6';
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }} onClick={onCancel}>
      <div style={{
        backgroundColor: beiJingYanSe,
        borderRadius: '0.75rem',
        maxWidth: '24rem',
        width: '100%',
        padding: '1.5rem',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: wenBenYanSe, marginBottom: '0.75rem' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: ciJiYanSe, marginBottom: '1.5rem' }}>
          {content}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: `1px solid ${anNiuYanSe}`,
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: darkMode ? '#f9fafb' : '#374151',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: poHuaiYanSe,
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
