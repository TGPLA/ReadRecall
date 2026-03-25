// @审计已完成
// 章节视图组件 - 管理章节和段落

import { useState, useEffect, useCallback } from 'react';
import type { Chapter, Paragraph, Question } from '@infrastructure/types';
import { chapterService } from '@shared/services/chapterService';
import { ChapterManager } from './ChapterManager';
import { ChapterDetail } from './ChapterDetail';

interface ChapterViewProps {
  bookId: string;
  onStartConceptLearning: (source: { chapterId?: string; paragraphId?: string; content: string }, chapter: Chapter) => void;
  onStartIntentionLearning: (source: { chapterId?: string; paragraphId?: string; content: string }, chapter: Chapter) => void;
}

export function ChapterView({ bookId, onStartConceptLearning, onStartIntentionLearning }: ChapterViewProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    const { chapters: loadedChapters } = await chapterService.getChaptersByBook(bookId);
    setChapters(loadedChapters);
    setLoading(false);
  }, [bookId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  if (selectedChapter) {
    return (
      <ChapterDetail
        chapter={selectedChapter}
        onBack={() => { setSelectedChapter(null); loadChapters(); }}
        onStartConceptLearning={(source) => onStartConceptLearning(source, selectedChapter)}
        onStartIntentionLearning={(source) => onStartIntentionLearning(source, selectedChapter)}
      />
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>加载中...</div>;
  }

  return (
    <ChapterManager
      bookId={bookId}
      chapters={chapters}
      onChaptersChange={loadChapters}
      onSelectChapter={setSelectedChapter}
    />
  );
}
