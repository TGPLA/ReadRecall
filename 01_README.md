# 阅读回响

> 一款基于 AI 的智能阅读辅助应用，帮助用户从书籍中生成题目、巩固知识。

## 项目简介

阅读回响是一款帮助用户深度阅读和知识巩固的应用。通过 AI 技术，自动从书籍章节中生成题目，支持多种练习模式，帮助用户更好地理解和记忆书籍内容。

## 功能特性

- 📚 **书籍管理**：添加、编辑、删除书籍，支持封面和描述
- 📖 **EPUB 导入**：导入 EPUB 电子书，自动解析书名、作者、章节，支持选择性导入
- 📖 **章节管理**：书籍章节的增删改查，支持排序
- 📃 **段落管理**：划词创建段落，选中章节内容即可创建段落；支持查看详情、编辑、删除段落
- 📝 **提示词模板管理**：系统预设模板（全局共享）+ 用户自定义模板，支持名词解释、意图理解、生活应用三种题型
- 🤖 **AI 出题**：基于章节或段落内容，使用提示词模板自动生成三类题目
- 🎯 **名词解释学习**：AI 提取重要概念→用户学习专业解释→用自己的话复述→AI 点评表达清晰度（循环）
- 🎯 **意图理解学习**：用户阅读段落→用自己的话讲述作者意图→AI 评价对/错/不到位
- 🎯 **练习模式**：显示段落 + 问题 + 作答，AI 评价答案
- 📊 **学习统计**：追踪掌握进度，记录练习次数
- 📝 **练习记录**：保存用户答题历史和 AI 评价
- 🌙 **深色模式**：支持浅色/深色主题切换
- 🤖 **内置智谱 AI**：开箱即用，无需配置 API Key

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite |
| 样式方案 | 内联样式 |
| AI 服务 | 智谱 AI (GLM-4) |
| 后端 | Go (Gin 框架) |
| 数据库 | MySQL 8.0（远程服务器，SSH 隧道连接） |
| 测试框架 | Vitest（单元/集成）+ Playwright（E2E） |
| 反向代理 | Nginx (OpenResty) |

---

