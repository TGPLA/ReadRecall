// @审计已完成
// 应用主组件 - 页面路由和全局状态管理

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@infrastructure/hooks';
import { BookShelf } from '@features/books/components/BookShelf';
import { EPUBReaderPage } from '@features/books/components/EPUBReaderPage';
import { FuShuXueXi } from '@features/practice/FuShuXueXi';
import { GaiNianJieShi } from '@features/practice/GaiNianJieShi';
import { SettingsPage } from '@features/user/components/SettingsPage';
import { TiShiCiGuanLi } from '@features/user/components/TiShiCiGuanLi';
import { AuthPage } from '@features/user/components/AuthPage';
import { BackendUnavailable } from '@features/user/components/BackendUnavailable';
import { authService } from '@shared/services/auth';
import { checkBackendHealth } from '@shared/services/healthCheck';
import { ToastContainer } from '@shared/utils/common/ToastTiShi';
import { QuanPingJiaZai } from '@shared/utils/common/JiaZaiZhuangTai';
import { CuoWuBianJie } from '@shared/utils/common/CuoWuBianJie';
import type { Book, Question } from '@infrastructure/types';

type Page = 'shelf' | 'reader' | 'settings' | 'prompts' | 'concept-learning' | 'concept-explanation';

interface LearningSource {
  chapterId?: string;
  paragraphId?: string;
  content: string;
}

function AppContent() {
  const { settings } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('shelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<{ id: string; content: string } | null>(null);
  const [learningSource, setLearningSource] = useState<LearningSource | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(true);

  useEffect(() => {
    const checkBackend = async (showLoading: boolean = false) => {
      if (showLoading) {
        setCheckingBackend(true);
      }
      const status = await checkBackendHealth();
      setIsBackendAvailable(status.isBackendAvailable);
      if (showLoading) {
        setCheckingBackend(false);
      }
    };
    
    checkBackend(true);
    const interval = setInterval(() => checkBackend(false), 30000);
    
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (settings.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage('reader');
  };

  const handleCloseReader = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleBackToShelf = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleStartConceptLearning = (source: LearningSource) => {
    setLearningSource(source);
    setCurrentPage('concept-learning');
  };

  const handleFuShuXueXi = (text: string) => {
    setLearningSource({ content: text });
    setCurrentPage('concept-learning');
  };

  const handleGaiNianJieShi = (text: string) => {
    setLearningSource({ content: text });
    setCurrentPage('concept-explanation');
  };

  const handleBackToDetail = () => {
    setCurrentPage('shelf');
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleComplete = () => {
    setCurrentPage('shelf');
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  if (isLoading || checkingBackend) {
    return <QuanPingJiaZai wenAn="加载应用..." />;
  }

  if (!isBackendAvailable) {
    return <BackendUnavailable darkMode={settings.darkMode} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb' }}>
      {currentPage === 'shelf' && (
        <BookShelf onSelectBook={handleSelectBook} onOpenSettings={() => setCurrentPage('settings')} />
      )}
      {currentPage === 'reader' && selectedBook && (
        <EPUBReaderPage
          book={selectedBook}
          onClose={handleCloseReader}
          onFuShuXueXi={handleFuShuXueXi}
          onGaiNianJieShi={handleGaiNianJieShi}
        />
      )}
      {currentPage === 'concept-learning' && learningSource && (
        <FuShuXueXi 
          key={learningSource.chapterId ? `chapter-${learningSource.chapterId}` : `paragraph-${learningSource.paragraphId}`}
          chapterId={learningSource.chapterId}
          paragraphId={learningSource.paragraphId}
          content={learningSource.content}
          onComplete={handleComplete}
          onBack={handleBackToDetail}
        />
      )}
      {currentPage === 'concept-explanation' && learningSource && (
        <GaiNianJieShi 
          content={learningSource.content}
          onComplete={handleComplete}
          onBack={handleBackToDetail}
        />
      )}
      {currentPage === 'settings' && <SettingsPage onBack={handleBackToShelf} onOpenPrompts={() => setCurrentPage('prompts')} />}
      {currentPage === 'prompts' && <TiShiCiGuanLi onBack={() => setCurrentPage('settings')} />}
    </div>
  );
}

function App() {
  return (
    <CuoWuBianJie>
      <AppProvider>
        <AppContent />
        <ToastContainer />
      </AppProvider>
    </CuoWuBianJie>
  );
}

export default App;
