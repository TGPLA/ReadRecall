// @审计已完成
// EPUB 阅读器弹窗 - 全屏沉浸式阅读器（无白边无边框）

import React from 'react';
import { createPortal } from 'react-dom';
import { EPUBReader } from './EPUBReader';

interface EPUBReaderModalProps {
  isOpen: boolean;
  url: string;
  darkMode: boolean;
  bookId: string;
  chapterId: string;
  onClose: () => void;
  onParagraphCreated?: () => void;
}

export function EPUBReaderModal({ isOpen, url, darkMode, bookId, chapterId, onClose, onParagraphCreated }: EPUBReaderModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <EPUBReader url={url} darkMode={darkMode} onClose={onClose} bookId={bookId} chapterId={chapterId} onParagraphCreated={onParagraphCreated} />
    </div>,
    document.body
  );
}
