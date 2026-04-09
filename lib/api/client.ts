import { API_BASE_URL } from './config';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  code: number;
  
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP Error: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 0) {
    throw new ApiError(result.code, result.message);
  }

  return result.data;
}

// 便捷方法
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),
    
  post: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    
  put: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    
  patch: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};

// SWR fetcher
export const swrFetcher = <T>(url: string) => api.get<T>(url);