## 项目架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                       │
│                         https://linyubo.top                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Nginx (OpenResty)                                   │
│                     容器: 1Panel-openresty-EPWv                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  /              → 静态文件 (/opt/1panel/www/sites/readrecall/index/)    │    │
│  │  /api/*         → 反向代理到 Go 后端 (http://127.0.0.1:8080/api/*)  │    │
│  │  /health        → 健康检查                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│      前端静态文件              │   │           Go 后端 API                  │
│  /opt/1panel/www/sites/       │   │      容器: readrecall-backend          │
│    readrecall/index/          │   │           端口: 8080                   │
│  - index.html                 │   │                                        │
│  - assets/*.js                │   │  路由:                                 │
│  - assets/*.css               │   │  /api/auth/*      - 认证                │
│                               │   │  /api/books       - 书籍 CRUD           │
│  技术栈: React + TypeScript   │   │  /api/chapters    - 章节 CRUD           │
│          + Vite               │   │  /api/paragraphs  - 段落 CRUD           │
│                               │   │  /api/prompts     - 提示词模板 CRUD     │
│                               │   │  /api/questions   - 题目 CRUD           │
│                               │   │  /api/settings    - 用户设置            │
│                               │   │  /api/ai/*        - AI 功能             │
└───────────────────────────────┘   └───────────────────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────────────────┐
                                    │           MySQL 数据库                 │
                                    │      容器: 1Panel-mysql-OHb5           │
                                    │                                        │
                                    │  数据库: reading_reflection            │
                                    │  用户: readrecall                      │
                                    │                                        │
                                    │  表:                                   │
                                    │  - books         (书籍)                │
                                    │  - chapters      (章节)                │
                                    │  - questions     (题目)                │
                                    │  - users         (用户)                │
                                    │  - user_settings (用户设置)            │
                                    │  - practice_records (练习记录)         │
                                    └───────────────────────────────────────┘
```

### 服务器 Docker 容器

| 容器名 | 镜像 | 用途 | 端口 |
|--------|------|------|------|
| `readrecall-backend` | readrecall-backend:latest | Go 后端 API | 8080 |
| `readrecall` | 1panel/node:24.10.0 | 前端静态文件服务 | - |
| `1Panel-openresty-EPWv` | OpenResty | Nginx 反向代理 | 80, 443 |
| `1Panel-mysql-OHb5` | mysql:8.4.8 | MySQL 数据库 | 3306 |
| `phpmyadmin-public` | phpmyadmin:5.2.3 | 数据库管理界面 | - |

### 前端目录结构（模块化架构）

```
src/
├── core/                           # 🧠 头部 - 核心控制
│   ├── App.tsx                     # 应用入口组件
│   ├── main.tsx                    # React 渲染入口
│   └── index.css                   # 全局样式
│
├── infrastructure/                 # 💪 躯干 - 支撑系统
│   ├── hooks/                      # 全局状态
│   │   ├── AppProvider.tsx         # 状态提供者
│   │   ├── context.ts              # Context 定义
│   │   └── useAppContext.ts        # Context Hook
│   ├── store/                      # 本地存储
│   │   └── index.ts                # LocalStorage 封装
│   └── types/                      # 类型定义（按领域拆分）
│       ├── base/enums.ts           # 枚举类型
│       ├── book/                   # 书籍相关类型
│       ├── config/                 # 配置类型
│       ├── other/                  # 其他类型
│       ├── user/                   # 用户类型
│       └── index.ts                # 类型导出
│
├── features/                       # 🖐️ 手脚 - 功能模块
│   ├── books/                      # 书籍系统
│   │   └── components/
│   │       ├── BookShelf.tsx       # 书架页面
│   │       ├── BookDetail.tsx      # 书籍详情
│   │       ├── GuidedTour.tsx      # 新手引导
│   │       ├── QuestionManagementModal.tsx
│   │       ├── ChapterManager.tsx  # 章节管理
│   │       ├── ChapterDetail.tsx   # 章节详情（含划词创建段落）
│   │       ├── ChapterView.tsx     # 章节视图
│   │       ├── EPUBDaoRuTanChuang.tsx # EPUB 导入弹窗
│   ├── practice/                   # 练习系统
│   │   └── components/
│   │       ├── PracticeMode.tsx    # 练习模式
│   │       ├── DaTiZhu.tsx         # 答题主组件
│   │       ├── AIPingJia.tsx       # AI评价组件
│   │       └── CuoTiBen.tsx        # 错题本组件
│   └── user/                       # 用户系统
│       └── components/
│           ├── AuthPage.tsx        # 登录页面
│           ├── SettingsPage.tsx    # 设置页面
│           └── 提示词管理/          # 提示词管理组件
│               ├── TiShiCiMoBan.tsx    # 提示词模板
│               ├── TiShiCiBianJi.tsx   # 提示词编辑
│               ├── ShouCiYinDao.tsx    # 首次引导
│               ├── YinDaoJieShao.tsx   # 引导介绍
│               └── YinDaoXuanZe.tsx    # 引导选择
│
└── shared/                         # 🩺 医疗包 - 公共服务
    ├── api/                        # API 接口
    │   └── zhipu.ts                # 智谱 AI API
    ├── services/                   # 服务层
    │   ├── database.ts             # 数据库服务
    │   ├── auth.ts                 # 认证服务
    │   ├── chapterService.ts       # 章节服务
    │   ├── aiService.ts            # AI 服务
    │   ├── practiceRecordService.ts # 练习记录服务
    │   └── userCloudStorage.ts     # 云存储服务
    └── utils/                      # 工具函数
        ├── responsive.ts           # 响应式工具
        ├── epubParser.ts           # EPUB 解析工具（浏览器端）
        ├── common/                 # 通用工具
        └── business/               # 业务工具
```

### 数据流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户操作                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          React 组件                                           │
│                    (BookShelf, AuthPage, etc.)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AppProvider (全局状态)                               │
│                                                                              │
│  状态: books, questions, settings, isAuthenticated                          │
│  方法: addBook, updateBook, deleteBook, addQuestion, ...                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│      databaseService          │   │           authService                  │
│  (src/services/database.ts)   │   │  (src/services/auth.ts)               │
│                               │   │                                        │
│  - getAllBooks()              │   │  - signIn()                            │
│  - createBook()               │   │  - signUp()                            │
│  - updateBook()               │   │  - signOut()                           │
│  - getQuestionsByBook()       │   │  - onAuthChange()                      │
│  - ...                        │   │                                        │
└───────────────────────────────┘   └───────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Go 后端 API                                         │
│                      (backend/main.go)                                      │
│                                                                              │
│  API 路由 → 控制器 → 服务层 → MySQL                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 数据库表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `books` | 书籍 | id, user_id, title, author, cover_url, question_count, mastered_count |
| `chapters` | 章节 | id, user_id, book_id, title, content, order_index, paragraph_count |
| `paragraphs` | 段落 | id, user_id, chapter_id, content, order_index, question_count |
| `prompt_templates` | 提示词模板 | id, user_id（NULL=系统模板）, name, question_type, content, is_default, is_system |
| `questions` | 题目 | id, user_id, book_id, chapter_id, paragraph_id, question, answer, question_type, category, options, correct_index, explanation, difficulty, mastery_level |
| `users` | 用户 | id, username, password_hash, created_at |
| `user_settings` | 用户设置 | user_id, dark_mode, zhipu_api_key, zhipu_model |
| `practice_records` | 练习记录 | id, user_id, question_id, practiced_at, result |

### 外部服务

| 服务 | 用途 | 调用方式 |
|------|------|----------|
| 智谱 AI | 概念提取、答案评价、意图分析 | 后端调用 API |

### 部署配置

| 配置项 | 值 |
|--------|-----|
| 服务器 IP | 114.132.47.245 |
| 域名 | linyubo.top |
| SSL | Let's Encrypt |
| 前端目录 | /opt/1panel/www/sites/readrecall/index/ |
| 后端端口 | 8080 |
| 数据库 | reading_reflection |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- Go >= 1.21（后端开发）
- MySQL 8.0（数据库）

### 安装依赖

```bash
npm install
```

### 配置环境变量

#### 前端配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# 前端环境变量
VITE_API_BASE_URL=http://localhost:8080/api

# 智谱 AI API Key（可选，用于前端直接调用）
VITE_ZHIPU_API_KEY=your_zhipu_api_key
```

#### 后端配置

复制后端环境变量示例文件：

```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env` 文件，填入数据库和服务配置：

```env
# 服务配置
SERVER_PORT=8080

# 数据库配置（本地开发使用 SSH 隧道）
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reading_reflection

# JWT 配置
JWT_SECRET=your-jwt-secret-key

# 智谱 AI 配置
ZHIPU_API_KEY=your_zhipu_api_key
ZHIPU_MODEL=glm-4-flash
```

### 启动后端服务

#### 1. 建立 SSH 隧道（本地开发连接远程数据库）

```bash
ssh -f -N -L 3307:127.0.0.1:3306 root@linyubo.top
```

#### 2. 启动后端

**推荐方式（使用编译好的可执行文件）：**
```bash
cd backend
.\readrecall-backend.exe
```

**开发方式（使用 go run）：**
```bash
cd backend
go run main.go
```

后端服务将在 http://localhost:8080 启动

**配置加载说明：**
后端会按以下优先级查找 `.env` 配置文件：
1. `{可执行文件目录}/.env`
2. `{可执行文件目录}/backend/.env`
3. `backend/.env`
4. `.env`

启动时会显示加载的配置文件路径和数据库连接信息。

### 启动前端开发服务器

```bash
npm run dev
```

前端开发服务器将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 运行单元/集成测试
npm run test:run

# 运行 E2E 测试
npm run test:e2e

# 运行 E2E 测试（UI 模式）
npm run test:e2e:ui
```

## 代码规范

- 单文件最大 100 行，超过需拆分
- 文件名使用中文拼音（如 `ShuJiTiShiCiPeiZhi.ts`）
- 函数名、变量名使用中文（如 `huoQuPeiZhi`）
- 所有代码文件包含中文头部注释

## 部署

项目部署在腾讯云轻量服务器，使用 1Panel 管理面板进行部署和管理。

详细部署流程请参阅 [07_部署指南.md](./07_部署指南.md)

### 快速部署

```powershell
# 构建
npm run build

# 上传到服务器
scp -r dist/* root@114.132.47.245:/opt/1panel/www/sites/readrecall/index/
```

访问地址：https://linyubo.top

## 许可证

MIT License
