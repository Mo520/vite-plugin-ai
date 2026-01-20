/**
 * AI Mock Generator - Mock 服务器
 */

import type { ViteDevServer } from 'vite';
import type {
  EndpointConfig,
  HttpMethod,
  MockGeneratorOptions,
} from './types';
import { MockStorage } from './storage';
import {
  delay,
  matchPathParams,
  parseQueryParams,
  applyFilters,
  applySorting,
  applyPagination,
  formatResponse,
} from './utils';

export class MockServer {
  private storage: MockStorage;
  private endpoints: EndpointConfig[];
  private options: MockGeneratorOptions;

  constructor(storage: MockStorage, options: MockGeneratorOptions) {
    this.storage = storage;
    this.endpoints = options.endpoints || [];
    this.options = options;
  }

  /**
   * 配置服务器中间件
   */
  configureServer(server: ViteDevServer): void {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url || '';
      const method = req.method as HttpMethod;

      // 检查是否匹配 Mock 端点
      const endpoint = this.matchEndpoint(url, method);

      if (!endpoint) {
        return next();
      }

      try {
        // 解析请求参数
        const params = this.parseRequest(req, url);

        // 获取 Mock 数据
        const data = await this.getMockData(endpoint, params);

        // 模拟延迟
        if (this.options.server?.delay) {
          await delay(this.options.server.delay);
        }

        // 设置响应头
        res.setHeader('Content-Type', 'application/json');
        if (this.options.server?.cors) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
        }

        // 返回响应
        res.statusCode = 200;
        res.end(JSON.stringify(data));

        // 日志
        if (this.options.output?.logs) {
          console.log(`[Mock] ${method} ${url} → ${data ? 'OK' : 'Empty'}`);
        }
      } catch (error: any) {
        console.error(`[Mock] Error handling ${method} ${url}:`, error);
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            code: 500,
            message: error.message,
          })
        );
      }
    });

    console.log('\n🎭 Mock 服务器已启动');
    console.log(`📍 已注册 ${this.endpoints.length} 个端点\n`);
  }

  /**
   * 匹配端点
   */
  private matchEndpoint(
    url: string,
    method: HttpMethod
  ): EndpointConfig | null {
    // 移除查询参数
    const path = url.split('?')[0];

    // 移除前缀
    const prefix = this.options.server?.prefix || '';
    const cleanPath = prefix ? path.replace(new RegExp(`^${prefix}`), '') : path;

    for (const endpoint of this.endpoints) {
      // 检查是否禁用
      if (endpoint.enabled === false) continue;

      // 检查方法
      if (endpoint.method !== method) continue;

      // 精确匹配
      if (endpoint.path === cleanPath) {
        return endpoint;
      }

      // 路径参数匹配
      if (matchPathParams(endpoint.path, cleanPath)) {
        return endpoint;
      }
    }

    return null;
  }

  /**
   * 解析请求
   */
  private parseRequest(req: any, url: string): any {
    const query = parseQueryParams(url);
    const path = url.split('?')[0];

    // 查找匹配的端点以提取路径参数
    const endpoint = this.matchEndpoint(path, req.method);
    const pathParams = endpoint
      ? matchPathParams(endpoint.path, path.split('?')[0])
      : null;

    return {
      query,
      params: pathParams || {},
      body: req.body,
      headers: req.headers,
    };
  }

  /**
   * 获取 Mock 数据
   */
  private async getMockData(
    endpoint: EndpointConfig,
    params: any
  ): Promise<any> {
    // 从存储获取数据
    let data = this.storage.get(endpoint.path, endpoint.method);

    if (!data) {
      console.warn(
        `[Mock] No data found for ${endpoint.method} ${endpoint.path}`
      );
      return formatResponse([], false, 'No mock data available');
    }

    // 如果是数组，应用过滤、排序、分页
    if (Array.isArray(data)) {
      // 过滤
      if (params.query.filter) {
        data = applyFilters(data, JSON.parse(params.query.filter));
      }

      // 排序
      if (params.query.sort) {
        data = applySorting(data, params.query.sort);
      }

      // 分页
      if (params.query.page || params.query.pageSize) {
        const page = parseInt(params.query.page) || 1;
        const pageSize = parseInt(params.query.pageSize) || 20;
        const result = applyPagination(data, page, pageSize);

        return formatResponse({
          list: result.data,
          pagination: result.pagination,
        });
      }
    }

    // 应用自定义处理
    if (endpoint.custom) {
      data = await endpoint.custom(data, params);
    }

    // 格式化响应
    return formatResponse(data);
  }

  /**
   * 添加端点
   */
  addEndpoint(endpoint: EndpointConfig): void {
    this.endpoints.push(endpoint);
  }

  /**
   * 移除端点
   */
  removeEndpoint(path: string, method: HttpMethod): void {
    this.endpoints = this.endpoints.filter(
      (e) => !(e.path === path && e.method === method)
    );
  }

  /**
   * 获取所有端点
   */
  getEndpoints(): EndpointConfig[] {
    return this.endpoints;
  }
}
