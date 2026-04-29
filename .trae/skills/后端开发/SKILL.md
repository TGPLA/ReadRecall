---
name: "后端开发"
description: "阅读回响后端开发的技能入口。涵盖Go/Gin API、数据库操作、智谱AI服务、认证授权等。当任务涉及后端接口、数据库CRUD、AI服务集成时加载此技能。"
---

# 后端开发技能入口 (L2)

## 技术栈概览

- **语言**: Go (1.21+)
- **Web框架**: Gin
- **数据库**: MySQL (通过database/sql)
- **AI服务**: 智谱AI (zhipuai SDK)
- **认证**: JWT Token
- **部署**: Docker + Nginx反向代理

---

## 项目结构导航

```
backend/
├── main.go                 # 入口文件，路由注册
├── config/config.go        # 配置加载（.env）
├── controllers/            # 控制器层（处理HTTP请求）
├── middleware/             # 中间件（认证、日志）
├── models/                # 数据模型层（SQL操作）
├── services/              # 业务服务层（智谱AI调用）
├── routes/routes.go       # 路由定义
└── uploads/epubs/         # EPUB文件存储目录
```

---

## 模块导航 (L3 → L4)

### 01-控制器层 (controllers/)

#### 认证模块

| 文件 | 路由 | 功能 |
|------|------|------|
| `auth_login.ts` | `POST /api/auth/login` | 用户登录 |
| `auth_password.ts` | `POST /api/auth/password` | 修改密码 |
| `auth_types.ts` | - | 认证相关类型定义 |

**关键逻辑：**
- 登录成功返回JWT Token
- 密码使用bcrypt加密存储
- Token有效期7天

#### 书籍管理模块

| 文件 | 路由 | 功能 |
|------|------|------|
| `book_query.ts` | `GET /api/books` | 查询书籍列表 |
| `book_mutation.ts` | `POST /api/books` | 创建书籍 |
| `book_epub_upload.ts` | `POST /api/books/epub/upload` | 上传EPUB文件 |
| `book_epub_download.ts` | `GET /api/books/:id/epub` | 下载EPUB文件 |
| `book_types.ts` | - | 书籍类型定义 |

**EPUB上传流程：**
```
1. 前端发送multipart/form-data
2. 后端接收文件 → 保存到uploads/epubs/
3. 解析EPUB元数据（标题、作者、封面）
4. 返回书籍ID和元数据
5. 前端使用书籍ID进行后续操作
```

#### 划线标注模块

| 文件 | 路由 | 功能 |
|------|------|------|
| `annotation_query.ts` | `GET /api/annotations` | 查询划线列表 |
| `annotation_mutation.ts` | `POST /api/annotations` | 创建划线 |
| `annotation_types.ts` | - | 划线类型定义 |

**划线数据结构：**
```go
type Annotation struct {
    ID          string  `json:"id"`
    BookID      string  `json:"book_id"`
    CFI         string  `json:"cfi"`          // EPUB位置标识
    Content     string  `json:"content"`      // 划线文本
    Color       string  `json:"color"`        // 颜色
    Note        string  `json:"note"`         // 笔记内容
    CreatedAt   string  `json:"created_at"`
}
```

#### 练习题目模块

| 文件 | 路由 | 功能 |
|------|------|------|
| `question_query.ts` | `GET /api/questions` | 查询题目 |
| `question_mutation.ts` | `POST /api/questions` | 创建题目 |
| `question_practice.ts` | `POST /api/questions/practice` | 提交练习答案 |
| `question_types.ts` | - | 题目类型定义 |

#### AI评价模块

| 文件 | 路由 | 功能 |
|------|------|------|
| `ai_evaluate.ts` | `POST /api/ai/evaluate` | AI评分 |
| `ai_selection.ts` | `POST /api/ai/selection` | AI选择题生成 |
| `ai_types.ts` | - | AI响应类型 |

#### 其他控制器

| 文件 | 路由 | 功能 |
|------|------|------|
| `concepts.ts` | `GET/POST /api/concepts` | 概念解释CRUD |
| `paraphrase.ts` | `POST /api/paraphrase` | 复述功能 |
| `evaluate_concept.ts` | `POST /api/evaluate/concept` | 概念理解度评估 |
| `settings_handler.ts` | `GET/PUT /api/settings` | 用户设置 |
| `stats_handler.ts` | `GET /api/stats` | 统计数据 |

---

### 02-中间件层 (middleware/)

| 文件 | 功能 | 使用方式 |
|------|------|---------|
| `auth_middleware.ts` | JWT认证校验 | 保护需要登录的接口 |
| `logging_middleware.ts` | 请求日志记录 | 全局启用 |

**认证流程：**
```
前端请求 → 携带Authorization: Bearer <token>
         → auth_middleware验证token有效性
         → 通过：继续执行handler
         → 失败：返回401 Unauthorized
```

---

### 03-数据模型层 (models/)

| 文件 | 对应表 | 主要操作 |
|------|--------|---------|
| `models_user.ts` | users | 用户CRUD |
| `models_content.ts` | books, chapters, paragraphs | 内容管理 |
| `models_annotation.ts` | annotations | 划线CRUD |
| `models_prompt.ts` | prompts | 提示词模板管理 |
| `models_settings.ts` | settings | 用户设置 |
| `utils.ts` | - | 数据库连接、通用工具 |

