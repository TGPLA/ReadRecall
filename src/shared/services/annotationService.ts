// @审计已完成
// 标注服务 - 划线/标注相关 API 调用

import { authService } from './auth';

const API_BASE = '/api';

export interface DatabaseError {
  message: string;
}

export interface HuaXianXinXi {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: 'yellow' | 'green' | 'blue' | 'pink';
  leiXing: 'underline' | 'marker';
  beiZhu: string;
  createdAt: number;
}

interface RawAnnotation {
  id: string;
  user_id: string;
  book_id: string;
  text: string;
  cfi_range: string;
  yan_se: string;
  lei_xing: string;
  bei_zhu: string;
  created_at: string;
  updated_at: string;
}

function zhuanHuanBiaoZhu(raw: RawAnnotation): HuaXianXinXi {
  return {
    id: raw.id,
    text: raw.text,
    cfiRange: raw.cfi_range,
    yanSe: raw.yan_se as any,
    leiXing: raw.lei_xing as any,
    beiZhu: raw.bei_zhu || '',
    createdAt: new Date(raw.created_at).getTime(),
  };
}

class AnnotationService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private checkAuth(): void {
    if (!this.userId) {
      throw new Error('用户未登录');
    }
  }

  private async handle401(response: Response): Promise<boolean> {
    if (response.status === 401) {
      await authService.signOut();
      window.location.reload();
      return true;
    }
    return false;
  }

  async getAnnotationsByBook(bookId: string): Promise<{ annotations: HuaXianXinXi[]; error: DatabaseError | null }> {
    try {
      console.log('annotationService.getAnnotationsByBook 被调用, bookId:', bookId);
      console.log('annotationService userId:', this.userId);
      this.checkAuth();
      const token = authService.getToken();
      console.log('annotationService token:', token ? '已获取' : '未获取');
      const url = `${API_BASE}/annotations/book/${bookId}`;
      console.log('请求 URL:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      console.log('响应状态:', response.status, response.statusText);
      
      if (await this.handle401(response)) {
        return { annotations: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('错误响应数据:', errorData);
        return { annotations: [], error: { message: errorData.error || '获取标注失败' } };
      }
      
      const data = await response.json();
      console.log('成功响应数据:', data);
      const annotations = (data.data || []).map(zhuanHuanBiaoZhu);
      return { annotations, error: null };
    } catch (error) {
      console.error('annotationService.getAnnotationsByBook 异常:', error);
      return { annotations: [], error: { message: error instanceof Error ? error.message : '获取标注失败' } };
    }
  }

  async createAnnotation(annotation: { 
    bookId: string; 
    text: string; 
    cfiRange: string; 
    yanSe: string; 
    leiXing: string; 
    beiZhu?: string 
  }): Promise<{ annotation: HuaXianXinXi | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/annotations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          book_id: annotation.bookId,
          text: annotation.text,
          cfi_range: annotation.cfiRange,
          yan_se: annotation.yanSe,
          lei_xing: annotation.leiXing,
          bei_zhu: annotation.beiZhu || '',
        }),
      });
      
      if (await this.handle401(response)) {
        return { annotation: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { annotation: null, error: { message: errorData.error || '创建标注失败' } };
      }
      
      const data = await response.json();
      return { annotation: zhuanHuanBiaoZhu(data.data || data), error: null };
    } catch (error) {
      return { annotation: null, error: { message: error instanceof Error ? error.message : '创建标注失败' } };
    }
  }

  async updateAnnotation(id: string, updates: Partial<{ 
    yanSe: string; 
    leiXing: string; 
    beiZhu: string 
  }>): Promise<{ annotation: HuaXianXinXi | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/annotations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          yan_se: updates.yanSe,
          lei_xing: updates.leiXing,
          bei_zhu: updates.beiZhu,
        }),
      });
      
      if (await this.handle401(response)) {
        return { annotation: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { annotation: null, error: { message: errorData.error || '更新标注失败' } };
      }
      
      const data = await response.json();
      return { annotation: zhuanHuanBiaoZhu(data.data), error: null };
    } catch (error) {
      return { annotation: null, error: { message: error instanceof Error ? error.message : '更新标注失败' } };
    }
  }

  async deleteAnnotation(id: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/annotations/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (await this.handle401(response)) {
        return { error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: { message: errorData.error || '删除标注失败' } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : '删除标注失败' } };
    }
  }
}

export const annotationService = new AnnotationService();
