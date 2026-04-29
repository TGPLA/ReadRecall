---
name: "前端开发"
description: "阅读回响前端开发的技能入口。涵盖React组件、页面、Hook、状态管理、样式等。当任务涉及UI组件、交互逻辑、状态管理时加载此技能。"
---

# 前端开发技能入口 (L2)

## 技术栈概览

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: TailwindCSS 3 + 自定义CSS
- **状态管理**: Context API + use-local-storage-state
- **路由**: 单页应用（无React Router，使用条件渲染）
- **测试**: Vitest (单元) + Playwright (E2E)
- **UI库**: Lucide-react (图标) + react-reader (EPUB渲染)

---

## 模块导航 (L3 → L4)

### 01-书籍管理模块

**路径**: `src/features/books/`

| 功能点 | 组件文件 | Hook文件 | 说明 |
|-------|---------|----------|------|
| **书架展示** | `BookShelf.tsx` | - | 书籍列表、网格/列表视图切换 |
| **书籍卡片** | `BookCard.tsx` | - | 单本书的信息展示 |
| **添加书籍** | `AddBookModal.tsx` | - | 手动添加书籍弹窗 |
| **书架操作** | `BookShelfCaoZuo.tsx` | - | 排序、筛选、批量操作 |
| **书架控制** | `BookShieKongZhi.tsx` | - | 书架控制面板 |
| **删除确认** | `ShanChuQueRenTanChuang.tsx` | - | 删除书籍确认对话框 |

#### EPUB 导入子系统

| 功能点 | 组件文件 | 说明 |
|-------|---------|------|
| **导入主弹窗** | `EPUBDaoRuTanChuang.tsx` | 导入流程的入口弹窗 |
| **上传表单** | `EPUBDaoRuTanChuangShangChuanBiaoDan.tsx` | 文件选择+元数据填写 |
| **文件选择器** | `EPUBDaoRuTanChuangShangChuanWenJian.tsx` | 本地文件选取 |
| **上传进度** | `EPUBDaoRuTanChuangShangChuanZhong.tsx` | 上传进度显示 |
| **确认信息** | `EPUBDaoRuTanChuangQueRen.tsx` | 导入前最终确认 |
| **上传逻辑** | `EPUBDaoRuTanChuangShangChuan.tsx` | 上传业务逻辑封装 |

#### EPUB 阅读器子系统

| 功能点 | 组件/Hook | 关键功能 |
|-------|-----------|---------|
| **阅读器主体** | `EPUBReader.tsx` | EPUB渲染核心组件 |
| **阅读区域** | `EPUBYueDuQuYu.tsx` | 阅读内容显示区 |
| **阅读器页面** | `EPUBReaderPage.tsx` | 完整阅读页布局 |
| **阅读器弹窗** | `EPUBReaderModal.tsx` | 弹窗模式阅读器 |
| **顶部导航** | `YueDuQiDingBuDaoHang.tsx` | 章节导航、返回按钮 |
| **底部翻页** | `YueDuQiDiBuFanYe.tsx` | 翻页控件、进度条 |
| **基础Hook** | `useEPUBReaderJiChuHuo.ts` | 初始化、打开/关闭 |
| **处理Hook** | `useEPUBReaderHuoChuLi.ts` | 字体、主题、字号处理 |
| **翻页Hook** | `useEPUBReaderFanYeHeYeMa.ts` | 翻页逻辑、页码计算 |
| **样式Hook** | `useEPUBReaderYangShi.ts` | CSS变量、主题色 |
| **事件Hook** | `useEPUBReaderShiJian.ts` | 键盘、触摸事件 |
| **CFI定位** | `useEPUBCFi.ts` | CFI解析与跳转 |
| **布局Hook** | `useYueDuQiBuJu.ts` | 响应式布局计算 |
| **阅读进度** | `useYueDuJinDu.ts` | 进度保存与恢复 |

#### 划线笔记子系统

| 功能点 | 组件/Hook | 说明 |
|-------|-----------|------|
| **划线菜单** | `HuaXianCaiDan.tsx` | 划线后的操作菜单 |
| **编辑菜单** | `HuaXianBianJiCaiDan.tsx` | 编辑已有划线的菜单 |
| **创建Hook** | `useHuaCiChuangJian.ts` | 创建新划线的完整流程 |
| **触发Hook** | `useHuaXianDianJi.ts` | 点击划线的响应逻辑 |
| **出题Hook** | `useHuaXianChuTi.ts` | 从划线生成练习题 |

