/**
 * @vitest-environment node
 * 本地后端 API 集成测试 - 测试本地后端服务
 * 
 * 运行前请确保：
 * 1. MySQL 数据库已启动
 * 2. 后端服务已启动（go run main.go 或 ./readrecall.exe）
 * 3. 数据库表结构已创建
 */
import { describe, it, expect } from 'vitest'
import { fetch } from 'undici'

const 本地服务器地址 = 'http://114.132.47.245:8080'
const 测试用户名 = `${Math.floor(Math.random() * 900000000) + 100000000}`
const 测试密码 = 'test123456'

let token = ''
let 测试用户ID = ''
const 创建的书籍ID列表: string[] = []

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function API请求<T>(端点: string, 选项?: RequestInit): Promise<{ 数据: T | null; 错误: string | null }> {
  try {
    const 响应 = await fetch(`${本地服务器地址}/api${端点}`, {
      ...选项,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...选项?.headers,
      },
    })

    if (!响应.ok) {
      const 错误数据 = await 响应.json().catch(() => ({})) as ApiResponse<never>
      return { 数据: null, 错误: 错误数据.error || `请求失败：${响应.status}` }
    }

    if (响应.status === 204) {
      return { 数据: null, 错误: null }
    }

    const 响应数据 = await 响应.json() as ApiResponse<T>
    return { 数据: 响应数据.data || 响应数据 as T, 错误: null }
  } catch (错误) {
    return { 数据: null, 错误: 错误 instanceof Error ? 错误.message : '网络错误' }
  }
}

describe('本地后端 API 集成测试', () => {
  describe('后端健康检查', () => {
    it('后端服务应该正常运行', async () => {
      const 响应 = await fetch(`${本地服务器地址}/health`)
      expect(响应.status).toBe(200)
      const 数据 = await 响应.json() as { status: string }
      expect(数据.status).toBe('ok')
    })
  })

  describe('后端认证 API', () => {
    it('注册：应该成功注册新用户', async () => {
      const 响应 = await fetch(`${本地服务器地址}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 测试用户名, password: 测试密码 }),
      })

      expect(响应.status).toBe(200)
      const 数据 = await 响应.json() as ApiResponse<{ user: { id: string }; token: string }>
      expect(数据.success).toBe(true)
      expect(数据.data?.token).toBeDefined()
      expect(数据.data?.user.id).toBeDefined()

      token = 数据.data!.token
      测试用户ID = 数据.data!.user.id
    })

    it('注册：用户名格式错误应该返回错误', async () => {
      const 响应 = await fetch(`${本地服务器地址}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '0123', password: 'test123' }),
      })

      expect(响应.status).toBe(400)
      const 数据 = await 响应.json() as ApiResponse<never>
      expect(数据.success).toBe(false)
      expect(数据.error).toContain('用户名')
    })

    it('登录：未注册用户应该返回错误', async () => {
      const 响应 = await fetch(`${本地服务器地址}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '999999999', password: 'test123' }),
      })

      expect(响应.status).toBe(401)
      const 数据 = await 响应.json() as ApiResponse<never>
      expect(数据.success).toBe(false)
      expect(数据.error).toContain('用户名或密码错误')
    })

    it('登录：错误密码应该返回错误', async () => {
      const 响应 = await fetch(`${本地服务器地址}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 测试用户名, password: 'wrongpassword' }),
      })

      expect(响应.status).toBe(401)
      const 数据 = await 响应.json() as ApiResponse<never>
      expect(数据.success).toBe(false)
      expect(数据.error).toContain('用户名或密码错误')
    })

    it('登录：正确密码应该登录成功', async () => {
      const 响应 = await fetch(`${本地服务器地址}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 测试用户名, password: 测试密码 }),
      })

      expect(响应.status).toBe(200)
      const 数据 = await 响应.json() as ApiResponse<{ token: string }>
      expect(数据.success).toBe(true)
      expect(数据.data?.token).toBeDefined()
    })
  })

  describe('书籍管理 API', () => {
    it('创建书籍：应该成功创建', async () => {
      const 测试书籍 = {
        user_id: 测试用户ID,
        title: '测试书籍_' + Date.now(),
        author: '测试作者',
        chapter_count: 0,
        question_count: 0,
        mastered_count: 0
      }

      const { 数据, 错误 } = await API请求<{ id: string; title: string }>('/books', {
        method: 'POST',
        body: JSON.stringify(测试书籍),
      })

      expect(错误).toBeNull()
      expect(数据?.id).toBeDefined()
      expect(数据?.title).toBe(测试书籍.title)

      if (数据?.id) {
        创建的书籍ID列表.push(数据.id)
      }
    })

    it('获取书籍列表：应该包含创建的书籍', async () => {
      const { 数据, 错误 } = await API请求<{ id: string }[]>(`/books?userId=${测试用户ID}`)

      expect(错误).toBeNull()
      expect(数据).toBeInstanceOf(Array)
      expect(数据?.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('清理测试数据', () => {
    it('删除测试书籍', async () => {
      for (const 书籍ID of 创建的书籍ID列表) {
        const { 错误 } = await API请求(`/books/${书籍ID}`, { method: 'DELETE' })
        expect(错误).toBeNull()
      }
    })

    it('验证数据已清理', async () => {
      const { 数据 } = await API请求<{ id: string }[]>(`/books?userId=${测试用户ID}`)
      const 剩余书籍 = 数据?.filter(b => 创建的书籍ID列表.includes(b.id)) || []
      expect(剩余书籍.length).toBe(0)
    })
  })
})