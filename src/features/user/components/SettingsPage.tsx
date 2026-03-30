// @审计已完成
// 设置页面 - 主视图层

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { Settings } from '@infrastructure/types';
import { authService } from '@shared/services/auth';
import { getResponsiveValue } from '@shared/utils/responsive';
import { ZhangHuXinXi } from './ZhangHuXinXi';
import { XiuGaiMiMaTanChuang } from './XiuGaiMiMaTanChuang';
import { showSuccess } from '@shared/utils/common/ToastTiShi';

interface SettingsPageProps {
  onBack: () => void;
  onOpenPrompts: () => void;
}

export function SettingsPage({ onBack, onOpenPrompts }: SettingsPageProps) {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState<Settings>(settings);
  const formDataRef = useRef<Settings>(formData);

  useEffect(() => {
    setFormData(settings);
    formDataRef.current = settings;
  }, [settings]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [version, setVersion] = useState('加载中...');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => setCurrentUser(user));
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetch('/changelog.json')
      .then(res => res.json())
      .then(data => setVersion(data.version || '未知'))
      .catch(() => setVersion('未知'));
  }, []);

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleDarkMode = () => {
    const newSettings = { ...formData, darkMode: !formData.darkMode };
    setFormData(newSettings);
    updateSettings(newSettings);
  };

  const handleLogout = async () => {
    const confirmed = await confirm('确定要退出登录吗？');
    if (confirmed) {
      setLoggingOut(true);
      const { error } = await authService.signOut();
      if (error) {
        alert(`登出失败：${error.message}`);
      } else {
        onBack();
      }
      setLoggingOut(false);
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    const { error } = await authService.updatePassword(newPassword);
    if (error) throw new Error(error.message);
    showSuccess('密码修改成功');
    setShowPasswordModal(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), border: 'none', background: 'none', cursor: 'pointer' }}>
          <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书架
        </button>

        <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>⚙️ 设置</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>外观设置</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '0.75rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) }}>
              <div>
                <p style={{ fontWeight: 500, color: settings.darkMode ? '#f9fafb' : '#111827' }}>深色模式</p>
                <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>切换深色/浅色主题</p>
              </div>
              <button onClick={handleToggleDarkMode} style={{ position: 'relative', width: '3.5rem', height: '1.75rem', borderRadius: '9999px', backgroundColor: formData.darkMode ? '#3b82f6' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: formData.darkMode ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 20px rgba(209, 213, 219, 0.4)' }}>
                <span style={{ position: 'absolute', top: '0.25rem', left: formData.darkMode ? '1.75rem' : '0.25rem', width: '1.25rem', height: '1.25rem', backgroundColor: '#ffffff', borderRadius: '9999px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {formData.darkMode ? (
                    <svg style={{ width: '0.75rem', height: '0.75rem', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg style={{ width: '0.75rem', height: '0.75rem', color: '#6366f1' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.646-3.646 9 9 0 01-2.292-2.292zM12 3a9.003 9.003 0 00-8.646 3.646 9 9 0 012.292 2.292 9 9 0 01-3.646 8.646A9.003 9.003 0 0012 21a9.003 9.003 0 003.646-8.646 9 9 0 01-2.292-2.292z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), cursor: 'pointer' }} onClick={onOpenPrompts}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '0.25rem' }}>📝 提示词模板管理</h2>
                <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>管理三类 AI 出题的提示词模板</p>
              </div>
              <svg style={{ width: '1.25rem', height: '1.25rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>智谱 AI API 配置</h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>系统已内置智谱 AI API Key，开箱即用</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: settings.darkMode ? '#064e3b' : '#d1fae5', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                <span style={{ color: settings.darkMode ? '#6ee7b7' : '#065f46', fontWeight: 500 }}>已启用内置智谱 AI API Key</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>模型选择</label>
                <select value={formData.zhipuModel || 'glm-4-flash'} onChange={(e) => setFormData({ ...formData, zhipuModel: e.target.value })} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: settings.darkMode ? '#374151' : '#ffffff', color: settings.darkMode ? '#f9fafb' : '#111827' }}>
                  <option value="glm-4-flash">GLM-4-Flash (快速)</option>
                  <option value="glm-4">GLM-4 (标准)</option>
                  <option value="glm-4-plus">GLM-4-Plus (增强)</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: settings.darkMode ? '#6b7280' : '#9ca3af', marginTop: '0.25rem' }}>GLM-4-Flash 速度快且成本低，GLM-4-Plus 效果最好</p>
              </div>
            </div>
            <button onClick={handleSave} style={{ marginTop: '1.5rem', width: '100%', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>关于</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>
              <p><strong>阅读回响 (ReadRecall)</strong></p>
              <p>一个帮助读者通过主动回忆机制加深书籍理解的个人刷题工具。</p>
              <p style={{ fontSize: '0.875rem' }}>版本: {version}</p>
            </div>
          </div>

          <ZhangHuXinXi currentUser={currentUser} darkMode={settings.darkMode} onOpenPasswordModal={() => setShowPasswordModal(true)} />

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>安全</h2>
            <button onClick={handleLogout} disabled={loggingOut} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#dc2626', color: '#ffffff', borderRadius: '0.5rem', border: 'none', fontSize: '1rem', fontWeight: 500, cursor: loggingOut ? 'not-allowed' : 'pointer', opacity: loggingOut ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4h-4m4 4v-4m-4 4v4M9 12h6m-6 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {loggingOut ? '退出中...' : '退出登录'}
            </button>
          </div>
        </div>

        {showPasswordModal && <XiuGaiMiMaTanChuang darkMode={settings.darkMode} onClose={() => setShowPasswordModal(false)} onConfirm={handleChangePassword} />}
      </div>
    </div>
  );
}
