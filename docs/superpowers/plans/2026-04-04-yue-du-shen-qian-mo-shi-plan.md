# 阅读器浅色/深色模式切换 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为阅读器页面实现浅色/深色两种模式的完整切换，使用 CSS 变量管理配色，通过右侧工具栏太阳/月亮图标触发，带 0.3s 过渡动画。

**Architecture:** 新建 CSS 变量文件定义两套配色方案（`:root` 浅色 + `[data-theme="dark"]` 深色），扩展现有 useZhuTi Hook 增加完整配色字段并简化为 light/dark 双模式，修改 4 个阅读器组件将硬编码颜色替换为 `var(--xxx)` 引用，修改工具栏按钮为太阳/月亮图标切换逻辑。

**Tech Stack:** React, TypeScript, CSS Variables, epub.js (rendition.themes), use-local-storage-state

---

## 文件结构总览

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| **新建** | `src/features/books/styles/YueDuSeCai.css` | CSS 变量定义（7 个颜色变量 × 2 套主题） |
| **修改** | `src/features/books/hooks/useZhuTi.ts` | 扩展配色方案 + 简化为 light/dark |
| **修改** | `src/features/books/components/YouCeGongJuTiao.tsx` | 主题按钮 → 太阳/月亮图标切换 |
| **修改** | `src/features/books/components/EPUBReader.tsx` | 外层容器 data-theme + CSS 变量 |
| **修改** | `src/features/books/components/EPUBYueDuQuYu.tsx` | 纸张容器 CSS 变量 |
| **修改** | `src/features/books/components/YueDuQiDingBuDaoHang.tsx` | 导航栏 CSS 变量 |

---

### Task 1: 创建 CSS 变量配色文件

**Files:**
- Create: `src/features/books/styles/YueDuSeCai.css`

- [ ] **Step 1: 创建 YueDuSeCai.css，定义完整的 CSS 变量体系**

```css
/* @审计已完成 */
/* 阅读器配色系统 - CSS 变量 */

/* ====== 浅色模式（默认）====== */
.yue-du-qi {
  --ye-du-bei-jing: #F4F4F4;
  --zhi-zhen-bei-jing: #FFFFFF;
  --zheng-wen-yan-se: #1A1A2E;
  --biao-ti-yan-se: #A04030;
  --ci-yao-wen-zi: #6B7280;
  --gong-ju-lan-bei-jing: rgba(0, 0, 0, 0.06);
  --bian-kuang-yan-se: #E5E7EB;
}

/* ====== 深色模式 ====== */
.yue-du-qi[data-theme="dark"] {
  --ye-du-bei-jing: #1A1A1A;
  --zhi-zhen-bei-jing: #252525;
  --zheng-wen-yan-se: #C8C8D0;
  --biao-ti-yan-se: #E07080;
  --ci-yao-wen-zi: #8B8B96;
  --gong-ju-lan-bei-jing: rgba(255, 255, 255, 0.08);
  --bian-kuang-yan-se: #333340;
}
```

**设计说明：**
- 使用 `.yue-du-qi` 作为命名空间类名，避免污染全局样式
- 通过 `[data-theme="dark"]` 属性选择器覆盖变量值
- 7 个变量覆盖：页面背景、纸张背景、正文、标题、次要文字、工具栏、边框

---

### Task 2: 扩展 useZhuTi Hook

**Files:**
- Modify: `src/features/books/hooks/useZhuTi.ts`

- [ ] **Step 1: 重写 useZhuTi.ts，扩展配色方案并简化为 light/dark**

将整个文件替换为以下内容：

