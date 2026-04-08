// @审计已完成
// EPUB 阅读器页面 - 全屏独立页面模式

import { EPUBReader } from './EPUBReader';
import { databaseService } from '@shared/services/database';
import type { Book } from '@infrastructure/types';

interface EPUBReaderPageProps {
  book: Book;
  onClose: () => void;
  onFuShuXueXi?: (text: string) => void;
  onGaiNianJieShi?: (text: string) => void;
}

export function EPUBReaderPage({ book, onClose, onFuShuXueXi, onGaiNianJieShi }: EPUBReaderPageProps) {
  const epubUrl = book.epubFilePath
    ? databaseService.getEPUBUrl(book.id, book.epubFilePath)
    : '';

  if (!epubUrl) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', gap: '1rem' }}>
        <p style={{ color: '#7A7A85' }}>该书籍没有 EPUB 文件</p>
        <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer' }}>
          返回书架
        </button>
      </div>
    );
  }

  return (
    <EPUBReader
      url={epubUrl}
      darkMode={false}
      onClose={onClose}
      bookId={book.id}
      chapterId=""
      onFuShuXueXi={onFuShuXueXi}
      onGaiNianJieShi={onGaiNianJieShi}
    />
  );
}
