// @审计已完成
// 段落管理相关逻辑

import { useState, useCallback } from 'react';
import type { Paragraph } from '@infrastructure/types';
import { paragraphService } from '@shared/services/paragraphService';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export function useDuanLuoGuanLi(chapterId: string) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShanChuModal, setShowShanChuModal] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadParagraphs = useCallback(async () => {
    const { paragraphs: loadedParagraphs } = await paragraphService.getParagraphsByChapter(chapterId);
    setParagraphs(loadedParagraphs);
  }, [chapterId]);

  const handleViewParagraph = useCallback((paragraph: Paragraph) => {
    setCurrentParagraph(paragraph);
    setShowViewModal(true);
  }, []);

  const handleEditParagraph = useCallback((paragraph: Paragraph) => {
    setCurrentParagraph(paragraph);
    setEditContent(paragraph.content);
    setShowEditModal(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!currentParagraph || !editContent.trim()) return;

    setSaving(true);
    try {
      const { paragraph: updatedParagraph, error: updateError } = await paragraphService.updateParagraph(
        currentParagraph.id,
        editContent.trim()
      );

      if (updateError || !updatedParagraph) {
        showError(updateError?.message || '更新段落失败');
        return;
      }

      showSuccess('段落更新成功');
      setParagraphs(prev => prev.map(p => p.id === currentParagraph.id ? updatedParagraph : p));
      setCurrentParagraph(updatedParagraph);
      setShowEditModal(false);
      setShowViewModal(true);

      const { data, error: aiError } = await aiService.generateQuestionsForParagraph(updatedParagraph.id, '标准题', 3);
      if (aiError) {
        console.error('AI 重新生成题目失败:', aiError.message);
        showError('段落已更新，但 AI 重新生成题目失败：' + aiError.message);
      } else {
        showSuccess(`AI 已基于新内容重新生成 ${data?.questions.length || 0} 道题目`);
      }
    } finally {
      setSaving(false);
    }
  }, [currentParagraph, editContent]);

  const handleDeleteParagraph = useCallback((paragraphId: string) => {
    setCurrentParagraph(paragraphs.find(p => p.id === paragraphId) || null);
    setShowShanChuModal(true);
  }, [paragraphs]);

  const confirmDelete = useCallback(async () => {
    if (!currentParagraph) return;

    const paragraphId = currentParagraph.id;
    setDeleting(paragraphId);
    setShowShanChuModal(false);

    try {
      const { error: deleteError } = await paragraphService.deleteParagraph(paragraphId);

      if (deleteError) {
        showError(deleteError?.message || '删除段落失败');
        return;
      }

      showSuccess('段落删除成功');
      setParagraphs(prev => prev.filter(p => p.id !== paragraphId));
    } finally {
      setDeleting(null);
      setCurrentParagraph(null);
    }
  }, [currentParagraph]);

  const cancelDelete = useCallback(() => {
    setShowShanChuModal(false);
    setCurrentParagraph(null);
  }, []);

  return {
    paragraphs,
    setParagraphs,
    loadParagraphs,
    showViewModal,
    setShowViewModal,
    showEditModal,
    setShowEditModal,
    showShanChuModal,
    currentParagraph,
    editContent,
    setEditContent,
    saving,
    deleting,
    handleViewParagraph,
    handleEditParagraph,
    handleSaveEdit,
    handleDeleteParagraph,
    confirmDelete,
    cancelDelete,
  };
}