```typescript
// @审计已完成
// 主题 Hook - 管理阅读主题配色（浅色/深色）

import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';

export type ZhuTiLeiXing = 'light' | 'dark';

interface ZhuTiSheZhi {
  backgroundColor: string;
  textColor: string;
  titleColor: string;
}

const ZHU_TI_PEIZHI: Record<ZhuTiLeiXing, ZhuTiSheZhi> = {
  light: { backgroundColor: '#FFFFFF', textColor: '#1A1A2E', titleColor: '#A04030' },
  dark: { backgroundColor: '#252525', textColor: '#C8C8D0', titleColor: '#E07080' },
};

interface UseZhuTiProps {
  userId: string;
  bookId: string;
}

export function useZhuTi({ userId, bookId }: UseZhuTiProps) {
  const storageKey = `zhuti_${userId}_${bookId}`;
  const [zhuTi, setZhuTi] = useLocalStorageState<ZhuTiLeiXing>(storageKey, { defaultValue: 'light' });

  const qieHuanZhuTi = () => {
    setZhuTi(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const yingYongZhuTi = (rendition: Rendition, theme: ZhuTiLeiXing) => {
    const peizhi = ZHU_TI_PEIZHI[theme];
    const themes = rendition.themes;
    themes.override('color', peizhi.textColor);
    themes.override('background', peizhi.backgroundColor);
    themes.default({
      '.epubjs-hl': { 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply' },
      '.hl-yellow': { 'fill': '#fef08a' },
      '.hl-green': { 'fill': '#86efac' },
      '.hl-blue': { 'fill': '#93c5fd' },
      '.hl-pink': { 'fill': '#f9a8d4' },
    });
  };

  return { zhuTi, setZhuTi, qieHuanZhuTi, yingYongZhuTi, ZHU_TI_PEIZHI };
}
```

**变更要点：**
- 移除 `eye` 护眼模式，只保留 `light | dark`
- `ZhuTiSheZhi` 增加 `titleColor` 字段
- 新增 `qieHuanZhuTi()` 切换方法（light ↔ dark 互切）
- 配色值与 Task 1 的 CSS 变量保持一致

---

### Task 3: 修改工具栏 — 太阳/月亮图标切换

**Files:**
- Modify: `src/features/books/components/YouCeGongJuTiao.tsx`

- [ ] **Step 1: 修改 YouCeGongJuTiao 组件接口和图标定义**

在现有文件中做以下替换：

**接口变更** — 在 props 中增加 `isDarkMode` 和 `onQieHuanZhuTi`：

```typescript
interface YouCeGongJuTiaoProps {
  dangQianDaKai: string | null;
  onAnNiuDianJi: (anniu: GongJuTiaoAnNiu) => void;
  gaoLiangShuLiang: number;
  isDarkMode: boolean;
  onQieHuanZhuTi: () => void;
}
```

**图标变更** — 将 `zhuti` 图标的 path 替换为太阳图标（月亮由组件内动态切换）：

```typescript
const TU_BIAO: Record<GongJuTiaoAnNiu, { path: string; viewBox: string; title: string }> = {
  mulu: { path: 'M4 6h16M4 12h16M4 18h16', viewBox: '0 0 24 24', title: '目录' },
  biji: { path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', viewBox: '0 0 24 24', title: '笔记' },
  zihao: { path: 'M4 6h16M4 10h16M4 14h16M4 18h10', viewBox: '0 0 24 24', title: '字号' },
  zhuti: { path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', viewBox: '0 0 24 24', title: '主题' },
  gaoliang: { path: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', viewBox: '0 0 24 24', title: `高亮` },
};
```

**组件签名变更**：

```typescript
export function YouCeGongJuTiao({ dangQianDaKai, onAnNiuDianJi, gaoLiangShuLiang, isDarkMode, onQieHuanZhuTi }: YouCeGongJuTiaoProps) {
```

- [ ] **Step 2: 修改「主题」按钮的渲染逻辑 — 太阳/月亮动态切换**

在 `anNiuLieBiao.map` 回调中，找到 `key === 'zhuti'` 的按钮，将其 onClick 改为调用 `onQieHuanZhuTi`，并根据 `isDarkMode` 动态渲染不同图标：

将原有的 `<button>` 中 zhuti 相关部分替换为：

```tsx
{key === 'zhuti' ? (
  <button
    key={key}
    title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
    onClick={onQieHuanZhuTi}
    style={{
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: isActive ? '#3f3f46' : '#27272a',
      color: isActive ? '#ffffff' : '#a1a1aa',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#3f3f46'; }}
    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#27272a'; }}
  >
    <svg width="20" height="20" fill={isDarkMode ? 'currentColor' : '#fbbf24'} stroke={isDarkMode ? 'currentColor' : '#fbbf24'} strokeWidth={isDarkMode ? '1.8' : '0'} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {isDarkMode ? (
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      ) : (
        <><circle cx="12" cy="12" r="5" /><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></>
      )}
    </svg>
  </button>
) : (
  /* 其他按钮保持原有逻辑不变 */
)}
```

