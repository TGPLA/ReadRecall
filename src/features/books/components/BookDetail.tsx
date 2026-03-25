// @审计已完成
// 书籍详情组件 - 显示书籍信息和章节管理

import { useState } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { Book, Question, Paragraph } from '@infrastructure/types';
import { getResponsiveValue } from '@shared/utils/responsive';
import { ChapterView } from './ChapterView';
import { questionService } from '@shared/services/questionService';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onStartConceptLearning: (paragraph: Paragraph) => void;
  onStartIntentionLearning: (paragraph: Paragraph) => void;
}

export function BookDetail({ book, onBack, onStartConceptLearning, onStartIntentionLearning }: BookDetailProps) {
  const { settings } = useApp();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb' }}>
      <TouBuDaoHang book={book} onBack={onBack} darkMode={settings.darkMode} />
      <ShuJiXinXi book={book} darkMode={settings.darkMode} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
        <ZhangJieGuanLi
          bookId={book.id}
          onStartConceptLearning={onStartConceptLearning}
          onStartIntentionLearning={onStartIntentionLearning}
          darkMode={settings.darkMode}
        />
      </div>
    </div>
  );
}

function TouBuDaoHang({ book, onBack, darkMode }: { book: Book; onBack: () => void; darkMode: boolean }) {
  return (
    <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: darkMode ? '#9ca3af' : '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书架
        </button>
      </div>
    </div>
  );
}

function ShuJiXinXi({ book, darkMode }: { book: Book; darkMode: boolean }) {
  return (
    <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ width: '6rem', height: '8rem', background: 'linear-gradient(to bottom right, #dbeafe, #f3e8ff)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
          ) : (
            <svg style={{ width: '2.5rem', height: '2.5rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>{book.title}</h1>
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>{book.author}</p>
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>题目总数：<span style={{ fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>{book.questionCount}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZhangJieGuanLi({ bookId, onStartPractice, onStartConceptLearning, onStartIntentionLearning, practiceLoading, darkMode }: {
  bookId: string;
  onStartPractice: (paragraph: Paragraph) => void;
  onStartConceptLearning: (source: { chapterId?: string; paragraphId?: string; content: string }, chapter: import('@infrastructure/types').Chapter) => void;
  onStartIntentionLearning: (source: { chapterId?: string; paragraphId?: string; content: string }, chapter: import('@infrastructure/types').Chapter) => void;
  practiceLoading: boolean;
  darkMode: boolean;
}) {
  return (
    <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', padding: '1.5rem' }}>
      <ChapterView
        bookId={bookId}
        onStartPractice={onStartPractice}
        onStartConceptLearning={onStartConceptLearning}
        onStartIntentionLearning={onStartIntentionLearning}
        onQuestionsChange={() => {}}
      />
    </div>
  );
}
