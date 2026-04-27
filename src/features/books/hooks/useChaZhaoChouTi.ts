// @审计已完成
// 查找抽屉 Hook - 搜索逻辑、状态管理

import { useState, useCallback, useRef, useEffect } from 'react';

interface SearchResult {
  cfi: string;
  excerpt: string;
  chapterTitle: string;
  chapterHref: string;
  weiZhi: number;
}

const CHA_ZHAO_STORAGE_KEY = 'chazhao_state';

function loadSavedState(): { input: string; results: SearchResult[]; searched: boolean; dangQianSuoYin: number } | null {
  try {
    const _saved = localStorage.getItem(CHA_ZHAO_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('加载搜索状态失败:', e);
  }
  return null;
}

function saveState(input: string, results: SearchResult[], searched: boolean, dangQianSuoYin: number) {
  try {
    localStorage.setItem(CHA_ZHAO_STORAGE_KEY, JSON.stringify({ input, results, searched, dangQianSuoYin }));
  } catch (e) {
    console.warn('保存搜索状态失败:', e);
  }
}

export function useChaZhaoChouTi(bookRef: React.RefObject<any>) {
  const savedState = loadSavedState();
  const [input, setInput] = useState(savedState?.input || '');
  const [results, setResults] = useState<SearchResult[]>(savedState?.results || []);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(savedState?.searched || false);
  const [dangQianSuoYin, setDangQianSuoYin] = useState(savedState?.dangQianSuoYin || 0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    saveState(input, results, searched, dangQianSuoYin);
  }, [input, results, searched, dangQianSuoYin]);

  const findIndex = (text: string, pattern: string): number[] => {
    const matches: number[] = [];
    let idx = 0;
    const lowerText = text.toLowerCase();
    const lowerPattern = pattern.toLowerCase();

    while ((idx = lowerText.indexOf(lowerPattern, idx)) !== -1) {
      matches.push(idx);
      idx += 1;
    }
    return matches;
  };

  const fullTextSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      setSearched(false);
      setDangQianSuoYin(0);
      return;
    }

    setLoading(true);
    setSearched(true);
    setDangQianSuoYin(0);

    const book = bookRef.current;
    const resultList: SearchResult[] = [];

    try {
      const spine = (book as any)?.spine;
      if (!spine) {
        console.warn('No spine found');
        setResults([]);
        setLoading(false);
        return;
      }

      const spineItems = spine.spineItems || [];
      const MAX_RESULTS = 50;

      for (const item of spineItems) {
        if (resultList.length >= MAX_RESULTS) break;

        try {
          console.log('搜索章节:', item.href, 'index:', (item as any).index, 'spineItem:', item);
          
          let sectionContent = '';
          
          if (typeof (book as any).loadSection === 'function') {
            const index = (item as any).index !== undefined ? (item as any).index : spineItems.indexOf(item);
            const section = await (book as any).loadSection(index);
            if (section) {
              sectionContent = typeof section === 'string' ? section : (section.body?.textContent || '');
            }
          } else if ((item as any).href) {
            const doc = await (book as any).load((item as any).href);
            sectionContent = doc?.body?.textContent || '';
          }

          if (!sectionContent) {
            console.warn('无法加载章节内容:', item.href);
            continue;
          }

          const indices = findIndex(sectionContent, keyword);

          if (indices.length > 0) {
            let matchCount = 0;
            for (const idx of indices) {
              matchCount++;
              const start = Math.max(0, idx - 30);
              const end = Math.min(sectionContent.length, idx + keyword.length + 30);
              const excerpt = sectionContent.slice(start, end).replace(/\s+/g, ' ');

              resultList.push({
                cfi: item.href,
                excerpt: excerpt,
                chapterTitle: item.title || item.href.split('/').pop() || '未知章节',
                chapterHref: item.href,
                weiZhi: matchCount,
              });

              if (resultList.length >= MAX_RESULTS) break;
            }
          }
        } catch (e) {
          console.warn('加载章节失败:', item.href, e);
        }
      }

      setResults(resultList);
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [bookRef]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fullTextSearch(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, fullTextSearch]);

  const shangYiGe = useCallback(() => {
    setDangQianSuoYin(prev => Math.max(0, prev - 1));
  }, []);

  const xiaYiGe = useCallback(() => {
    setDangQianSuoYin(prev => Math.min(results.length - 1, prev + 1));
  }, [results.length]);

  return {
    input,
    setInput,
    results,
    loading,
    searched,
    inputRef,
    dangQianSuoYin,
    shangYiGe,
    xiaYiGe,
  };
}
