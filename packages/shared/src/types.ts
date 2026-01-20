/**
 * 共享类型定义
 */

export interface ErrorInfo {
  type: string;
  message: string;
  stack?: string;
  file?: string;
  code?: string;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  lines: number;
}

export interface PluginConfig {
  enabled?: boolean;
  debug?: boolean;
}