**设计说明：**
- 浅色模式显示金色太阳图标（#fbbf24），深色模式显示月亮轮廓图标
- 点击时调用 `onQieHuanZhuTi()` 触发 light ↔ dark 切换
- 不再走 `onAnNiuDianJi` 抽屉逻辑，而是直接切换主题

---

### Task 4: 修改 EPUBReader 主容器

**Files:**
- Modify: `src/features/books/components/EPUBReader.tsx`

- [ ] **Step 1: 导入 CSS 变量文件和扩展 props**

在文件头部添加 import：

```typescript
import '../styles/YueDuSeCai.css';
```

- [ ] **Step 2: 修改外层容器 div — 使用 CSS 变量 + data-theme**

将现有的外层容器 style：

```tsx
<div style={{ height: '100vh', width: '100vw', backgroundColor: '#141414', ... }}>
```

替换为：

```tsx
<div className="yue-du-qi" data-theme={darkMode ? 'dark' : 'light'} style={{
  height: '100vh',
  width: '100vw',
  backgroundColor: 'var(--ye-du-bei-jing)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  transition: 'background-color 0.3s ease',
}}>
```

- [ ] **Step 3: 将 isDarkMode 和 qieHuanZhuTi 传递给 YouCeGongJuTiao**

找到 `<YouCeGongJuTiao ... />` 调用，添加新 props：

```tsx
<YouCeGongJuTiao
  dangQianDaKai={buju.daKaiDeChouTi}
  onAnNiuDianJi={buju.qieHuanChouTi}
  gaoLiangShuLiang={p.highlights.length}
  isDarkMode={p.zhuTi === 'dark'}
  onQieHuanZhuTi={p.qieHuanZhuTi}
/>
```

---

### Task 5: 修改 EPUBYueDuQuYu 纸张容器

**Files:**
- Modify: `src/features/books/components/EPUBYueDuQuYu.tsx`

- [ ] **Step 1: 将 ZHI_ZHEN_NEI_RONG 样式中的硬编码颜色替换为 CSS 变量**

将：

```typescript
const ZHI_ZHEN_NEI_RONG: React.CSSProperties = {
  ...
  backgroundColor: '#1c1c1e',
  ...
};
```

替换为：

```typescript
const ZHI_ZHEN_NEI_RONG: React.CSSProperties = {
  width: '100%',
  maxWidth: '1200px',
  height: '100%',
  backgroundColor: 'var(--zhi-zhen-bei-jing)',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
  transition: 'background-color 0.3s ease',
};
```

---

### Task 6: 修改顶部导航栏

**Files:**
- Modify: `src/features/books/components/YueDuQiDingBuDaoHang.tsx`

- [ ] **Step 1: 将书名文字颜色和按钮颜色替换为 CSS 变量**

将书名 span 的 color 从 `#e5e7eb` 改为 `var(--ci-yao-wen-zi)`：

```tsx
<span style={{
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--ci-yao-wen-zi)',
  ...
}}>
```

将「我的书架」按钮的 border/color 改为 CSS 变量：

```tsx
<button
  onClick={onClose}
  style={{
    padding: '0.35rem 0.85rem',
    border: '1px solid var(--bian-kuang-yan-se)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--ci-yao-wen-zi)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.15s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--gong-ju-lan-bei-jing)';
    e.currentTarget.style.color = 'var(--zheng-wen-yan-se)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'var(--ci-yao-wen-zi)';
  }}
>
  我的书架
</button>
```

---

### Task 7: 构建验证与行数检查

- [ ] **Step 1: 运行构建验证**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误

- [ ] **Step 2: 运行行数检查**

Run: `npm run check:lines`
Expected: 所有文件行数 ≤ 100

- [ ] **Step 3: 启动开发服务器进行浏览器验证**

Run: `npm run dev`
验证项：
1. 打开阅读器页面，默认应为浅色模式
2. 点击右侧工具栏「太阳」图标 → 整个阅读器切换到深色模式
3. 再次点击「月亮」图标 → 切回浅色模式
4. 切换时颜色变化应有 ~0.3s 过渡动画
5. 刷新页面后主题状态应保持（localStorage）
6. EPUB 内容区域的文字颜色也应随主题同步变化