**数据库配置：**
- 主机：从环境变量读取（默认localhost:3306）
- 数据库名：readrecall
- 连接池：最大10个连接

**重要：Go与MySQL类型映射**
- Go `string` 零值为 `""`，MySQL JSON不接受空字符串
- 可空字段使用 `*string`（指针类型）
- 时间格式：`"2006-01-02 15:04:05"`

---

### 04-AI服务层 (services/)

| 文件 | 功能 | 智谱API |
|------|------|---------|
| `zhipu_core.ts` | 核心客户端初始化 | - |
| `zhipu_types.ts` | 类型定义 | - |
| `zhipu_error.ts` | 错误处理 | - |
| `zhipu_selection.ts` | 选择题生成 | chat/completions |
| `zhipu_evaluate.ts` | 练习评分 | chat/completions |
| `zhipu_evaluate_concept.ts` | 概念评估 | chat/completions |
| `zhipu_evaluate_intention.ts` | 意图识别 | chat/completions |
| `zhipu_concepts.ts` | 概念解释 | chat/completions |

**API调用模式：**
```go
// 1. 构建系统提示词（从数据库读取或硬编码）
// 2. 构建用户消息（用户输入+上下文）
// 3. 调用智谱API
// 4. 解析JSON响应
// 5. 返回结构化结果
```

**错误处理策略：**
- 网络超时：重试2次
- API限流：等待后重试
- 返回格式异常：返回默认值并记录日志

---

### 05-路由层 (routes/routes.go)

```go
// 公开路由（无需认证）
r.POST("/api/auth/login", authLogin)
r.POST("/api/auth/password", authPassword)

// 受保护路由（需要认证）
auth := r.Group("/api")
auth.Use(middleware.AuthMiddleware())
{
    // 书籍
    auth.GET("/books", getBooks)
    auth.POST("/books", createBook)
    auth.POST("/books/epub/upload", uploadEPUB)

    // 划线
    auth.GET("/annotations", getAnnotations)
    auth.POST("/annotations", createAnnotation)

    // 练习
    auth.GET("/questions", getQuestions)
    auth.POST("/questions", createQuestion)

    // AI
    auth.POST("/ai/evaluate", aiEvaluate)
    auth.POST("/ai/selection", aiSelection)
}
```

---

## 常见问题速查 (L4)

### 数据库问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 连接失败 | MySQL未启动或端口错误 | 检查3306端口，确认MySQL服务运行 |
| 字段过长 | VARCHAR长度不够 | 使用TEXT类型或增加长度 |
| 中文乱码 | 字符集不是utf8mb4 | 建表时指定CHARSET=utf8mb4 |
| 时间字段为空 | Go time.Time零值问题 | 使用*time.Time指针类型 |
| JSON解析失败 | MySQL JSON字段不接受空字符串 | 传null而非"" |

### API问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 401 Unauthorized | Token过期或无效 | 前端重新登录获取新Token |
| 400 Bad Request | 请求体格式错误 | 检查Content-Type和JSON格式 |
| 500 Internal Server Error | 后端逻辑错误 | 查看后端日志定位具体错误 |
| CORS错误 | 前后端端口不同 | 配置Gin的CORS中间件 |
| 文件上传失败 | 文件过大或格式不对 | 检查文件大小限制（默认10MB） |

### 智谱AI问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| API Key无效 | Key过期或错误 | 检查.env中的ZHIPU_API_KEY |
| 请求超时 | 网络问题或模型响应慢 | 增加超时时间或使用流式接口 |
| 返回非JSON | 模型输出格式不稳定 | 增强prompt约束，添加JSON示例 |
| 频率限制 | 调用量超限 | 实现请求队列或升级套餐 |

---

## 开发规范速查

### 代码风格
- 包名：小写单词（如`controller`, `model`）
- 导出函数/变量：大驼峰（如`GetBooks`, `BookService`）
- 私有函数/变量：小驼峰（如`parseBook`, `dbConn`）
- 错误处理：必须处理每个error，不能忽略

### 请求/响应格式

**统一响应结构：**
```json
{
    "code": 0,
    "message": "success",
    "data": { ... }
}
```

**错误响应：**
```json
{
    "code": 1001,
    "message": "参数错误",
    "data": null
}
```

### SQL编写规范
- 使用参数化查询防止SQL注入
- 复杂查询先在MySQL客户端验证
- 表名使用复数形式（如`users`, `books`）
- 字段名使用snake_case（如`created_at`, `book_id`）

### 环境变量 (.env)

```env
# 必须配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=readrecall

# 智谱AI
ZHIPU_API_KEY=your_api_key

# JWT
JWT_SECRET=your_jwt_secret_key
```

---

## 本地开发快速启动

```bash
# 1. 启动MySQL（如果未启动）
net start mysql

# 2. 初始化数据库（首次）
cd backend
mysql -u root -p < 数据库初始化.sql

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际配置

# 4. 启动后端
go run main.go

# 5. 测试健康检查
curl http://localhost:8080/health
```