#### 笔记系统

| 功能点 | 组件文件 | 说明 |
|-------|---------|------|
| **笔记抽屉** | `BiJiChouTi.tsx` | 右侧笔记抽屉面板 |
| **查找抽屉** | `ChaZhaoChouTi.tsx` | 全文搜索抽屉 |
| **查找列表** | `ChaZhaoChouTiLieBiao.tsx` | 搜索结果列表 |
| **查找头部** | `ChaZhaoChouTiTouBu.tsx` | 搜索输入框 |
| **目录抽屉** | `MuLuChouTi.tsx` | 章节目录导航 |

#### 其他书籍组件

| 功能点 | 组件文件 | 说明 |
|-------|---------|------|
| **头部导航** | `TouBuDaoHang.tsx` | 全局顶部导航栏 |
| **右侧工具条** | `YouCeGongJuTiao.tsx` | 浮动工具栏 |
| **学习菜单** | `XueXiCaiDan.tsx` | 学习模式选择菜单 |
| **练习面板** | `LianXiMianBan.tsx` | 底部练习答题面板 |
| **章节理解** | `ZhangJieLiJie.tsx` | 章节理解度展示 |
| **引导教程** | `GuidedTour.tsx` | 新手引导流程 |
| **题目管理** | `QuestionManagementModal.tsx` | 题目CRUD弹窗 |

---

### 02-练习系统模块

**路径**: `src/features/practice/`

| 功能点 | 组件文件 | 说明 |
|-------|---------|------|
| **复述练习** | `FuShu.tsx` | 章节复述练习界面 |
| **复述学习** | `FuShuXueXi.tsx` | 复述结果的学习反馈 |
| **概念解释** | `GaiNianJieShi.tsx` | AI概念解释展示 |
| **AI评价** | `AIPingJia.tsx` | AI评分和评语展示 |

**相关服务** (`src/shared/services/`):
- `questionService.ts` - 题目CRUD
- `practiceRecordService.ts` - 练习记录
- `aiService.ts` - AI评价服务
- `paraphraseService.ts` - 复述服务

---

### 03-用户系统模块

**路径**: `src/features/user/`

| 功能点 | 组件文件 | 说明 |
|-------|---------|------|
| **认证页面** | `AuthPage.tsx` | 登录/注册切换 |
| **设置页面** | `SettingsPage.tsx` | 用户偏好设置 |
| **账户信息** | `ZhangHuXinXi.tsx` | 账户详情展示 |
| **修改密码** | `XiuGaiMiMaTanChuang.tsx` | 密码修改弹窗 |
| **后端不可用** | `BackendUnavailable.tsx` | 后端离线提示 |

**相关服务** (`src/shared/services/`):
- `auth.ts` - 认证逻辑
- `userCloudStorage.ts` - 云存储同步

---

### 04-基础设施层

**路径**: `src/infrastructure/`

| 功能点 | 文件 | 说明 |
|-------|------|------|
| **应用上下文** | `hooks/context.ts` | 全局Context定义 |
| **上下文Hook** | `hooks/useAppContext.ts` | 获取上下文的Hook |
| **应用Provider** | `hooks/AppProvider.tsx` | Provider包裹组件 |
| **状态Store** | `store/index.ts` | 全局状态管理 |
| **类型定义** | `types/` | 所有TypeScript类型 |

**类型结构**:
```
types/
├── base/enums.ts        # 枚举定义
├── book/book.ts         # 书籍类型
├── book/chapter.ts      # 章节类型
├── book/paragraph.ts    # 段落类型
├── book/question.ts     # 题目类型
├── book/practiceRecord.ts # 练习记录类型
├── config/settings.ts   # 配置类型
├── other/practice.ts    # 练习相关类型
├── other/sync.ts        # 同步相关类型
└── user/user.ts         # 用户类型
```

---

### 05-共享工具层

**路径**: `src/shared/`

#### 通用组件 (`utils/common/`)

