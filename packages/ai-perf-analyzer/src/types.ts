/**
 * 性能分析类型定义
 */

export interface BundleInfo {
  name: string;
  size: number; // 字节
  gzipSize?: number; // gzip 后大小
  type: string; // js, css, html, image, font, etc.
  path: string;
  imports?: string[]; // 导入的模块
}

export interface DependencyInfo {
  name: string;
  version?: string;
  size: number;
  usedBy: string[]; // 被哪些文件使用
  isDuplicate: boolean; // 是否重复打包
}

export interface ComparisonResult {
  current: number;
  previous: number;
  diff: number;
  diffPercent: number;
  trend: "increased" | "decreased" | "unchanged";
}

export interface HistoryComparison {
  totalSize: ComparisonResult;
  fileCount: ComparisonResult;
  largestFileChanges: Array<{
    name: string;
    current: number;
    previous: number;
    diff: number;
  }>;
  newFiles: string[];
  removedFiles: string[];
}

export interface OptimizationExample {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string; // 预期效果
  difficulty: string; // 实施难度
  code: {
    language: string;
    content: string;
  };
  relatedFiles?: string[];
}

export interface AnalysisResult {
  timestamp: string;
  summary: {
    totalSize: number; // 总大小 (字节)
    totalGzipSize: number; // gzip 后总大小
    fileCount: number; // 文件数量
    largestFiles: BundleInfo[];
    byType: Record<
      string,
      {
        count: number;
        size: number;
      }
    >;
  };
  dependencies?: {
    total: number;
    duplicates: DependencyInfo[];
    largest: DependencyInfo[];
    unused?: string[];
  };
  comparison?: HistoryComparison;
  issues: PerformanceIssue[];
  suggestions: string[];
  optimizationExamples?: OptimizationExample[];
  aiAnalysis?: string;
}

export interface PerformanceIssue {
  type: "size" | "count" | "structure" | "optimization" | "dependency";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  files?: string[];
  suggestion?: string;
}

export interface AnalyzerOptions {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  threshold: {
    bundleSize?: number;
    totalSize?: number;
    chunkCount?: number;
  };
}

export interface HistoryRecord {
  timestamp: string;
  totalSize: number;
  fileCount: number;
  files: Array<{
    name: string;
    size: number;
  }>;
}
