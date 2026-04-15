# 后端 API 集成测试规范

## 测试层级

```
本地测试（基础层）→ 部署 → 远程测试（验证层）→ 上线
```

| 测试类型 | 后端服务 | 数据库 | 测试时机 |
|----------|---------|--------|----------|
| **本地测试** | localhost:8080 | 远程（SSH 隧道） | 开发时 |
| **远程测试** | linyubo.top | 远程 | 部署后 |

---

## 本地测试

```bash
# 1. 数据库连接
ssh -f -N -L 3307:127.0.0.1:3306 root@<服务器IP>

# 2. 启动后端
cd backend && go run main.go

# 3. 运行测试
npx vitest run src/shared/services/local.integration.test.ts --reporter=verbose
```

**失败处理**：代码逻辑问题 → 修复后重测

---

## 远程测试

**前置条件**：本地测试通过 + 代码已部署

```bash
npx vitest run src/shared/services/database.integration.test.ts --reporter=verbose
```

**失败处理**：部署/环境问题 → 检查流程或回滚

---

## 项目初始化检查（一次性）

- **后端认证**：JWT（已确认）
- **类型映射**：Go string 零值为 ""，MySQL JSON 不接受空字符串，可空字段用 `*string`

---

## 测试编写规范

| 项目 | 规范 |
|------|------|
| **文件命名** | 本地：`local.integration.test.ts`，远程：`database.integration.test.ts` |
| **数据格式** | snake_case 字段名，JSON 字段传 `null` 而非 `""` |
| **数据清理** | 必须包含，先删子表再删父表 |
| **测试描述** | 明确对象，如 `describe('后端认证 API')` |

---

## Bug 修复优先级

1. 数据库表结构
2. 后端代码
3. 前端/测试代码

---

## 测试模板

```typescript
/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { fetch } from 'undici'

const 服务器地址 = 'http://localhost:8080'

describe('后端 API 集成测试', () => {
  it('健康检查', async () => {
    const 响应 = await fetch(`${服务器地址}/health`)
    expect(响应.status).toBe(200)
  })

  // 清理数据（必须）
  describe('清理', () => {
    it('删除测试数据', async () => { /* ... */ })
  })
})
```
