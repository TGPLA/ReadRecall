// @审计已完成
// 阅读器主容器 - 微信读书风格：纯深色沉浸式背景 + 超大圆角卡片

import React, { useCallback } from 'react';
import { YueDuQiDingBuDaoHang } from './YueDuQiDingBuDaoHang';
import { EPUBYueDuQuYu } from './EPUBYueDuQuYu';
import { YouCeGongJuTiao } from './YouCeGongJuTiao';
import { HuaXianBianJiCaiDan } from './HuaXianBianJiCaiDan';
import { MuLuChouTi } from './MuLuChouTi';
import { BiJiChouTi } from './BiJiChouTi';
import { ChaZhaoChouTi } from './ChaZhaoChouTi';
import { ZhangJieHuaXianJiLu } from './ZhangJieHuaXianJiLu';
import { useEPUBReaderHuoChuLi } from '../hooks/useEPUBReaderHuoChuLi';
import { useYueDuQiBuJu } from '../hooks/useYueDuQiBuJu';
import type { HuaXianXinXi } from '../hooks/useHuaXianChuTi';
import { showWarning, showInfo } from '../../../shared/utils/common/ToastGongJu';
import '../styles/YueDuSeCai.css';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId?: string;
  onParagraphCreated?: () => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated }: EPUBReaderProps) {
  const p = useEPUBReaderHuoChuLi({ bookId, chapterId, onParagraphCreated });
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
          onHighlight={p.handleHighlight} onMaKeBi={p.handleMarker} onCopy={p.handleCopy}
          onShangYiYe={p.handlePrevPage} onXiaYiYe={p.handleNextPage} keJian={p.renditionJiuXu}
          darkMode={isDarkMode}
          showEditMenu={p.showEditMenu} editPosition={p.editPosition}
          activeHuaXian={p.activeHuaXian} onCloseEdit={p.handleCloseEdit}
          onDeleteHuaXian={p.handleDeleteHuaXian} onDeleteSingleHuaXian={p.handleDeleteSingleHuaXian}
          onChangeYanSe={p.handleChangeYanSe} onCopyText={p.handleCopyText}
        />
        {p.showEditMenu && p.editPosition && p.activeHuaXian && (
          <HuaXianBianJiCaiDan
            show={p.showEditMenu} position={p.editPosition}
            currentYanSe={p.activeHuaXian.yanSe}
            currentLeiXing={p.activeHuaXian.leiXing || 'underline'}
            activeHuaXianList={p.activeHuaXianList}
            activeHuaXianText={p.activeHuaXian.text}
            generating={p.generating}
            onDelete={p.handleDeleteHuaXian} onDeleteSingle={p.handleDeleteSingleHuaXian}
            onCopy={p.handleCopyText} onChangeYanSe={p.handleChangeYanSe}
            onChangeLeiXing={p.handleChangeLeiXing} onGenerateQuestion={p.handleGenerateQuestion}
            onClose={p.handleCloseEdit}
          />
        )}
      </div>
      <YouCeGongJuTiao dangQianDaKai={buju.daKaiDeChouTi} onAnNiuDianJi={buju.qieHuanChouTi}
        huaXianShuLiang={p.huaXianList.length} isDarkMode={isDarkMode} onQieHuanZhuTi={p.qieHuanZhuTi} />
      {buju.daKaiDeChouTi !== null && (
        <div onClick={() => buju.setDaKaiDeChouTi(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 250, cursor: 'pointer' }} />
      )}
      {buju.daKaiDeChouTi === 'mulu' && (
        <MuLuChouTi shuMing={buju.shuMing} zuoZhe={buju.zuoZhe} zhangJieLieBiao={buju.zhangJieLieBiao}
          dangQianCfi={typeof p.location === 'string' ? p.location : ''} onZhangJieDianJi={handleZhangJieDianJi} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
      {buju.daKaiDeChouTi === 'huaxian' && (
        <BiJiChouTi highlights={p.highlights} onDelete={p.handleDeleteHighlight} onJump={handleTiaoZhuanCfi} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
      {buju.daKaiDeChouTi === 'chazhao' && (
        <ChaZhaoChouTi bookRef={p.bookRef} renditionRef={p.renditionRef} zhangJieLieBiao={buju.zhangJieLieBiao} onJump={handleChaZhaoTiaoZhuan} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
    </div>
  );
}
