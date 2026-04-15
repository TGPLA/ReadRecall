// @审计已完成
// 阅读器主容器 - 微信读书风格：纯深色沉浸式背景 + 超大圆角卡片

import React, { useCallback, useState, useEffect } from 'react';
import { YueDuQiDingBuDaoHang } from './YueDuQiDingBuDaoHang';
import { EPUBYueDuQuYu } from './EPUBYueDuQuYu';
import { YouCeGongJuTiao } from './YouCeGongJuTiao';
import { HuaXianBianJiCaiDan } from './HuaXianBianJiCaiDan';
import { XueXiCaiDan } from './XueXiCaiDan';
import { MuLuChouTi } from './MuLuChouTi';
import { BiJiChouTi } from './BiJiChouTi';
import { ChaZhaoChouTi } from './ChaZhaoChouTi';
import { FuShu } from '@features/practice/FuShu';
import { LianXiMianBan } from './LianXiMianBan';
import { useEPUBReaderHuoChuLi } from '../hooks/useEPUBReaderHuoChuLi';
import { useYueDuQiBuJu } from '../hooks/useYueDuQiBuJu';
import type { HuaXianXinXi } from '../hooks/useHuaXianChuTi';
import type { Book, Question } from '@infrastructure/types';
import { showWarning, showInfo } from '../../../shared/utils/common/ToastGongJu';
import '../styles/YueDuSeCai.css';
import { aiService } from '@shared/services/aiService';
import { showSuccess } from '@shared/utils/common/ToastTiShi';
import { questionService } from '@shared/services/questionService';
import { paraphraseService } from '@shared/services/paraphraseService';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId?: string;
  onParagraphCreated?: () => void;
  onFuShuXueXi?: (text: string) => void;
  onGaiNianJieShi?: (text: string) => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated, onFuShuXueXi, onGaiNianJieShi }: EPUBReaderProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showLianXiMianBan, setShowLianXiMianBan] = useState(false);
  const [bookInfo, setBookInfo] = useState<Partial<Book>>({ id: bookId, title: '' });
  const [showXueXiCaiDan, setShowXueXiCaiDan] = useState(false);
  const [xueXiCaiDanWeiZhi, setXueXiCaiDanWeiZhi] = useState({ top: 0, left: 0 });
  const [xueXiCaiDanQiShiWeiZhi, setXueXiCaiDanQiShiWeiZhi] = useState<{ top: number; left: number } | null>(null);
  const [dengLuXueXiCaiDan, setDengLuXueXiCaiDan] = useState(false);
  const [dangQianWenBen, setDangQianWenBen] = useState('');
  const [showFuShu, setShowFuShu] = useState(false);
  const [fuShuWenBen, setFuShuWenBen] = useState('');

  const loadQuestions = useCallback(async () => {
    try {
      console.log('[DEBUG loadQuestions] 开始加载题目, bookId:', bookId);
      const { questions: loadedQuestions, error } = await questionService.getQuestionsByBook(bookId);
      console.log('[DEBUG loadQuestions] 加载结果:', loadedQuestions, 'error:', error);
      console.log('[DEBUG loadQuestions] 每道题的完整数据:', loadedQuestions.map(q => ({ id: q.id, annotationId: q.annotationId, annotation: q.annotation })));
      if (error) {
        showWarning('加载题目失败：' + error);
        return;
      }
      console.log('[DEBUG loadQuestions] 更新 questions 状态, 数量:', loadedQuestions.length);
      setQuestions(loadedQuestions);
    } catch (e) {
      console.error('加载题目异常:', e);
    }
  }, [bookId]);

  const p = useEPUBReaderHuoChuLi({ 
    bookId, 
    chapterId, 
    onParagraphCreated, 
    onQuestionGenerated: loadQuestions,
  });
  const buju = useYueDuQiBuJu({ bookRef: p.bookRef, renditionRef: p.renditionRef, highlights: p.highlights, handleDeleteHighlight: p.handleDeleteHighlight });

  const handleTiaoZhuanCfi = useCallback((huaXian: HuaXianXinXi) => {
    buju.setDaKaiDeChouTi(null);
    const rendition = p.renditionRef?.current;
    if (!rendition) {
      showWarning('阅读器未就绪，请稍后再试');
      return;
    }

    console.log('准备跳转到划线:', huaXian.text.substring(0, 50));
    console.log('CFI:', huaXian.cfiRange);

    if (!huaXian.cfiRange) {
      showInfo('该划线没有位置信息');
      return;
    }

    rendition.display(huaXian.cfiRange).then(() => {
      showInfo('已跳转到划线位置');
    }).catch((e) => {
      console.warn('CFI 跳转失败，尝试章节跳转:', e);
      
      const spine = rendition.book.spine;
      const spineItems = (spine as any).spineItems || [];
      
      if (spineItems.length > 0) {
        rendition.display(spineItems[0].href).then(() => {
          showInfo('已跳转到第一章节，请手动查找');
        }).catch((e2) => {
          console.warn('章节跳转也失败:', e2);
          showInfo('跳转失败，请通过目录查找');
        });
      } else {
        showInfo('跳转失败，请通过目录查找');
      }
    });
  }, [buju.setDaKaiDeChouTi, p.renditionRef]);

  const handleZhangJieDianJi = useCallback((href: string) => {
    p.renditionRef?.current?.display(href);
    buju.setDaKaiDeChouTi(null);
  }, [buju.setDaKaiDeChouTi]);

  const handleXueXi = useCallback((text: string) => {
    console.log('[DEBUG handleXueXi] 被调用, text:', text?.substring(0, 20));
    console.log('[DEBUG handleXueXi] p.activeHuaXian:', p.activeHuaXian);
    console.log('[DEBUG handleXueXi] p.activeHuaXianList:', p.activeHuaXianList);
    console.log('[DEBUG handleXueXi] p.editPosition:', p.editPosition);
    setDangQianWenBen(text);
    
    let qiShiWeiZhi: { top: number; left: number } | null = null;
    let muDiWeiZhi: { top: number; left: number };
    
    if (p.editPosition) {
      qiShiWeiZhi = { ...p.editPosition };
      muDiWeiZhi = { top: p.editPosition.top - 10, left: p.editPosition.left };
      setXueXiCaiDanQiShiWeiZhi(qiShiWeiZhi);
    } else if (p.selectionRect) {
      const menuTop = p.selectionRect.top - 10;
      const menuLeft = p.selectionRect.left + p.selectionRect.width / 2;
      muDiWeiZhi = { top: menuTop, left: menuLeft };
      setXueXiCaiDanQiShiWeiZhi(null);
    } else {
      muDiWeiZhi = { top: 200, left: window.innerWidth / 2 };
      setXueXiCaiDanQiShiWeiZhi(null);
    }
    
    setXueXiCaiDanWeiZhi(muDiWeiZhi);
    console.log('[DEBUG handleXueXi] 设置完成，起始位置:', qiShiWeiZhi, '目标位置:', muDiWeiZhi);
    
    setDengLuXueXiCaiDan(true);
  }, [p.selectionRect, p.editPosition]);
  
  useEffect(() => {
    if (dengLuXueXiCaiDan && !p.showEditMenu) {
      p.handleCloseEdit();
      setTimeout(() => {
        setShowXueXiCaiDan(true);
        setDengLuXueXiCaiDan(false);
        console.log('[DEBUG handleXueXi] setShowXueXiCaiDan(true) 完成');
      }, 50);
    } else if (dengLuXueXiCaiDan && p.showEditMenu) {
      p.handleCloseEdit();
    }
  }, [dengLuXueXiCaiDan, p.showEditMenu, p.handleCloseEdit]);

  const handleExplain = useCallback((text: string) => {
    if (onGaiNianJieShi) {
      onGaiNianJieShi(text);
    }
    setShowXueXiCaiDan(false);
  }, [onGaiNianJieShi]);

  const handleParaphrase = useCallback((text: string) => {
    setFuShuWenBen(text);
    setShowFuShu(true);
    setShowXueXiCaiDan(false);
  }, []);

  const handleQuiz = useCallback(async (text: string) => {
    try {
      console.log('[DEBUG handleQuiz] 开始生成题目');
      console.log('[DEBUG handleQuiz] p.activeHuaXian:', p.activeHuaXian);
      let annotationId = p.activeHuaXian?.id;
      if (!annotationId && text) {
        const matched = p.huaXianList.find(h => h.text === text);
        if (matched) {
          annotationId = matched.id;
          console.log('[DEBUG handleQuiz] 通过文本匹配到划线 annotationId:', annotationId);
        }
      }
      console.log('[DEBUG handleQuiz] 最终 annotationId:', annotationId);
      const { data, error } = await aiService.generateFromSelectionAuto(chapterId || '', bookId, text, 1, annotationId);
      console.log('[DEBUG handleQuiz] 生成结果:', { data, error });
      if (error) {
        showWarning('AI 出题失败：' + error);
        return;
      }
      showSuccess(`已生成 1 道${data?.questionType || ''}题目`);
      loadQuestions();
    } finally {
      setShowXueXiCaiDan(false);
    }
  }, [chapterId, bookId, loadQuestions, p.activeHuaXian, p.huaXianList]);

  const handleUpdateQuestion = useCallback(async (questionId: string, updates: Partial<Question>) => {
    try {
      const { error } = await questionService.updateQuestion(questionId, updates);
      if (error) {
        showWarning('更新题目失败：' + error);
        return;
      }
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...updates } : q));
    } catch (e) {
      console.error('更新题目异常:', e);
      showWarning('更新题目失败');
    }
  }, []);

  const handleDeleteQuestion = useCallback(async (questionId: string, questionText: string, skipConfirm?: boolean) => {
    if (!skipConfirm) {
      const confirmed = confirm(`确定要删除这个问题吗？\n"${questionText.substring(0, 50)}..."`);
      if (!confirmed) return;
    }
    
    try {
      const { error } = await questionService.deleteQuestion(questionId);
      if (error) {
        showWarning('删除题目失败：' + error);
        return;
      }
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (e) {
      console.error('删除题目异常:', e);
      showWarning('删除题目失败');
    }
  }, []);

  const handleBatchDeleteQuestions = useCallback(async (questionIds: string[]) => {
    if (questionIds.length === 0) return;
    
    const confirmed = confirm(`确定要删除选中的 ${questionIds.length} 个题目吗？`);
    if (!confirmed) return;
    
    try {
      const deletePromises = questionIds.map(id => questionService.deleteQuestion(id));
      const results = await Promise.all(deletePromises);
      
      const hasError = results.some(result => result.error);
      if (hasError) {
        showWarning('部分题目删除失败');
      }
      
      setQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
    } catch (e) {
      console.error('批量删除题目异常:', e);
      showWarning('批量删除题目失败');
    }
  }, []);

  const handleGongJuTiaoDianJi = useCallback((anniu: any) => {
    if (anniu === 'lianxi') {
      loadQuestions();
      setShowLianXiMianBan(true);
    } else {
      buju.qieHuanChouTi(anniu);
    }
  }, [loadQuestions, buju]);

  const handleChaZhaoTiaoZhuan = useCallback((cfiOrHref: string, keyword?: string, onlyOne: boolean = false, weiZhi?: number) => {
    const rendition = p.renditionRef?.current;
    if (!rendition) {
      showWarning('阅读器未就绪，请稍后再试');
      return;
    }

    const qingChuJiuGaoLiang = () => {
      try {
        const contents = rendition.getContents();
        if (contents && contents[0]) {
          const doc = contents[0].window?.document;
          if (doc) {
            const gaoLiang = doc.querySelectorAll('.search-highlight');
            gaoLiang.forEach(el => {
              const parent = el.parentNode;
              while (el.firstChild) {
                parent?.insertBefore(el.firstChild, el);
              }
              parent?.removeChild(el);
            });
          }
        }
      } catch (e) {
        console.warn('清除旧高亮失败:', e);
      }
    };


    qingChuJiuGaoLiang();

    const tiaoZhuan = async () => {
      await rendition.display(cfiOrHref);

      requestAnimationFrame(() => {
        if (!keyword) return;
        
        try {
          const contents = rendition.getContents();
          if (contents && contents[0]) {
            const doc = contents[0].window?.document;
            
            if (doc && doc.body) {
              const style = doc.createElement('style');
              style.textContent = '@keyframes gaoLiangDanRu { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }';
              doc.head.appendChild(style);

              const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
              let node: Node | null;
              const textNodes: Node[] = [];
              
              while (node = walker.nextNode()) {
                textNodes.push(node);
              }

              const lowerKeyword = keyword.toLowerCase();
              let gaoLiangCount = 0;
              const maxGaoLiang = onlyOne ? 1 : 20;
              const targetWeiZhi = weiZhi !== undefined && onlyOne ? weiZhi : -1;
              let totalMatches = 0;

              for (const textNode of textNodes) {
                const text = textNode.textContent || '';
                const lowerText = text.toLowerCase();
                let idx = 0;
                
                while ((idx = lowerText.indexOf(lowerKeyword, idx)) !== -1 && gaoLiangCount < maxGaoLiang) {
                  totalMatches++;
                  
                  if (targetWeiZhi > 0 && totalMatches < targetWeiZhi) {
                    idx += keyword.length;
                    continue;
                  }
                  
                  try {
                    const range = doc.createRange();
                    const startOffset = idx;
                    const endOffset = idx + keyword.length;
                    
                    range.setStart(textNode, startOffset);
                    range.setEnd(textNode, endOffset);
                    
                    const span = doc.createElement('span');
                    span.className = 'search-highlight';
                    span.style.cssText = 'background-color: #fbbf24 !important; color: #000 !important; padding: 2px 4px !important; border-radius: 3px !important; animation: gaoLiangDanRu 0.3s ease-out;';
                    
                    if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                      range.surroundContents(span);
                      gaoLiangCount++;
                    } else {
                      const fragment = range.extractContents();
                      span.appendChild(fragment);
                      range.insertNode(span);
                      gaoLiangCount++;
                    }
                  } catch (e) {
                    console.warn('高亮单个失败:', e);
                  }
                  
                  idx += keyword.length;
                }
              }

              if (gaoLiangCount > 0) {
                if (onlyOne && gaoLiangCount === 0) {
                } else if (onlyOne) {
                } else {
                  showInfo(`已跳转并高亮 ${gaoLiangCount} 处`);
                }
              } else if (!onlyOne) {
                showInfo('已跳转到搜索位置');
              }
            }
          }
        } catch (e) {
          console.warn('高亮关键词失败:', e);
          if (!onlyOne) showInfo('已跳转到搜索位置');
        }
      });
    };

    tiaoZhuan().catch((e: Error) => {
      console.warn('搜索跳转失败:', e);
    });
  }, [p.renditionRef]);

  const isDarkMode = p.zhuTi === 'dark';

  useEffect(() => {
    if (buju.shuMing) {
      setBookInfo(prev => ({ ...prev, title: buju.shuMing }));
    }
  }, [buju.shuMing]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <div className="yue-du-qi" data-theme={isDarkMode ? 'dark' : 'light'}
      style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--ye-du-bei-jing)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <YueDuQiDingBuDaoHang shuMing={buju.shuMing} zuoZhe={buju.zuoZhe} onClose={onClose} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', maxWidth: '1320px', width: '100%', margin: '0 auto' }}>
        <EPUBYueDuQuYu url={url} location={p.location} onLocationChanged={p.handleLocationChanged}
          onGetRendition={p.handleRendition} souSuoCi={p.souSuoCi} onSouSuoJieGuo={p.handleSouSuoJieGuo}
          selectedText={p.selectedText} showMenu={p.showMenu} selectionRect={p.selectionRect}
          firstLineRect={p.firstLineRect}
          generating={p.generating} onCancel={p.handleCancel} onGenerateQuestion={p.handleGenerateQuestion}
          onHighlight={p.handleHighlight} onCopy={p.handleCopy}
          onShangYiYe={p.handlePrevPage} onXiaYiYe={p.handleNextPage} keJian={p.renditionJiuXu}
          darkMode={isDarkMode}
          showEditMenu={p.showEditMenu} editPosition={p.editPosition}
          activeHuaXian={p.activeHuaXian} onCloseEdit={p.handleCloseEdit}
          onDeleteHuaXian={p.handleDeleteHuaXian} onDeleteSingleHuaXian={p.handleDeleteSingleHuaXian}
          onChangeYanSe={p.handleChangeYanSe} onCopyText={p.handleCopyText} 
          onFuShuXueXi={onFuShuXueXi} onGaiNianJieShi={onGaiNianJieShi} onXueXi={handleXueXi}
        />
        {p.showEditMenu && p.editPosition && p.activeHuaXian && (
          <HuaXianBianJiCaiDan
            show={p.showEditMenu} position={p.editPosition}
            currentYanSe={p.activeHuaXian.yanSe}
            activeHuaXianList={p.activeHuaXianList}
            activeHuaXianText={p.activeHuaXian.text}
            onDelete={p.handleDeleteHuaXian} onDeleteSingle={p.handleDeleteSingleHuaXian}
            onCopy={p.handleCopyText} onChangeYanSe={p.handleChangeYanSe}
            onXueXi={handleXueXi}
            onClose={p.handleCloseEdit}
          />
        )}
        {showXueXiCaiDan && (
          <XueXiCaiDan
            show={showXueXiCaiDan}
            position={xueXiCaiDanWeiZhi}
            startPosition={xueXiCaiDanQiShiWeiZhi}
            text={dangQianWenBen}
            chapterId={chapterId}
            darkMode={isDarkMode}
            onExplain={handleExplain}
            onParaphrase={handleParaphrase}
            onQuiz={handleQuiz}
            onClose={() => setShowXueXiCaiDan(false)}
          />
        )}
        {showFuShu && (
          <FuShu
            text={fuShuWenBen}
            bookId={bookId}
            chapterId={chapterId}
            onClose={() => setShowFuShu(false)}
          />
        )}
      </div>
      <YouCeGongJuTiao dangQianDaKai={buju.daKaiDeChouTi} onAnNiuDianJi={handleGongJuTiaoDianJi}
        huaXianShuLiang={p.huaXianList.length} tiMuShuLiang={questions.length} isDarkMode={isDarkMode} onQieHuanZhuTi={p.qieHuanZhuTi} />
      {buju.daKaiDeChouTi !== null && (
        <div onClick={() => buju.setDaKaiDeChouTi(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 250, cursor: 'pointer' }} />
      )}
      {buju.daKaiDeChouTi === 'mulu' && (
        <MuLuChouTi shuMing={buju.shuMing} zuoZhe={buju.zuoZhe} zhangJieLieBiao={buju.zhangJieLieBiao}
          dangQianCfi={typeof p.location === 'string' ? p.location : ''} onZhangJieDianJi={handleZhangJieDianJi} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
      {buju.daKaiDeChouTi === 'huaxian' && (
        <BiJiChouTi highlights={p.highlights} bookId={bookId} onDelete={p.handleDeleteHighlight} onJump={handleTiaoZhuanCfi} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
      {buju.daKaiDeChouTi === 'chazhao' && (
        <ChaZhaoChouTi bookRef={p.bookRef} renditionRef={p.renditionRef} zhangJieLieBiao={buju.zhangJieLieBiao} onJump={handleChaZhaoTiaoZhuan} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
      <LianXiMianBan
        isOpen={showLianXiMianBan}
        onClose={() => setShowLianXiMianBan(false)}
        book={bookInfo as Book}
        questions={questions}
        onUpdate={handleUpdateQuestion}
        onDelete={handleDeleteQuestion}
        onBatchDelete={handleBatchDeleteQuestions}
      />
    </div>
  );
}
