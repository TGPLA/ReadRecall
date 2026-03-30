// @审计已完成
// 章节编辑相关逻辑

import { useState, useCallback } from 'react';
import type { Chapter } from '@infrastructure/types';
import { chapterService } from '@shared/services/chapterService';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export function useZhangJieBianJi() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const openEditModal = useCallback((chapter: Chapter) => {
    setEditingChapter(chapter);
    setTitle(chapter.title);
    setContent(chapter.content);
    setShowEditModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingChapter(null);
    setTitle('');
    setContent('');
    setShowEditModal(false);
  }, []);

  const handleSaveEdit = useCallback(async (onChapterUpdated: () => void) => {
    if (!editingChapter || !title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const { error } = await chapterService.updateChapter(editingChapter.id, {
        title: title.trim(),
        content: content.trim(),
      });

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess('章节更新成功');
      closeModal();
      onChapterUpdated();

      const { data, error: aiError } = await aiService.generateQuestions(editingChapter.id, '标准题', 5);
      if (aiError) {
        console.error('AI 生成题目失败:', aiError);
        showError('章节已更新，但 AI 生成题目失败：' + aiError);
      } else {
        showSuccess(`AI 已基于新内容生成 ${data?.questions.length || 0} 道题目`);
      }
    } finally {
      setLoading(false);
    }
  }, [editingChapter, title, content, closeModal]);

  return {
    showEditModal,
    setShowEditModal,
    editingChapter,
    title,
    setTitle,
    content,
    setContent,
    loading,
    openEditModal,
    closeModal,
    handleSaveEdit,
  };
}
