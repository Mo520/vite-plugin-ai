/**
 * AI Mock Generator - 工具函数
 */

import type { HttpMethod, RequestParams } from './types';

/**
 * 延迟函数
 */
export function delay(ms: number | [number, number]): Promise<void> {
  const delayTime = Array.isArray(ms)
    ? Math.random() * (ms[1] - ms[0]) + ms[0]
    : ms;

  return new Promise((resolve) => setTimeout(resolve, delayTime));
}

/**
 * 匹配路径参数
 * @example
 * matchPathParams('/api/users/:id', '/api/users/123') // { id: '123' }
 */
export function matchPathParams(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // 路径参数
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      // 不匹配
      return null;
    }
  }

  return params;
}

/**
 * 解析查询参数
 */
export function parseQueryParams(url: string): Record<string, any> {
  const queryString = url.split('?')[1];
  if (!queryString) return {};

  const params: Record<string, any> = {};
  const pairs = queryString.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }

  return params;
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 应用过滤
 */
export function applyFilters(data: any[], filters: Record<string, any>): any[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 应用排序
 */
export function applySorting(
  data: any[],
  sort?: string | { field: string; order: 'asc' | 'desc' }
): any[] {
  if (!sort) return data;

  const sortConfig =
    typeof sort === 'string'
      ? { field: sort, order: 'asc' as const }
      : sort;

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * 应用分页
 */
export function applyPagination(
  data: any[],
  page: number = 1,
  pageSize: number = 20
): {
  data: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: data.slice(start, end),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * 格式化响应
 */
export function formatResponse(
  data: any,
  success: boolean = true,
  message?: string
) {
  return {
    code: success ? 200 : 500,
    data,
    message: message || (success ? 'Success' : 'Error'),
  };
}

/**
 * 生成随机种子
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

/**
 * 设置随机种子
 */
export function setSeed(seed: number): void {
  // 简单的伪随机数生成器
  let currentSeed = seed;
  Math.random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}
