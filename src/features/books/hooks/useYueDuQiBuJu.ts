// @审计已完成
// 阅读器布局状态管理 Hook - 书名/作者/目录/抽屉面板控制

import { useState, useEffect, useCallback } from 'react';
import type { NavItem } from 'epubjs';

interface UseYueDuQiBuJuProps {
  bookRef: React.RefObject<any>;
  renditionRef: React.RefObject<any>;
  highlights: Array<{ id: string; cfiRange: string }>;
  handleDeleteHighlight: (id: string) => void;
}

export function useYueDuQiBuJu({ bookRef, highlights, handleDeleteHighlight }: UseYueDuQiBuJuProps) {
  const [shuMing, setShuMing] = useState('加载中...');
  const [zuoZhe, setZuoZhe] = useState('');
  const [zhangJieLieBiao, setZhangJieLieBiao] = useState<NavItem[]>([]);
  const [daKaiDeChouTi, setDaKaiDeChouTi] = useState<'mulu' | 'chazhao' | 'huaxian' | null>(null);
  const [yiHuoQuShuMing, setYiHuoQuShuMing] = useState(false);

  useEffect(() => {
    const book = bookRef.current;
    if (!book || yiHuoQuShuMing) return;
    setYiHuoQuShuMing(true);
    book.loaded.metadata.then((meta: any) => {
      if (meta?.title) setShuMing(meta.title);
      if (meta?.creator) setZuoZhe(meta.creator);
    });
    book.loaded.navigation.then((nav: any) => {
      if (nav?.toc) setZhangJieLieBiao(nav.toc);
    });
  }, [bookRef.current, yiHuoQuShuMing]);

  const qieHuanChouTi = useCallback((leiXing: string) => {
    setDaKaiDeChouTi(prev => prev === leiXing ? null : (leiXing as 'mulu' | 'chazhao' | 'huaxian'));
  }, []);

  return {
    shuMing, zuoZhe, zhangJieLieBiao, daKaiDeChouTi,
    qieHuanChouTi, setDaKaiDeChouTi,
    highlights, handleDeleteHighlight,
  };
}
