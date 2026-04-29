---
name: "测试调试"
description: "阅读回响项目的测试与调试技能入口。涵盖Vitest单元测试、Playwright E2E测试、常见Bug排查、控制台错误分析等。当遇到报错、需要编写测试、调试问题时加载此技能。"
---

# 测试调试技能入口 (L2)

## 测试体系概览

| 测试类型 | 工具 | 用途 | 文件位置 |
|---------|------|------|---------|
| **单元测试** | Vitest | 组件/Hook/工具函数逻辑验证 | `tests/*.spec.ts`, `src/**/*.test.ts` |
| **E2E测试** | Playwright | 完整用户流程验证 | `tests/e2e/*.spec.ts` |
| **集成测试** | Vitest + undici | 后端API集成测试 | `src/shared/services/*integration.test.ts` |

---

## 模块导航 (L3)

### 01-Vitest 单元测试

#### 项目配置 (`vitest.setup.ts`)

全局配置：
- jsdom 环境（模拟浏览器DOM）
- @testing-library/jest-dom 断言扩展

#### 运行命令

```bash
# 运行所有测试
npm run test:run

# 监听模式（开发时用）
npm test

# 运行特定测试文件
npx vitest run tests/books.spec.ts

# 覆盖率报告
npx vitest run --coverage
```

#### 现有测试文件

| 文件 | 测试内容 |
|------|---------|
| `tests/auth.spec.ts` | 认证功能测试 |
| `tests/books.spec.ts` | 书籍CRUD测试 |
| `tests/gaoliang.spec.ts` | 划线功能测试 |
| `tests/practice.spec.ts` | 练习系统测试 |
| `tests/test.spec.ts` | 通用测试 |
| `src/shared/services/database.test.ts` | 数据库操作测试 |
| `src/shared/services/auth.test.ts` | 认证服务测试 |
| `src/shared/services/criticalCode.test.ts` | 关键代码测试 |

#### 测试编写模板

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SomeComponent } from './SomeComponent'

describe('组件名称', () => {
  it('应该正确渲染', () => {
    render(<SomeComponent />)
    expect(screen.getByText('期望文本')).toBeInTheDocument()
  })

  it('应该处理用户交互', async () => {
    const { user } = setup(<SomeComponent />)
    await user.click(screen.getByRole('button'))
    expect(某元素).可见()
  })
})
```

---

### 02-Playwright E2E测试

#### 配置文件 (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173', // Vite开发服务器
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

#### 运行命令

```bash
# 运行所有E2E测试
npm run test:e2e

# UI模式（可视化调试）
npm run test:e2e:ui

# 运行特定测试
npx playwright test books.spec.ts

# 生成测试报告
npx playwright show-report
```

#### E2E测试场景示例

```typescript
import { test, expect } from '@playwright/test'

test.describe('书籍管理', () => {
  test('应该能添加新书籍', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="add-book-button"]')
    await page.fill('[data-testid="book-title-input"]', '测试书籍')
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('[data-testid="book-card"]')).toContainText('测试书籍')
  })

  test('EPUB导入完整流程', async ({ page }) => {
    // 上传文件 → 确认信息 → 查看书架
  })
})
```

---

### 03-后端集成测试

#### 本地测试 (`local.integration.test.ts`)

**前置条件：**
1. 启动MySQL（本地或通过SSH隧道）
2. 启动后端服务 `go run main.go`
3. 确认 `http://localhost:8080/health` 可访问

**运行命令：**
```bash
npx vitest run src/shared/services/local.integration.test.ts --reporter=verbose
```

**测试内容：**
- 用户注册/登录
- 书籍CRUD
- 划线创建/查询
- 题目生成/提交
- AI评价接口

**数据清理（必须包含）：**
```typescript
describe('清理测试数据', () => {
  it('删除所有测试数据', async () => {
    // 按顺序删除：子表 → 父表
    await fetch(`${地址}/test/cleanup`, { method: 'POST' })
  })
})
```

