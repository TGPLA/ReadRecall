# 阅读器重构实施计划

**Goal:** 点击书架上的书籍直接进入阅读器，取消书籍详情页面

**Architecture:** 修改 App.tsx 的页面路由逻辑，点击书籍后直接设置 `showReader` 状态打开阅读器，移除 BookDetail 页面

**Tech Stack:** React, TypeScript

---

### Task 1: 修改 App.tsx - 移除详情页，添加阅读器状态控制

**Files:**
- Modify: `src/core/App.tsx`

- [ ] **Step 1: 移除 BookDetail 导入**

```typescript
// 删除这行
import { BookDetail } from '@features/books/components/BookDetail';
```

- [ ] **Step 2: 添加阅读器状态变量**

```typescript
const [showReader, setShowReader] = useState(false);
```

- [ ] **Step 3: 修改 handleSelectBook 函数**

```typescript
const handleSelectBook = (book: Book) => {
  setSelectedBook(book);
  setShowReader(true);  // 直接打开阅读器
};
```

- [ ] **Step 4: 添加 handleCloseReader 函数**

```typescript
const handleCloseReader = () => {
  setShowReader(false);
  setSelectedBook(null);
};
```

- [ ] **Step 5: 移除 detail 相关渲染和逻辑**

- 删除 `currentPage === 'detail'` 条件渲染块
- 删除 handleBackToDetail 和 handleBackToShelf 中对 'detail' 的引用
- 删除 handleComplete 中对 'detail' 的引用
- 将 'detail' 从 Page type 中移除（可选）

---

### Task 2: 修改 BookShelf.tsx - 移除 onSelectBook 改为直接打开阅读器

**Files:**
- Modify: `src/features/books/components/BookShelf.tsx`

- [ ] **Step 1: 修改 props，移除 onSelectBook**

```typescript
interface BookShelfProps {
  onOpenReader: (book: Book) => void;  // 改为直接打开阅读器
  onOpenSettings: () => void;
}
```

- [ ] **Step 2: 修改 BookCard 点击处理**

```typescript
// 将 onClick={() => onSelectBook(book)} 改为
onClick={() => onOpenReader(book)}
```

- [ ] **Step 3: 修改 App.tsx 中 BookShelf 的调用**

```typescript
<BookShelf 
  onOpenReader={handleSelectBook} 
  onOpenSettings={() => setCurrentPage('settings')} 
/>
```

---

### Task 3: 创建独立的 EPUB 阅读器页面组件

**Files:**
- Create: `src/features/books/components/EPUBReaderPage.tsx`

- [ ] **Step 1: 创建全屏阅读器页面组件**

```typescript
// @审计已完成
// EPUB 阅读器页面 - 全屏独立页面模式

import { useState, useEffect } from 'react';
import { EPUBReader } from './EPUBReader';
import { databaseService } from '@shared/services/database';
import type { Book } from '@infrastructure/types';

interface EPUBReaderPageProps {
  book: Book;
  onClose: () => void;
}

export function EPUBReaderPage({ book, onClose }: EPUBReaderPageProps) {
  const [defaultChapterId, setDefaultChapterId] = useState<string>('');
  
  useEffect(() => {
    const loadDefaultChapter = async () => {
      const { chapters } = await chapterService.getChaptersByBook(book.id);
      if (chapters.length > 0) {
        setDefaultChapterId(chapters[0].id);
      }
    };
    loadDefaultChapter();
  }, [book.id]);

  const epubUrl = book.epubFilePath 
    ? databaseService.getEPUBUrl(book.id, book.epubFilePath) 
    : '';

  if (!epubUrl) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>该书籍没有 EPUB 文件</p>
        <button onClick={onClose}>返回</button>
      </div>
    );
  }

  return (
    <EPUBReader
      url={epubUrl}
      darkMode={false}
      onClose={onClose}
      bookId={book.id}
      chapterId={defaultChapterId}
    />
  );
}
```

---

### Task 4: 在阅读器工具栏添加返回按钮

**Files:**
- Modify: `src/features/books/components/EPUBReaderGongJuLan.tsx`

- [ ] **Step 1: 添加 onClose prop 到工具栏组件**

在 EPUBReaderGongJuLan 的 props 中添加 onClose?: () => void

- [ ] **Step 2: 在工具栏左侧添加返回按钮**

```typescript
{onClose && (
  <button 
    onClick={onClose}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      padding: '0.5rem',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: darkMode ? '#9ca3af' : '#6b7280'
    }}
  >
    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    返回
  </button>
)}
```

- [ ] **Step 3: 在 EPUBReader 组件中传递 onClose prop**

```typescript
<EPUBReaderGongJuLan
  // ... 其他 props
  onClose={onClose}
/>
```

---

### Task 5: 在 App.tsx 中渲染阅读器页面

**Files:**
- Modify: `src/core/App.tsx`

- [ ] **Step 1: 导入 EPUBReaderPage 组件**

```typescript
import { EPUBReaderPage } from '@features/books/components/EPUBReaderPage';
```

- [ ] **Step 2: 添加阅读器渲染逻辑**

```typescript
{showReader && selectedBook && (
  <EPUBReaderPage
    book={selectedBook}
    onClose={handleCloseReader}
  />
)}
```

- [ ] **Step 3: 处理无 EPUB 文件的情况**

如果书籍没有 epubFilePath，需要显示提示信息或返回书架

---

### Task 6: 删除 BookDetail.tsx 文件

**Files:**
- Delete: `src/features/books/components/BookDetail.tsx`

- [ ] **Step 1: 确认无其他文件引用 BookDetail**

搜索: `import.*BookDetail`

- [ ] **Step 2: 删除文件**

物理删除 BookDetail.tsx

---

### Task 7: 验证构建和功能

**Files:**
- Test: 全局

- [ ] **Step 1: 运行构建检查**

```bash
npm run build
```

- [ ] **Step 2: 检查类型错误**

```bash
npm run typecheck  # 如果有的话
```

- [ ] **Step 3: 手动测试**
1. 打开书架
2. 点击任意书籍
3. 验证直接进入阅读器
4. 点击返回按钮，验证回到书架

---

## 执行选项

**1. Subagent-Driven (recommended)** - 逐任务执行，定期 review

**2. Inline Execution** - 当前会话批量执行

请选择执行方式。
