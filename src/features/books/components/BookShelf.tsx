// @审计已完成
// 书架主组件 - 数据显示和操作协调

import { useState } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { Book } from '@infrastructure/types';
import { getResponsiveValue } from '@shared/utils/responsive';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';
import { BookCard } from './BookCard';
import { AddBookModal } from './AddBookModal';
import { EPUBDaoRuTanChuang } from './EPUBDaoRuTanChuang';
import { chapterService } from '@shared/services/chapterService';
import type { EPUBMetadata, EPUBChapter } from '@shared/utils/epubParser';
import { BookShelfCaoZuo } from './BookShelfCaoZuo';
import { BookShieKongZhi } from './BookShieKongZhi';

interface BookShelfProps {
  onSelectBook: (book: Book) => void;
  onOpenSettings: () => void;
}

export function BookShelf({ onSelectBook, onOpenSettings }: BookShelfProps) {
  const { books, deleteBook, settings, isLoading, addBook, refreshBooks } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEPUBModal, setShowEPUBModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();
  const [importing, setImporting] = useState(false);

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    const confirmed = window.confirm(`确定要删除《${bookTitle}》吗？`);
    if (!confirmed) return;
    try { await deleteBook(bookId); showSuccess('书籍删除成功'); }
    catch (error) { showError(error instanceof Error ? error.message : '删除失败'); }
  };

  const handleEditBook = (book: Book) => { setEditingBook(book); setShowAddModal(true); };
  const handleCloseModal = () => { setShowAddModal(false); setEditingBook(undefined); };

  const handleEPUBImport = async (data: { metadata: EPUBMetadata; chapters: EPUBChapter[] }) => {
    setImporting(true);
    try {
      const newBook = await addBook({ title: data.metadata.title || '未命名书籍', author: data.metadata.author || '未知作者' });
      if (!newBook) throw new Error('创建书籍失败');
      let successCount = 0, skipCount = 0;
      for (const chapter of data.chapters) {
        if (!chapter.content || chapter.content.trim() === '') { skipCount++; continue; }
        const result = await chapterService.createChapter({ bookId: newBook.id, title: chapter.title, content: chapter.content, orderIndex: chapter.orderIndex });
        if (!result.error) successCount++;
      }
      showSuccess(skipCount > 0 ? `导入成功！创建书籍《${newBook.title}》，包含 ${successCount} 个章节（跳过 ${skipCount} 个空章节）` : `导入成功！创建书籍《${newBook.title}》，包含 ${successCount} 个章节`);
      setShowEPUBModal(false);
    } catch (error) { showError(error instanceof Error ? error.message : '导入失败'); }
    finally { setImporting(false); }
  };

  if (isLoading || importing) return <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><JiaZaiZhuangTai wenAn={importing ? "正在导入 EPUB..." : "加载书架..."} chiCun="large" /></div>;

  const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }), flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '1rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) };
  const titleStyle = { fontSize: getResponsiveValue({ mobile: '1.5rem', tablet: '1.875rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827' };
  const subtitleStyle = { color: settings.darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) };
  const gridStyle = { display: 'grid', gridTemplateColumns: getResponsiveValue({ mobile: 'repeat(auto-fill, minmax(140px, 1fr))', tablet: 'repeat(auto-fill, minmax(180px, 1fr))' }), gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>📚 阅读回响</h1>
            <p style={subtitleStyle}>通过主动回忆，加深书籍理解</p>
          </div>
          <BookShelfCaoZuo darkMode={settings.darkMode} onAddBook={() => { setEditingBook(undefined); setShowAddModal(true); }} onImportEPUB={() => setShowEPUBModal(true)} onOpenSettings={onOpenSettings} />
        </div>

        {books.length === 0 ? (
          <BookShieKongZhi darkMode={settings.darkMode} onAddBook={() => { setEditingBook(undefined); setShowAddModal(true); }} onImportEPUB={() => setShowEPUBModal(true)} />
        ) : (
          <div style={gridStyle}>
            {books.map(book => <BookCard key={book.id} book={book} onClick={() => onSelectBook(book)} onDelete={() => handleDeleteBook(book.id, book.title)} onEdit={() => handleEditBook(book)} darkMode={settings.darkMode} />)}
          </div>
        )}
      </div>

      <AddBookModal key={editingBook?.id || 'new'} isOpen={showAddModal} onClose={handleCloseModal} book={editingBook} darkMode={settings.darkMode} />
      <EPUBDaoRuTanChuang isOpen={showEPUBModal} onClose={() => setShowEPUBModal(false)} onConfirm={() => setShowEPUBModal(false)} onRefreshBooks={refreshBooks} darkMode={settings.darkMode} />
    </div>
  );
}
