// @审计已完成
// 阅读器主容器 - 微信读书风格：纯深色沉浸式背景 + 超大圆角卡片

import React, { useCallback } from 'react';
import { YueDuQiDingBuDaoHang } from './YueDuQiDingBuDaoHang';
import { EPUBYueDuQuYu } from './EPUBYueDuQuYu';
import { YouCeGongJuTiao } from './YouCeGongJuTiao';
import { MuLuChouTi } from './MuLuChouTi';
import { BiJiChouTi } from './BiJiChouTi';
import { useEPUBReaderHuoChuLi } from '../hooks/useEPUBReaderHuoChuLi';
import { useYueDuQiBuJu } from '../hooks/useYueDuQiBuJu';
import '../styles/YueDuSeCai.css';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated }: EPUBReaderProps) {
  const p = useEPUBReaderHuoChuLi({ bookId, chapterId, onParagraphCreated });
  const buju = useYueDuQiBuJu({ bookRef: p.bookRef, highlights: p.highlights, handleDeleteHighlight: p.handleDeleteHighlight });

  const handleTiaoZhuanCfi = useCallback((cfiRange: string) => {
    if (p.renditionRef.current) p.renditionRef.current.display(cfiRange);
    buju.setDaKaiDeChouTi(null);
  }, [p.renditionRef.current, buju.setDaKaiDeChouTi]);

  const handleZhangJieDianJi = useCallback((href: string) => {
    if (p.renditionRef.current) p.renditionRef.current.display(href);
    buju.setDaKaiDeChouTi(null);
  }, [p.renditionRef.current, buju.setDaKaiDeChouTi]);

  const isDarkMode = p.zhuTi === 'dark';

  return (
    <div className="yue-du-qi" data-theme={isDarkMode ? 'dark' : 'light'}
      style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--ye-du-bei-jing)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <YueDuQiDingBuDaoHang shuMing={buju.shuMing} zuoZhe={buju.zuoZhe} onClose={onClose} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', maxWidth: '1320px', width: '100%', margin: '0 auto' }}>
        <EPUBYueDuQuYu url={url} location={p.location} onLocationChanged={p.handleLocationChanged}
          onGetRendition={p.handleRendition} souSuoCi={p.souSuoCi} onSouSuoJieGuo={p.handleSouSuoJieGuo}
          selectedText={p.selectedText} showMenu={p.showMenu} selectionRect={p.selectionRect}
          generating={p.generating} onCancel={p.handleCancel} onGenerateQuestion={p.handleGenerateQuestion}
          onHighlight={p.handleHighlight} onCopy={p.handleCopy}
          onShangYiYe={p.handlePrevPage} onXiaYiYe={p.handleNextPage} keJian={p.renditionJiuXu}
          darkMode={isDarkMode} />
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
      {buju.daKaiDeChouTi === 'biji' && (
        <BiJiChouTi highlights={p.highlights} onDelete={p.handleDeleteHighlight} onJump={handleTiaoZhuanCfi} onGuanBi={() => buju.setDaKaiDeChouTi(null)} />
      )}
    </div>
  );
}
