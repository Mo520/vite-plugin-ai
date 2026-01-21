/**
 * AI Mock Generator - 类型定义
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type Locale = "zh-CN" | "en-US";

export type Quality = "fast" | "balanced" | "high";

/**
 * 插件配置选项
 */
export interface MockGeneratorOptions {
  // AI 配置
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;

  // 功能开关
  enabled?: boolean;
  autoGenerate?: boolean;

  // 数据源配置
  sources?: {
    types?: string[];
    openapi?: string;
    jsdoc?: boolean;
  };

  // 端点配置
  endpoints?: EndpointConfig[];

  // 生成配置
  generation?: {
    locale?: Locale;
    count?: number;
    seed?: number;
    quality?: Quality;
  };

  // 存储配置
  storage?: {
    dir?: string;
    format?: "json" | "js" | "ts";
    persist?: boolean;
    cache?: boolean;
  };

  // 服务器配置
  server?: {
    port?: number;
    prefix?: string;
    delay?: number | [number, number];
    cors?: boolean;
  };

  // 输出配置
  output?: {
    console?: boolean;
    ui?: boolean;
    logs?: boolean;
  };
}

/**
 * 端点配置
 */
export interface EndpointConfig {
  path: string;
  method: HttpMethod;
  response: string | TypeDefinition;
  request?: string | TypeDefinition;
  count?: number;
  template?: string;
  enabled?: boolean;
  custom?: CustomHandler;
  pagination?: PaginationConfig;
}

/**
 * 类型定义
 */
export interface TypeDefinition {
  name: string;
  properties: PropertyDefinition[];
  isArray?: boolean;
}

/**
 * 属性定义
 */
export interface PropertyDefinition {
  name: string;
  type: string;
  comment?: string;
  required?: boolean;
  constraints?: PropertyConstraints;
}

/**
 * 属性约束
 */
export interface PropertyConstraints {
  min?: number;
  max?: number;
  pattern?: string;
  unique?: boolean;
  enum?: string[];
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  pageSize: number;
  total: number;
}

/**
 * 自定义处理函数
 */
export type CustomHandler = (data: any, params?: any) => any | Promise<any>;

/**
 * 生成上下文
 */
export interface GenerationContext {
  locale: Locale;
  count: number;
  seed?: number;
  quality: Quality;
  type: TypeDefinition;
}

/**
 * Mock 数据存储
 */
export interface MockDataStore {
  endpoint: string;
  method: HttpMethod;
  data: any;
  metadata: {
    count: number;
    generatedAt: string;
    version: string;
    type: string;
  };
}

/**
 * 请求参数
 */
export interface RequestParams {
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}