#### 远程测试 (`database.integration.test.ts`)

**前置条件：**
1. 本地测试全部通过
2. 代码已部署到生产环境

**运行命令：**
```bash
npx vitest run src/shared/services/database.integration.test.ts --reporter=verbose
```

**失败处理：**
- 代码逻辑问题 → 修复后重测
- 部署问题 → 检查部署流程

---

### 04-常见Bug排查 (L4)

#### 运行时错误

##### Cannot access before initialization

**症状：**
```
ReferenceError: Cannot access 'xxx' before initialization
```

**原因：**
- `useCallback`/`useMemo` 的依赖数组中引用了尚未定义的变量
- Hook之间的定义顺序问题

**解决方案：**
```typescript
// ❌ 错误：handleClick 引用了后面才定义的 value
const handleClick = useCallback(() => {
  console.log(value) // 报错！
}, [value])

const value = someExpensiveCalculation()

// ✅ 正确：先定义 value，再定义 handleClick
const value = someExpensiveCalculation()

const handleClick = useCallback(() => {
  console.log(value) // 正常
}, [value])
```

**排查步骤：**
1. 定位报错行号
2. 检查被引用变量的定义位置
3. 调整代码顺序或使用 ref 保存值

##### Failed to fetch

**症状：**
```
TypeError: Failed to fetch
```

**原因：**
- 后端服务未启动
- CORS配置错误
- 网络连接问题
- HTTPS/HTTP混用

**排查清单：**
```bash
# 1. 检查后端是否运行
curl http://localhost:8080/health

# 2. 检查Vite代理配置 (vite.config.ts)
# 确保 proxy 正确配置

# 3. 检查浏览器控制台Network标签
# 查看实际请求URL和响应状态码

# 4. 检查CORS头
# 响应中应包含 Access-Control-Allow-Origin
```

##### 白屏但无报错

**可能原因及排查：**

1. **异步组件未处理loading状态**
   ```tsx
   // ❌ 缺少loading判断
   const { data } = useQuery(...)
   return <div>{data.name}</div> // data为undefined时报错

   // ✅ 正确处理
   if (isLoading) return <JiaZaiZhuangTai />
   if (!data) return <KongZhuangTai />
   return <div>{data.name}</div>
   ```

2. **路由条件渲染问题**
   - 检查 `App.tsx` 中的路由逻辑
   - 确保每个页面都有对应的渲染分支

3. **CSS样式导致不可见**
   - 检查是否有 `display: none` 或 `opacity: 0`
   - 检查z-index层叠问题

**调试方法：**
```tsx
// 临时添加边界组件捕获错误
<ErrorBoundary fallback={<div>渲染出错</div>}>
  <App />
</ErrorBoundary>

// React DevTools检查组件树
// 查看哪个组件没有渲染或报错
```

#### 状态管理问题

##### useState 不更新

**症状：**调用 setState 后，组件没有重新渲染或拿到旧值

**原因：**闭包陷阱

```typescript
// ❌ 问题代码
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count) // 永远是初始值！
  }, 1000)
}, [])

// ✅ 解决方案1：使用函数式更新
setCount(prev => prev + 1)

// ✅ 解决方案2：使用ref保存最新值
const countRef = useRef(count)
countRef.current = count

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current) // 最新值
  }, 1000)
}, [])
```

##### Context 导致全树重渲染

**症状：**修改Context中任一状态，所有Consumer都重新渲染

**解决方案：**
```typescript
// ❌ 一个大Context包含所有状态
const AppContext = createContext({
  user: null,
  theme: 'dark',
  books: [], // books变化会导致所有消费者重渲染
})

// ✅ 拆分为多个细粒度Context
const UserContext = createContext(user)
const ThemeContext = createContext(theme)
const BooksContext = createContext(books)
```

#### EPUB阅读器特有问题

