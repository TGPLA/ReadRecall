// @审计已完成
// 章节详情主视图

import { useRef } from 'react';
import type { Chapter, Paragraph } from '@infrastructure/types';
import { DuanLuoLieBiao } from './DuanLuoLieBiao';
import { DuanLuoXuanRan } from '@shared/utils/common/DuanLuoXuanRan';

interface LearningSource {
  chapterId?: string;
  paragraphId?: string;
  content: string;
}

interface ZhangJieXiangQingZhuShiTuProps {
  chapter: Chapter;
  paragraphs: Paragraph[];
  onViewParagraph: (paragraph: Paragraph) => void;
  onDeleteParagraph: (paragraphId: string) => void;
  onStartConceptLearning: (source: LearningSource) => void;
  onStartIntentionLearning: (source: LearningSource) => void;
  onEditChapter: () => void;
  deleting: string | null;
  onContentRef: (element: HTMLDivElement | null) => void;
}

export function ZhangJieXiangQingZhuShiTu({ chapter, paragraphs, onViewParagraph, onDeleteParagraph, onStartConceptLearning, onStartIntentionLearning, onEditChapter, deleting, onContentRef }: ZhangJieXiangQingZhuShiTuProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem', paddingBottom: '6rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>章节内容</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{chapter.content.length} 字</span>
            <button
              onClick={onEditChapter}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
            >
              编辑
            </button>
          </div>
        </div>
        <div
          ref={(el) => {
            contentRef.current = el;
            onContentRef(el);
          }}
          style={{
            fontSize: '0.9375rem',
            color: '#374151',
            maxHeight: '32rem',
            overflowY: 'auto',
            userSelect: 'text',
          }}
        >
          <DuanLuoXuanRan content={chapter.content || ''} />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
          💡 选中文字可创建段落，用于学习
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>
          已创建段落 ({paragraphs.length})
        </h3>
        <DuanLuoLieBiao
          paragraphs={paragraphs}
          onView={onViewParagraph}
          onDelete={onDeleteParagraph}
          deleting={deleting}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => onStartConceptLearning({ chapterId: chapter.id, content: chapter.content })}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 600,
          }}
        >
          名词解释学习
        </button>
        <button
          onClick={() => onStartIntentionLearning({ chapterId: chapter.id, content: chapter.content })}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 600,
          }}
        >
          意图理解学习
        </button>
      </div>
    </div>
  );
}
