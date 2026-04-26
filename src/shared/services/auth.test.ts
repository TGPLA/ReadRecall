/**
 * @vitest-environment node
 * 前端认证服务测试 - 验证 authService 是否正确调用后端 API
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetch as undiciFetch } from 'undici'

const 测试服务器地址 = 'https://linyubo.top'

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

vi.stubGlobal('fetch', vi.fn())

describe('前端认证服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('用户名格式验证', () => {
    it('用户名必须是纯数字', async () => {
      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('abc123', 'password123')

      expect(error).not.toBeNull()
      expect(error?.message).toContain('用户名必须是4-16位数字')
      expect(user).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('用户名首位不能为0', async () => {
      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('0123', 'password123')

      expect(error).not.toBeNull()
      expect(error?.message).toContain('首位不能为0')
      expect(user).toBeNull()
    })

    it('用户名长度不能少于4位', async () => {
      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('123', 'password123')

      expect(error).not.toBeNull()
      expect(user).toBeNull()
    })

    it('用户名长度不能超过16位', async () => {
      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('12345678901234567', 'password123')

      expect(error).not.toBeNull()
      expect(user).toBeNull()
    })

    it('正确的用户名格式应该通过验证', async () => {
      const 模拟响应 = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: '用户10001' },
            token: 'mock-jwt-token'
          }
        }),
        json: async () => ({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: '用户10001' },
            token: 'mock-jwt-token'
          }
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('10001', 'password123')

      expect(error).toBeNull()
      expect(user).not.toBeNull()
      expect(user?.username).toBe('10001')
    })
  })

  describe('登录功能', () => {
    it('未注册用户登录应该失败', async () => {
      const 模拟响应 = {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          success: false,
          error: '用户名或密码错误'
        }),
        json: async () => ({
          success: false,
          error: '用户名或密码错误'
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('999999999', 'password123')

      expect(error).not.toBeNull()
      expect(error?.message).toBe('用户名或密码错误')
      expect(user).toBeNull()
    })

    it('错误密码登录应该失败', async () => {
      const 模拟响应 = {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          success: false,
          error: '用户名或密码错误'
        }),
        json: async () => ({
          success: false,
          error: '用户名或密码错误'
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('10001', 'wrongpassword')

      expect(error).not.toBeNull()
      expect(error?.message).toBe('用户名或密码错误')
      expect(user).toBeNull()
    })

    it('正确账号密码登录应该成功', async () => {
      const 模拟响应 = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: '测试用户' },
            token: 'mock-jwt-token'
          }
        }),
        json: async () => ({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: '测试用户' },
            token: 'mock-jwt-token'
          }
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('10001', 'correctpassword')

      expect(error).toBeNull()
      expect(user).not.toBeNull()
      expect(user?.username).toBe('10001')
      expect(user?.nickname).toBe('测试用户')
    })

    it('密码少于6位应该直接拒绝', async () => {
      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signIn('10001', '12345')

      expect(error).not.toBeNull()
      expect(error?.message).toBe('密码至少需要 6 个字符')
      expect(user).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('注册功能', () => {
    it('用户名已被注册应该失败', async () => {
      const 模拟响应 = {
        ok: false,
        status: 400,
        text: async () => JSON.stringify({
          success: false,
          error: '该用户名已被注册'
        }),
        json: async () => ({
          success: false,
          error: '该用户名已被注册'
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signUp('10001', 'password123')

      expect(error).not.toBeNull()
      expect(error?.message).toBe('该用户名已被注册')
      expect(user).toBeNull()
    })

    it('注册成功应该返回用户信息和 token', async () => {
      const 模拟响应 = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: {
            user: { id: 2, username: '10002', nickname: '用户10002' },
            token: 'mock-jwt-token-new'
          }
        }),
        json: async () => ({
          success: true,
          data: {
            user: { id: 2, username: '10002', nickname: '用户10002' },
            token: 'mock-jwt-token-new'
          }
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      const { user, error } = await authService.signUp('10002', 'password123')

      expect(error).toBeNull()
      expect(user).not.toBeNull()
      expect(user?.username).toBe('10002')
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('10002')
        })
      )
    })
  })

  describe('Token 管理', () => {
    it('登录成功后应该保存 token', async () => {
      const 模拟响应 = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: 'test' },
            token: 'saved-jwt-token'
          }
        }),
        json: async () => ({
          success: true,
          data: {
            user: { id: 1, username: '10001', nickname: 'test' },
            token: 'saved-jwt-token'
          }
        })
      }

      vi.mocked(fetch).mockResolvedValueOnce(模拟响应 as Response)

      const { authService } = await import('@shared/services/auth')
      await authService.signIn('10001', 'password123')

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'saved-jwt-token')
    })

    it('getToken 应该返回当前 token', async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'current_user') return JSON.stringify({ id: '1', username: '10001' })
        if (key === 'auth_token') return 'existing-token'
        return null
      })

      const { authService } = await import('@shared/services/auth')
      const token = authService.getToken()

      expect(token).toBe('existing-token')
    })
  })
})

describe('端到端登录流程测试（真实 API）', () => {
  it('未注册用户无法登录真实后端', async () => {
    const response = await undiciFetch(`${测试服务器地址}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: '999999999', 
        password: 'password123' 
      })
    })

    const data = await response.json() as { success: boolean; error: string }

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toContain('用户名或密码错误')
  })
})
