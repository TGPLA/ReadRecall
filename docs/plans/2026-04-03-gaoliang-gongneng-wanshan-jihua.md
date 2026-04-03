# 文本高亮功能完善方案

## 需求概述

完善 EPUB 阅读器的文本高亮功能，新增以下能力：
1. **高亮列表管理** - 右侧侧边栏展示已保存的高亮，点击可跳转到对应位置
2. **编辑/删除高亮** - 支持删除单个高亮
3. **多颜色分类** - 支持黄色、绿色、蓝色、粉色等多种颜色
4. **高亮笔记功能** - 保存高亮时可输入备注文字

## 当前实现分析

### 现有代码
- `useHuaXianChuTi.ts` - 高亮核心逻辑，使用 localStorage 存储高亮
- `GaoLiangXinXi` 接口仅包含 `text` 和 `cfiRange`
- 高亮应用使用 `rendition.annotations.highlight()`

### 存储结构
```typescript
interface GaoLiangXinXi {
  text: string;
  cfiRange: string;
}
```

## 实现方案

### 1. 扩展数据结构

扩展 `GaoLiangXinXi` 接口：

```typescript
export type GaoLiangYanSe = 'yellow' | 'green' | 'blue' | 'pink';

export interface GaoLiangXinXi {
  text: string;
  cfiRange: string;
  yanSe: GaoLiangYanSe;       // 新增：颜色
  beiZhu: string;              // 新增：备注
  createdAt: number;           // 新增：创建时间戳
}
```

### 2. 修改高亮菜单组件

在 `HuaXianCaiDan.tsx` 中添加：
- 颜色选择器（4 种颜色选项）
- 备注输入框（保存时弹出或默认空）

### 3. 创建高亮侧边栏组件

新建 `GaoLiangCeLan.tsx`：
- 展示高亮列表（按时间倒序）
- 每项显示：颜色标记 + 文本预览 + 备注 + 删除按钮
- 点击文本跳转位置
- 支持收起/展开

### 4. 修改 EPUBReader 布局

修改 `EPUBReader.tsx`：
- 改为 flex 布局：工具栏 | 阅读区域 | 侧边栏（可收起）
- 传递 highlights 状态给侧边栏

### 5. 修改 useHuaXianChuTi

- handleHighlight 增加颜色和备注参数
- 支持删除单个高亮
- 加载高亮时应用对应颜色

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/features/books/hooks/useHuaXianChuTi.ts` | 修改 - 扩展数据结构、增加删除功能 |
| `src/features/books/components/HuaXianCaiDan.tsx` | 修改 - 添加颜色选择、备注输入 |
| `src/features/books/components/GaoLiangCeLan.tsx` | 新建 - 高亮侧边栏组件 |
| `src/features/books/components/EPUBReader.tsx` | 修改 - 集成侧边栏、调整布局 |
| `src/features/books/components/EPUBReaderGongJuLan.tsx` | 修改 - 添加高亮列表开关按钮 |
| `src/features/books/hooks/useEPUBReaderHuoChuLi.ts` | 修改 - 透传高亮侧边栏状态 |

## 技术要点

1. **颜色实现** - epubjs highlight 支持通过 CSS 类名设置颜色
2. **跳转实现** - 使用 `rendition.display(cfiRange)` 跳转到指定位置
3. **localStorage** - 继续使用现有存储，保持数据兼容性（可选升级迁移）

## 验收标准

- [ ] 划线后可在侧边栏看到高亮记录
- [ ] 点击侧边栏高亮可跳转到对应位置
- [ ] 可选择不同颜色（至少 4 种）
- [ ] 可为高亮添加备注
- [ ] 可删除单个高亮
- [ ] 刷新页面后高亮数据保持
- [ ] 侧边栏可收起/展开