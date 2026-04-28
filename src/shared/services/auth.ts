/**
 * 认证服务 - 本地认证 + MySQL 云端存储
 * 使用数字用户名作为用户标识，数据通过 Go 后端存储到 MySQL
 */

export interface AuthUser {
  id: string;
  username: string;
  nickname?: string;
}

export interface AuthError {
  message: string;
}

const API_BASE = '/api';

class AuthService {
  private currentUser: AuthUser | null = null;
  private token: string | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const storedUser = localStorage.getItem('current_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
      } catch (error) {
        console.error('恢复用户信息失败:', error);
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_token');
      }
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  getToken(): string | null {
    return this.token;
  }

  onAuthChange(callback: (user: AuthUser | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  private isValidUsername(username: string): boolean {
    return /^[1-9][0-9]{3,15}$/.test(username);
  }

  async signIn(username: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // @关键代码-不要随意删除 [登录前清理旧状态]
      // 原因：避免旧 token 干扰新登录请求，防止认证冲突
      this.signOut();
      
      if (password.length < 6) {
        return { 
          user: null, 
          error: { message: '密码至少需要 6 个字符' } 
        };
      }

      if (!this.isValidUsername(username)) {
        return { 
          user: null, 
          error: { message: '用户名必须是4-16位数字，且首位不能为0' } 
        };
      }

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.delete('Authorization');

      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ _username, password }),
      });

      const text = await response.text();
      if (!text) {
        return { 
          user: null, 
          error: { message: '服务器无响应，请稍后重试' } 
        };
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return { 
          user: null, 
          error: { message: '响应解析失败，请稍后重试' } 
        };
      }

      if (!response.ok || !data.success) {
        return { 
          user: null, 
          error: { message: data.error || '登录失败' } 
        };
      }

      const user: AuthUser = {
        id: String(data.data.user.id),
        username: data.data.user._username,
        nickname: data.data.user.nickname,
      };

      this.currentUser = user;
      this.token = data.data.token;
      localStorage.setItem('current_user', JSON.stringify(user));
      localStorage.setItem('auth_token', data.data.token);
      
      this.notifyListeners();
      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: error instanceof Error ? error.message : '登录失败' } 
      };
    }
  }

  async signUp(username: string, password: string, nickname?: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      this.signOut();
      
      if (password.length < 6) {
        return { 
          user: null, 
          error: { message: '密码至少需要 6 个字符' } 
        };
      }

      if (!this.isValidUsername(username)) {
        return { 
          user: null, 
          error: { message: '用户名必须是4-16位数字，且首位不能为0' } 
        };
      }

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.delete('Authorization');

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ _username, password, nickname }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { 
          user: null, 
          error: { message: data.error || '注册失败' } 
        };
      }

      const user: AuthUser = {
        id: String(data.data.user.id),
        username: data.data.user._username,
        nickname: data.data.user.nickname,
      };

      this.currentUser = user;
      this.token = data.data.token;
      localStorage.setItem('current_user', JSON.stringify(user));
      localStorage.setItem('auth_token', data.data.token);
      
      this.notifyListeners();
      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: error instanceof Error ? error.message : '注册失败' } 
      };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this.notifyListeners();
    
    return { error: null };
  }

  async resetPassword(_username: string): Promise<{ error: AuthError | null }> {
    return { error: { message: '暂不支持密码重置功能' } };
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      if (!this.token) {
        return { error: { message: '未登录' } };
      }

      const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { error: { message: data.error || '更新密码失败' } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : '更新密码失败' } };
    }
  }
}

export const authService = new AuthService();