##### 划线不显示或位置偏移

**排查方向：**
1. **CFI格式是否正确**
   - CFI应以 `/6/...` 开头
   - 使用 `epubjs` 的 `getLocation()` 生成标准CFI

2. **epub.js 版本兼容性**
   - 当前项目使用的react-reader版本
   - 不同版本的CFI格式可能有差异

3. **CSS样式覆盖**
   - EPUB内部样式可能影响高亮显示
   - 检查自定义CSS的优先级

**调试代码：**
```typescript
// 在useHuaCiChuangJi中添加日志
console.log('创建划线:', { cfi, content, color })

// 在渲染时验证
useEffect(() => {
  if (rendition && annotations.length > 0) {
    console.log('渲染划线数量:', annotations.length)
    annotations.forEach(ann => {
      rendition.highlight(ann.cfi, {}, () => {}, 'hl', { fill: ann.color })
    })
  }
}, [rendition, annotations])
```

##### 翻页卡顿或闪烁

**优化策略：**
1. **减少不必要的重渲染**
   ```typescript
   // 使用React.memo包裹列表项
   const MemoizedBookCard = React.memo(BookCard)
   
   // 使用useCallback缓存回调
   const handleClick = useCallback(() => { ... }, [dep])
   ```

2. **虚拟滚动（长列表）**
   - 如果章节内容很长，考虑虚拟滚动
   - 库推荐：`react-window` 或 `react-virtualized`

3. **图片懒加载**
   - EPUB中的图片按需加载
   - 使用Intersection Observer实现

---

### 05-调试工具与技巧

#### 浏览器开发者工具

**Console面板：**
- 查看运行时错误和警告
- 使用 `console.table()` 打印表格数据
- 使用 `console.group()` 分组日志

**Network面板：**
- 检查API请求/响应
- 查看请求头、状态码、响应时间
- 过滤XHR/Fetch请求

**Elements面板：**
- 检查DOM结构
- 查看计算后的CSS样式
- 编辑样式实时预览

**React DevTools扩展：**
- 查看组件树和Props
- 分析组件重渲染原因
- 检查Context/Store状态

#### VS Code调试

**launch.json 配置：**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "启动Chrome调试",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/*"
      }
    }
  ]
}
```

**使用断点：**
- 在可疑代码行点击左侧边栏添加断点
- 条件断点：右键断点 → 编辑条件
- 日志断点：右键断点 → 编辑日志消息

#### 性能分析

**React Profiler：**
- 记录组件渲染时间
- 找出性能瓶颈组件
- 检查不必要的重渲染

**Lighthouse审计：**
```bash
npx lighthouse http://localhost:5173 --view
```

**关键指标：**
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.8s

---

## 调试流程规范

### 收到Bug报告时的标准流程

```
1. 复现问题
   ├── 明确操作步骤
   ├── 检查浏览器/系统版本
   └── 截图或录屏

2. 定位问题
   ├── 查看控制台错误
   ├── 检查Network请求
   └── 使用React DevTools追踪状态

3. 分析原因
   ├── 阅读相关源码
   ├── 检查最近的代码变更
   └── 回顾历史类似问题（复盘存档）

4. 修复验证
   ├── 编写修复代码
   ├── 添加回归测试
   ├── 本地验证修复效果
   └── 构建成功且无新错误

5. 文档更新
   ├── 更新相关文档
   ├── 记录到复盘存档（如果值得）
   └── 提交代码
```

### 连续3次修复失败的应对

⚠️ **触发条件**：同一问题尝试修复3次仍未解决

**必须执行：**
1. 停止尝试临时方案
2. 调用"失败复盘存档"技能
3. 生成复盘报告，记录：
   - 尝试过的方案及结果
   - 排除的可能原因
   - 当前的理解与困惑
   - 下一步建议
4. 将报告保存到 `archived_复盘存档/`
5. 寻求外部帮助或在社区提问
