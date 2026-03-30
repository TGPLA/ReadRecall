// @审计已完成
// EPUB 导入弹窗 - 主视图层

import { useState } from 'react';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { databaseService } from '@shared/services/database';
import { EPUBDaoRuTanChuangShangChuan } from './EPUBDaoRuTanChuangShangChuan';
import { EPUBDaoRuTanChuangQueRen } from './EPUBDaoRuTanChuangQueRen';
import { EPUBDaoRuTanChuangShangChuanZhong } from './EPUBDaoRuTanChuangShangChuanZhong';

interface EPUBDaoRuTanChuangProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRefreshBooks: () => void;
  darkMode: boolean;
}

interface JianYuanShuJu {
  title: string;
  author: string;
}

export function EPUBDaoRuTanChuang({ isOpen, onClose, onConfirm, onRefreshBooks, darkMode }: EPUBDaoRuTanChuangProps) {
  const [step, setStep] = useState<'upload' | 'confirm' | 'uploading'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jianYuanShuJu, setJianYuanShuJu] = useState<JianYuanShuJu | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileSelected = (file: File, title: string, author: string) => {
    setSelectedFile(file);
    setJianYuanShuJu({ title, author });
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!jianYuanShuJu || !selectedFile) return;
    setStep('uploading');
    setLoading(true);
    setError(null);

    try {
      console.log('📚 步骤 1: 创建书籍...');
      const { book: newBook, error: createError } = await databaseService.createBook({
        title: jianYuanShuJu.title,
        author: jianYuanShuJu.author,
        coverUrl: '',
      } as any);

      if (createError || !newBook) throw new Error(createError?.message || '创建书籍失败');
      console.log('✅ 书籍创建成功:', newBook);
      console.log('📖 书籍详情:', { id: newBook.id, title: newBook.title, userId: newBook.userId });

      console.log('⏳ 等待 500ms 确保书籍创建完成...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('📤 步骤 2: 上传 EPUB...', newBook.id);
      const { error: uploadError } = await databaseService.uploadEPUB(newBook.id, selectedFile);
      if (uploadError) throw new Error(uploadError?.message || '上传 EPUB 失败');
      console.log('✅ EPUB 上传成功');

      showSuccess('EPUB 导入成功！');
      handleReset();
      onRefreshBooks();
      onConfirm();
    } catch (err) {
      console.error('❌ 导入失败:', err);
      setError(err instanceof Error ? err.message : '导入失败');
      showError(err instanceof Error ? err.message : '导入失败');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setStep('upload'); setJianYuanShuJu(null); setSelectedFile(null); setError(null); setLoading(false); };
  const handleClose = () => { handleReset(); onClose(); };
  const handleError = (errorMsg: string) => { setError(errorMsg); setLoading(false); };

  const modalStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' };
  const contentStyle = { backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '42rem', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem' };
  const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' };
  const titleStyle = { fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' };
  const closeButtonStyle = { color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' };
  const iconStyle = { width: '1.5rem', height: '1.5rem' };

  return (
    <div style={modalStyle} onClick={handleClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        {step === 'upload' ? (
          <div>
            <div style={headerStyle}>
              <h2 style={titleStyle}>导入 EPUB 电子书</h2>
              <button onClick={handleClose} style={closeButtonStyle}>
                <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <EPUBDaoRuTanChuangShangChuan darkMode={darkMode} loading={loading} error={error} onFileSelected={handleFileSelected} onError={handleError} />
          </div>
        ) : step === 'confirm' && jianYuanShuJu ? (
          <EPUBDaoRuTanChuangQueRen title={jianYuanShuJu.title} author={jianYuanShuJu.author} darkMode={darkMode} onConfirm={handleConfirm} onReset={handleReset} onClose={handleClose} loading={loading} />
        ) : (
          <EPUBDaoRuTanChuangShangChuanZhong darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}
