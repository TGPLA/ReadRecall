// @审计已完成
// API 请求客户端 - 统一的 HTTP 请求封装

import { translateError } from './errorTranslator';
import { authService } from '../../services/auth';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiRequestOptions {
  baseUrl: string;
  token?: string | null;
  onAuthExpired?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null;
  private onAuthExpired?: () => void;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: ApiRequestOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token || null;
    this.onAuthExpired = options.onAuthExpired;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(status: number): boolean {
    return status === 429 || status >= 500;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    const apiPrefix = this.baseUrl.includes('linyubo.top') ? '/api' : '';
    const url = `${this.baseUrl}${apiPrefix}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    const currentToken = this.token || authService.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      console.log('ApiClient 使用 token:', currentToken.substring(0, 20) + '...');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.token = null;
        this.onAuthExpired?.();
        return {
          success: false,
          error: '登录已过期，请重新登录',
        };
      }

      const contentType = response.headers.get('content-type');
      const responseText = await response.text();

      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: `服务器返回非 JSON 格式响应 (状态码: ${response.status})`,
        };
      }

      try {
        const data = JSON.parse(responseText);

        if (!response.ok) {
          const errorMsg = data.message || data.error || `请求失败：${response.status}`;

          if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
            await this.delay(this.retryDelay * (retryCount + 1));
            return this.request<T>(endpoint, options, retryCount + 1);
          }

          return {
            success: false,
            error: translateError(errorMsg),
          };
        }

        const extractedData = data.data;
        const finalData = Array.isArray(extractedData) 
          ? extractedData 
          : (extractedData?.questions ?? extractedData);
        
        return {
          success: true,
          data: finalData,
        };
      } catch (parseError) {
        return {
          success: false,
          error: `JSON 解析失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`,
        };
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      const errorMsg = error instanceof Error ? error.message : '网络请求失败';
      return {
        success: false,
        error: translateError(errorMsg),
      };
    }
  }
}

export async function zhipuApiRequest<T>(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<T> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`智谱 AI 调用失败: ${translateError(errorText)}`);
  }

  return await response.json();
}