| 组件 | 文件 | 用途 |
|------|------|------|
| **错误边界** | `CuoWuBianJie.tsx` | React错误边界捕获 |
| **错误定义** | `CuoWuDingYi.ts` | 错误类型枚举 |
| **错误处理** | `useCuoWu.tsx` | 错误状态Hook |
| **加载状态** | `JiaZaiZhuangTai.tsx` | 加载动画组件 |
| **空状态** | `KongZhuangTai.tsx` | 空数据占位 |
| **段落渲染** | `DuanLuoXuanRan.tsx` | 富文本段落渲染 |
| **进度提示** | `JinDuTiShi.tsx` | 进度指示器 |

#### Toast通知系统

| 组件 | 文件 | 用途 |
|------|------|------|
| **Toast容器** | `ToastRongQi.tsx` | Toast挂载容器 |
| **Toast提示** | `ToastTiShi.tsx` | 单条Toast组件 |
| **Toast工具** | `ToastGongJu.ts` | Toast调用方法 |
| **常量定义** | `ToastConstants.ts` | Toast配置常量 |
| **类型定义** | `ToastTypes.ts` | Toast类型接口 |

#### 工具函数

| 工具 | 文件 | 用途 |
|------|------|------|
| **API请求** | `apiRequest.ts` | 封装的fetch请求 |
| **错误翻译** | `errorTranslator.ts` | 错误码转中文提示 |
| **EPUB封面** | `epubFengMian.ts` | 封面图提取 |
| **EPUB解析** | `epubParser.ts` | EPUB文件解析 |
| **响应式** | `responsive.ts` | 断点判断工具 |

#### 响应式工具 (`utils/business/响应式工具/`)

```
响应式工具/
├── config/断点配置.ts       # Tailwind断点映射
├── creators/布局创建器.ts   # 响应式布局生成
├── creators/组件样式创建器.ts # 响应式样式生成
├── utils/核心工具.ts        # 媒体查询匹配
└── types.ts                # 类型定义
```

---

## 常见问题速查 (L4)

### 运行时错误

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `Cannot access 'xxx' before initialization` | Hook依赖顺序问题 | 检查useCallback/useMemo的依赖数组，确保被引用的变量在前面定义 |
| `Failed to fetch` | 后端未启动/CORS问题 | 检查后端端口、Vite代理配置、网络连接 |
| 白屏但无报错 | 组件渲染异常 | 检查异步数据加载状态、条件渲染逻辑 |
| 划线不显示 | 样式/CFI问题 | 检查epub.js版本兼容性、CFI格式正确性 |
| 翻页卡顿 | 重渲染过多 | 使用useCallback优化回调、React.memo优化组件 |

### 状态管理问题

| 问题 | 原因 | 方案 |
|------|------|------|
| 状态不更新 | 闭包陷阱 | 使用ref保存最新值或函数式更新 |
| localStorage不同步 | 异步写入 | 使用use-local-storage-state库 |
| Context频繁重渲染 | Consumer粒度太粗 | 拆分多个Context |

### 样式问题

| 问题 | 方案 |
|------|------|
| Tailwind类不生效 | 检查tailwind.config.js的content配置 |
| EPUB内样式冲突 | 使用CSS隔离或!important覆盖 |
| 响应式布局错乱 | 检查断点配置与实际设备匹配 |
| 暗色模式异常 | 检查CSS变量定义和Tailwind dark:前缀 |

---

## 开发规范速查

### 文件命名
- 组件：`PascalCase.tsx` (如 `EPUBReader.tsx`)
- Hook：`use camelCase.ts` (如 `useEPUBReaderHuoChuLi.ts`)
- 工具函数：`camelCase.ts` (如 `apiRequest.ts`)
- 类型文件：`camelCase.ts` (同目录下types文件夹)

### 代码风格
- 使用中文拼音命名变量和函数
- 注释必须使用中文
- 组件文件不超过300行
- 单个函数不超过30行
- 条件分支不超过8个

### 导入顺序
```typescript
// 1. React相关
import { useState, useEffect } from 'react'

// 2. 第三方库
import { SomeLib } from 'some-lib'

// 3. 项目内部类型
import type { ShuJi } from '@/infrastructure/types/book/book'

// 4. 项目内部组件
import { SomeComponent } from '@/shared/utils/common/KongZhuangTai'

// 5. 项目内部Hooks
import { useSomeHook } from './hooks/useSomeHook'

// 6. 样式文件
import './some.css'
```
