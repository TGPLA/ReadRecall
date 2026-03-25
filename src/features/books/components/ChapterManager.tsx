import { useState } from 'react';
import type { Chapter } from '@infrastructure/types';
import { chapterService } from '@shared/services/chapterService';

interface ChapterManagerProps {
  bookId: string;
  chapters: Chapter[];
  onChaptersChange: () => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export function ChapterManager({ bookId, chapters, onChaptersChange, onSelectChapter }: ChapterManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddChapter = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    const { error } = await chapterService.createChapter({
      bookId,
      title: title.trim(),
      content: content.trim(),
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setContent('');
    setShowAddModal(false);
    onChaptersChange();
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !title.trim()) return;
    
    setLoading(true);
    const { error } = await chapterService.updateChapter(editingChapter.id, {
      title: title.trim(),
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setEditingChapter(null);
    onChaptersChange();
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!confirm(`确定要删除章节「${chapterTitle}」吗？\n该章节下的所有题目也会被删除。`)) return;
    
    const { error } = await chapterService.deleteChapter(chapterId);
    if (error) {
      alert(error.message);
      return;
    }
    onChaptersChange();
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setTitle(chapter.title);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingChapter(null);
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>章节管理</h3>
        <button onClick={() => setShowAddModal(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          + 添加章节
        </button>
      </div>

      {chapters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <p>暂无章节，点击上方按钮添加</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chapters.map((chapter, index) => (
            <div key={chapter.id} style={{ padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectChapter(chapter)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>第{index + 1}章</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{chapter.title}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {chapter.questionCount} 道题目 · {chapter.content.length} 字
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEditModal(chapter)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>编辑</button>
                <button onClick={() => handleDeleteChapter(chapter.id, chapter.title)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#dc2626', backgroundColor: '#fef2f2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingChapter) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={closeModal}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', maxWidth: '42rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
              {editingChapter ? '编辑章节标题' : '添加章节'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>章节标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                  placeholder="例如：第一章 原子习惯的微小力量"
                />
              </div>
              
              {showAddModal && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>章节内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '12rem',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                    placeholder="粘贴章节文本内容，AI 将基于此内容生成题目..."
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={closeModal} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#374151', cursor: 'pointer' }}>取消</button>
                <button onClick={editingChapter ? handleUpdateChapter : handleAddChapter} disabled={!title.trim() || (showAddModal && !content.trim()) || loading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: !title.trim() || (showAddModal && !content.trim()) || loading ? '#9ca3af' : '#3b82f6', color: '#ffffff', cursor: !title.trim() || (showAddModal && !content.trim()) || loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
