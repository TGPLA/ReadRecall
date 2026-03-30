// @审计已完成
// 提示词管理页面 - 主视图层（数据加载和操作协调）

import { useState, useEffect } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';
import { promptService } from '@shared/services/promptService';
import { getResponsiveValue } from '@shared/utils/responsive';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { TiShiCiFenLei } from './TiShiCiFenLei';
import { TiShiCiBianJiQi } from './TiShiCiBianJiQi';

interface TiShiCiGuanLiProps {
  onBack: () => void;
}

export function TiShiCiGuanLi({ onBack }: TiShiCiGuanLiProps) {
  const { settings } = useApp();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<QuestionTypeEnum>('名词解释');
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { templates: loaded, error } = await promptService.getPromptTemplates();
    if (error) showError(error.message);
    else setTemplates(loaded);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;
    const { error } = await promptService.deletePromptTemplate(id);
    if (error) { showError(error.message); return; }
    showSuccess('删除成功');
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleSetDefault = async (template: PromptTemplate) => {
    const { error } = await promptService.updatePromptTemplate(template.id, { isDefault: true });
    if (error) { showError(error.message); return; }
    showSuccess('已设为默认');
    setTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === template.id ? true : (t.questionType === template.questionType ? false : t.isDefault) })));
  };

  const handleSave = async (data: { name: string; content: string }) => {
    const { error } = editingTemplate
      ? await promptService.updatePromptTemplate(editingTemplate.id, data)
      : await promptService.createPromptTemplate({ name: data.name, content: data.content, questionType: activeType });
    if (error) { showError(error.message); return; }
    showSuccess(editingTemplate ? '更新成功' : '创建成功');
    setShowEditor(false);
    setEditingTemplate(null);
    loadTemplates();
  };

  const pageStyle = { minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) };
  const containerStyle = { maxWidth: '48rem', margin: '0 auto' };
  const backButtonStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem', border: 'none', background: 'none', cursor: 'pointer' };
  const iconStyle = { width: '1.25rem', height: '1.25rem' };
  const titleStyle = { fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <button onClick={onBack} style={backButtonStyle}>
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          返回设置
        </button>
        <h1 style={titleStyle}>📝 提示词模板管理</h1>
        <TiShiCiFenLei activeType={activeType} templates={templates} loading={loading} darkMode={settings.darkMode} onTypeChange={setActiveType} onSetDefault={handleSetDefault} onEdit={(t) => { setEditingTemplate(t); setShowEditor(true); }} onDelete={handleDelete} onCreate={() => { setEditingTemplate(null); setShowEditor(true); }} />
      </div>
      {showEditor && <TiShiCiBianJiQi template={editingTemplate} questionType={activeType} darkMode={settings.darkMode} onClose={() => { setShowEditor(false); setEditingTemplate(null); }} onSave={handleSave} />}
    </div>
  );
}
