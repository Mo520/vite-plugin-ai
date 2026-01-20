/**
 * AI Mock Generator - 数据存储
 */

import fs from 'fs';
import path from 'path';
import type { MockDataStore, HttpMethod } from './types';

export class MockStorage {
  private storageDir: string;
  private cache: Map<string, MockDataStore>;
  private persist: boolean;

  constructor(options: { dir?: string; persist?: boolean } = {}) {
    this.storageDir = options.dir || 'mock-data';
    this.persist = options.persist !== false;
    this.cache = new Map();

    // 确保存储目录存在
    if (this.persist && !fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    // 加载已有数据
    this.load();
  }

  /**
   * 生成存储 key
   */
  private getKey(endpoint: string, method: HttpMethod): string {
    return `${method}:${endpoint}`;
  }

  /**
   * 生成文件名
   */
  private getFileName(endpoint: string, method: HttpMethod): string {
    const sanitized = endpoint
      .replace(/^\//, '')
      .replace(/\//g, '_')
      .replace(/:/g, '_');
    return `${method}_${sanitized}.json`;
  }

  /**
   * 获取数据
   */
  get(endpoint: string, method: HttpMethod = 'GET'): any {
    const key = this.getKey(endpoint, method);
    const store = this.cache.get(key);
    return store?.data;
  }

  /**
   * 设置数据
   */
  set(
    endpoint: string,
    method: HttpMethod,
    data: any,
    metadata?: Partial<MockDataStore['metadata']>
  ): void {
    const key = this.getKey(endpoint, method);

    const store: MockDataStore = {
      endpoint,
      method,
      data,
      metadata: {
        count: Array.isArray(data) ? data.length : 1,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        type: typeof data,
        ...metadata,
      },
    };

    this.cache.set(key, store);

    // 持久化
    if (this.persist) {
      this.save(endpoint, method, store);
    }
  }

  /**
   * 删除数据
   */
  delete(endpoint: string, method: HttpMethod = 'GET'): void {
    const key = this.getKey(endpoint, method);
    this.cache.delete(key);

    // 删除文件
    if (this.persist) {
      const fileName = this.getFileName(endpoint, method);
      const filePath = path.join(this.storageDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.cache.clear();

    // 清空目录
    if (this.persist && fs.existsSync(this.storageDir)) {
      const files = fs.readdirSync(this.storageDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.storageDir, file));
      }
    }
  }

  /**
   * 获取所有端点
   */
  getAll(): MockDataStore[] {
    return Array.from(this.cache.values());
  }

  /**
   * 保存到文件
   */
  private save(
    endpoint: string,
    method: HttpMethod,
    store: MockDataStore
  ): void {
    const fileName = this.getFileName(endpoint, method);
    const filePath = path.join(this.storageDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  }

  /**
   * 从文件加载
   */
  private load(): void {
    if (!this.persist || !fs.existsSync(this.storageDir)) {
      return;
    }

    const files = fs.readdirSync(this.storageDir);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        const filePath = path.join(this.storageDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const store: MockDataStore = JSON.parse(content);

        const key = this.getKey(store.endpoint, store.method);
        this.cache.set(key, store);
      } catch (error) {
        console.warn(`Failed to load mock data from ${file}:`, error);
      }
    }
  }

  /**
   * 导出所有数据
   */
  export(outputPath: string): void {
    const allData = this.getAll();
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');
  }

  /**
   * 导入数据
   */
  import(inputPath: string): void {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const allData: MockDataStore[] = JSON.parse(content);

    for (const store of allData) {
      const key = this.getKey(store.endpoint, store.method);
      this.cache.set(key, store);

      if (this.persist) {
        this.save(store.endpoint, store.method, store);
      }
    }
  }
}
