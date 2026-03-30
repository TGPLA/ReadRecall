import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Book, Question, Settings } from '@infrastructure/types';
import { storage } from '@infrastructure/store';
import { authService } from '@shared/services/auth';
import { databaseService } from '@shared/services/database';
import { chapterService } from '@shared/services/chapterService';
import { promptService } from '@shared/services/promptService';
import { paragraphService } from '@shared/services/paragraphService';
import { AppContext } from './context';

function getInitialSettings(): Settings {
  const settings = storage.getSettings();
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  }
  return settings;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings>(getInitialSettings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        databaseService.setUserId(user.id);
        chapterService.setUserId(user.id);
        promptService.setUserId(user.id);
        paragraphService.setUserId(user.id);
        loadUserData();
      } else {
        setIsAuthenticated(false);
        databaseService.setUserId('');
        chapterService.setUserId('');
        promptService.setUserId('');
        paragraphService.setUserId('');
        setBooks([]);
        setQuestions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (isAuthenticated) {
      databaseService.updateUserSettings(settings);
    } else {
      storage.saveSettings(settings);
    }
  }, [settings, isAuthenticated]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const { books: dbBooks, error: booksError } = await databaseService.getAllBooks();
      if (!booksError) {
        setBooks(dbBooks);
        
        const allQuestions: Question[] = [];
        for (const book of dbBooks) {
          const { questions: bookQuestions, error } = await databaseService.getQuestionsByBook(book.id);
          if (!error) {
            allQuestions.push(...bookQuestions);
          }
        }
        setQuestions(allQuestions);
      } else {
        console.warn('从数据库加载书籍失败:', booksError.message);
        console.log('保持当前书籍列表（空）');
      }

      const { settings: dbSettings, error: settingsError } = await databaseService.getUserSettings();
      if (!settingsError && dbSettings) {
        setSettings(dbSettings);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBooks = useCallback(async () => {
    if (isAuthenticated) {
      const { books, error } = await databaseService.getAllBooks();
      if (!error) {
        setBooks(books);
      }
    } else {
      setBooks(storage.getBooks());
    }
  }, [isAuthenticated]);

  const refreshQuestions = useCallback(async () => {
    if (isAuthenticated) {
      const allQuestions: Question[] = [];
      for (const book of books) {
        const { questions: bookQuestions, error } = await databaseService.getQuestionsByBook(book.id);
        if (!error) {
          allQuestions.push(...bookQuestions);
        }
      }
      setQuestions(allQuestions);
    } else {
      setQuestions(storage.getQuestions());
    }
  }, [isAuthenticated, books]);

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'createdAt' | 'questionCount'>) => {
    if (isAuthenticated) {
      const { book: newBook, error } = await databaseService.createBook({
        ...book,
        questionCount: 0,
      });
      if (!error && newBook) {
        setBooks(prev => [newBook, ...prev]);
        return newBook;
      }
      throw new Error(error?.message || '创建书籍失败');
    } else {
      const newBook = storage.addBook(book);
      refreshBooks();
      return newBook;
    }
  }, [isAuthenticated, refreshBooks]);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    if (isAuthenticated) {
      const { book: updatedBook, error } = await databaseService.updateBook(id, updates);
      if (!error && updatedBook) {
        setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
        return updatedBook;
      }
      throw new Error(error?.message || '更新书籍失败');
    } else {
      const result = storage.updateBook(id, updates);
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, refreshBooks]);

  const deleteBook = useCallback(async (id: string) => {
    if (isAuthenticated) {
      const { error } = await databaseService.deleteBook(id);
      if (!error) {
        setBooks(prev => prev.filter(b => b.id !== id));
        setQuestions(prev => prev.filter(q => q.bookId !== id));
        return true;
      }
      throw new Error(error?.message || '删除书籍失败');
    } else {
      const result = storage.deleteBook(id);
      refreshBooks();
      refreshQuestions();
      return result;
    }
  }, [isAuthenticated, refreshBooks, refreshQuestions]);

  const updateBookQuestionCount = useCallback(async (bookId: string, delta: number) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newCount = Math.max(0, book.questionCount + delta);
      await databaseService.updateBook(bookId, { questionCount: newCount });
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, questionCount: newCount } : b));
    }
  }, [books]);

  const addQuestion = useCallback(async (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => {
    if (isAuthenticated) {
      const { question: newQuestion, error } = await databaseService.createQuestion({
        ...question,
        masteryLevel: '未掌握',
        practiceCount: 0
      });
      if (!error && newQuestion) {
        setQuestions(prev => [newQuestion, ...prev]);
        await updateBookQuestionCount(question.bookId, 1);
        return newQuestion;
      }
      throw new Error(error?.message || '创建题目失败');
    } else {
      const newQuestion = storage.addQuestion(question);
      refreshQuestions();
      refreshBooks();
      return newQuestion;
    }
  }, [isAuthenticated, refreshQuestions, refreshBooks, updateBookQuestionCount]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    if (isAuthenticated) {
      const { question: updatedQuestion, error } = await databaseService.updateQuestion(id, updates);
      if (!error && updatedQuestion) {
        setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
        return updatedQuestion;
      }
      throw new Error(error?.message || '更新题目失败');
    } else {
      const result = storage.updateQuestion(id, updates);
      refreshQuestions();
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, refreshQuestions, refreshBooks]);

  const deleteQuestion = useCallback(async (id: string) => {
    if (isAuthenticated) {
      const question = questions.find(q => q.id === id);
      const { error } = await databaseService.deleteQuestion(id);
      if (!error) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        if (question) {
          await updateBookQuestionCount(question.bookId, -1);
        }
        return true;
      }
      throw new Error(error?.message || '删除题目失败');
    } else {
      const result = storage.deleteQuestion(id);
      refreshQuestions();
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, questions, refreshQuestions, refreshBooks, updateBookQuestionCount]);

  const getQuestionsByBook = useCallback((bookId: string) => {
    return questions.filter(q => q.bookId === bookId);
  }, [questions]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // 注意：Go 后端暂不支持 WebSocket 实时订阅
      // 如需实时更新，可使用轮询或手动刷新
    }
  }, [isAuthenticated, isLoading]);

  return (
    <AppContext.Provider value={{
      books,
      questions,
      settings,
      refreshBooks,
      refreshQuestions,
      updateSettings,
      addBook,
      updateBook,
      deleteBook,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      getQuestionsByBook,
    }}>
      {children}
    </AppContext.Provider>
  );
}
