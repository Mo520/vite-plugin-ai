/**
 * 性能分析器
 */

import fs from "fs";
import path from "path";
import { gzipSync } from "zlib";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type {
  AnalysisResult,
  BundleInfo,
  PerformanceIssue,
  AnalyzerOptions,
} from "./types";
import { DependencyAnalyzer } from "./dependency-analyzer";
import { HistoryAnalyzer } from "./history-analyzer";
import { OptimizationExamples } from "./optimization-examples";

export class PerfAnalyzer {
  private llm: ChatOpenAI | null = null;
  private options: AnalyzerOptions;
  private depAnalyzer: DependencyAnalyzer;
  private historyAnalyzer: HistoryAnalyzer;
  private examplesGenerator: OptimizationExamples;

  constructor(options: AnalyzerOptions) {
    this.options = options;
    this.depAnalyzer = new DependencyAnalyzer();
    this.historyAnalyzer = new HistoryAnalyzer();
    this.examplesGenerator = new OptimizationExamples();

    if (options.apiKey) {
      this.llm = new ChatOpenAI({
        openAIApiKey: options.apiKey,
        configuration: { baseURL: options.apiUrl },
        modelName: options.model,
        temperature: 0.2,
        maxTokens: 4000,
      });
    }
  }

  /**
   * 分析构建产物
   */
  async analyze(): Promise<AnalysisResult> {
    const distDir = path.resolve(process.cwd(), "dist");

    if (!fs.existsSync(distDir)) {
      throw new Error("构建目录不存在，请先执行构建");
    }

    // 收集文件信息
    const bundles = this.collectBundles(distDir);

    // 计算统计信息
    const summary = this.calculateSummary(bundles);

    // 依赖分析
    console.log("📦 正在分析依赖...");
    const dependencies = this.depAnalyzer.analyzeDependencies(bundles);

    // 历史对比
    console.log("📊 正在对比历史记录...");
    const comparison = this.historyAnalyzer.compare(
      bundles,
      summary.totalSize,
      summary.fileCount
    );

    // 检测性能问题
    const issues = this.detectIssues(bundles, summary, dependencies);

    // 生成基础建议
    const suggestions = this.generateSuggestions(issues);

    // 生成优化示例
    console.log("💡 正在生成优化示例...");
    const optimizationExamples = this.examplesGenerator.generate(
      issues,
      dependencies.duplicates
    );

    // AI 分析（如果配置了 API Key）
    let aiAnalysis: string | undefined;
    if (this.llm) {
      console.log("🤖 正在使用 AI 分析性能...\n");
      aiAnalysis = await this.performAIAnalysis(
        bundles,
        summary,
        issues,
        dependencies,
        comparison
      );
    }

    return {
      timestamp: new Date().toLocaleString("zh-CN"),
      summary,
      dependencies,
      comparison,
      issues,
      suggestions,
      optimizationExamples,
      aiAnalysis,
    };
  }

  /**
   * 收集构建产物信息
   */
  private collectBundles(dir: string, baseDir: string = dir): BundleInfo[] {
    const bundles: BundleInfo[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        bundles.push(...this.collectBundles(filePath, baseDir));
      } else {
        const content = fs.readFileSync(filePath);
        const gzipSize = gzipSync(content).length;
        const relativePath = path.relative(baseDir, filePath);

        bundles.push({
          name: file,
          size: stat.size,
          gzipSize,
          type: this.getFileType(file),
          path: relativePath,
        });
      }
    }

    return bundles;
  }

  /**
   * 获取文件类型
   */
  private getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const typeMap: Record<string, string> = {
      ".js": "javascript",
      ".mjs": "javascript",
      ".css": "stylesheet",
      ".html": "html",
      ".png": "image",
      ".jpg": "image",
      ".jpeg": "image",
      ".gif": "image",
      ".svg": "image",
      ".webp": "image",
      ".woff": "font",
      ".woff2": "font",
      ".ttf": "font",
      ".eot": "font",
      ".json": "data",
      ".map": "sourcemap",
    };
    return typeMap[ext] || "other";
  }

  /**
   * 计算统计信息
   */
  private calculateSummary(bundles: BundleInfo[]) {
    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    const totalGzipSize = bundles.reduce(
      (sum, b) => sum + (b.gzipSize || 0),
      0
    );

    // 按大小排序，取前 10
    const largestFiles = [...bundles]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // 按类型分组
    const byType: Record<string, { count: number; size: number }> = {};
    bundles.forEach((bundle) => {
      if (!byType[bundle.type]) {
        byType[bundle.type] = { count: 0, size: 0 };
      }
      byType[bundle.type].count++;
      byType[bundle.type].size += bundle.size;
    });

    return {
      totalSize,
      totalGzipSize,
      fileCount: bundles.length,
      largestFiles,
      byType,
    };
  }

  /**
   * 检测性能问题
   */
  private detectIssues(
    bundles: BundleInfo[],
    summary: any,
    dependencies?: {
      total: number;
      duplicates: DependencyInfo[];
      largest: DependencyInfo[];
    }
  ): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const { threshold } = this.options;

    // 检查总大小
    const totalSizeMB = summary.totalSize / 1024 / 1024;
    if (threshold.totalSize && totalSizeMB > threshold.totalSize) {
      issues.push({
        type: "size",
        severity: "high",
        title: "构建产物总大小过大",
        description: `总大小 ${totalSizeMB.toFixed(2)}MB 超过阈值 ${
          threshold.totalSize
        }MB`,
        suggestion: "考虑代码分割、tree-shaking、压缩等优化手段",
      });
    }

    // 检查单个文件大小
    const largeBundles = bundles.filter(
      (b) => b.size / 1024 > (threshold.bundleSize || 500)
    );
    if (largeBundles.length > 0) {
      issues.push({
        type: "size",
        severity: "medium",
        title: "存在过大的单个文件",
        description: `发现 ${largeBundles.length} 个文件超过 ${threshold.bundleSize}KB`,
        files: largeBundles.map(
          (b) => `${b.name} (${(b.size / 1024).toFixed(2)}KB)`
        ),
        suggestion: "考虑拆分大文件，使用动态导入或代码分割",
      });
    }

    // 检查 chunk 数量
    const jsFiles = bundles.filter((b) => b.type === "javascript");
    if (threshold.chunkCount && jsFiles.length > threshold.chunkCount) {
      issues.push({
        type: "count",
        severity: "low",
        title: "JavaScript 文件数量过多",
        description: `共有 ${jsFiles.length} 个 JS 文件，超过阈值 ${threshold.chunkCount}`,
        suggestion: "过多的文件会增加 HTTP 请求数，考虑合并小文件",
      });
    }

    // 检查未压缩的图片
    const images = bundles.filter((b) => b.type === "image");
    const largeImages = images.filter((img) => img.size > 100 * 1024); // 100KB
    if (largeImages.length > 0) {
      issues.push({
        type: "optimization",
        severity: "medium",
        title: "存在未优化的图片",
        description: `发现 ${largeImages.length} 个大于 100KB 的图片`,
        files: largeImages.map(
          (img) => `${img.name} (${(img.size / 1024).toFixed(2)}KB)`
        ),
        suggestion: "使用图片压缩工具，或转换为 WebP 格式",
      });
    }

    // 检查 sourcemap
    const sourcemaps = bundles.filter((b) => b.type === "sourcemap");
    if (sourcemaps.length > 0) {
      const totalMapSize = sourcemaps.reduce((sum, m) => sum + m.size, 0);
      issues.push({
        type: "optimization",
        severity: "low",
        title: "生产环境包含 sourcemap",
        description: `Sourcemap 文件占用 ${(totalMapSize / 1024 / 1024).toFixed(
          2
        )}MB`,
        suggestion: "生产环境建议禁用 sourcemap 或使用外部 sourcemap",
      });
    }

    // 检查重复依赖
    if (dependencies && dependencies.duplicates.length > 0) {
      const topDuplicates = dependencies.duplicates.slice(0, 3);
      issues.push({
        type: "dependency",
        severity: "medium",
        title: "检测到重复打包的依赖",
        description: `发现 ${dependencies.duplicates.length} 个依赖被多次打包`,
        files: topDuplicates.map(
          (d) =>
            `${d.name} (被 ${d.usedBy.length} 个文件使用, ${(
              d.size / 1024
            ).toFixed(2)}KB)`
        ),
        suggestion: "将重复依赖提取到公共 chunk 中",
      });
    }

    return issues;
  }

  /**
   * 生成基础建议
   */
  private generateSuggestions(issues: PerformanceIssue[]): string[] {
    const suggestions: string[] = [];

    if (issues.some((i) => i.type === "size")) {
      suggestions.push("启用 gzip/brotli 压缩");
      suggestions.push("配置 Vite 的 build.rollupOptions 进行代码分割");
      suggestions.push("使用 vite-plugin-compression 插件");
    }

    if (issues.some((i) => i.type === "optimization")) {
      suggestions.push("使用 vite-plugin-imagemin 优化图片");
      suggestions.push("配置 CSS 压缩和 tree-shaking");
    }

    if (issues.length === 0) {
      suggestions.push("构建产物已经很优秀，继续保持！");
    }

    return suggestions;
  }

  /**
   * AI 性能分析
   */
  private async performAIAnalysis(
    bundles: BundleInfo[],
    summary: any,
    issues: PerformanceIssue[],
    dependencies?: {
      total: number;
      duplicates: DependencyInfo[];
      largest: DependencyInfo[];
    },
    comparison?: any
  ): Promise<string> {
    const systemPrompt = new SystemMessage(
      "你是一个专业的前端性能优化专家，精通 Vite、Webpack 等构建工具。请分析构建产物并提供专业的优化建议。"
    );

    const bundlesSummary = summary.largestFiles
      .slice(0, 5)
      .map((b: BundleInfo) => `- ${b.name}: ${(b.size / 1024).toFixed(2)}KB`)
      .join("\n");

    const typesSummary = Object.entries(summary.byType)
      .map(
        ([type, info]: [string, any]) =>
          `- ${type}: ${info.count} 个文件, ${(info.size / 1024).toFixed(2)}KB`
      )
      .join("\n");

    const issuesSummary = issues
      .map(
        (issue) => `- [${issue.severity}] ${issue.title}: ${issue.description}`
      )
      .join("\n");

    // 依赖分析摘要
    let dependencySummary = "";
    if (dependencies) {
      dependencySummary = `
## 依赖分析
- 总依赖数: ${dependencies.total}
- 重复依赖: ${dependencies.duplicates.length} 个
- 最大依赖: ${dependencies.largest
        .slice(0, 3)
        .map((d) => `${d.name} (${(d.size / 1024).toFixed(2)}KB)`)
        .join(", ")}`;
    }

    // 历史对比摘要
    let comparisonSummary = "";
    if (comparison) {
      const sizeChange =
        comparison.totalSize.trend === "increased" ? "增加" : "减少";
      comparisonSummary = `
## 历史对比
- 总大小${sizeChange}: ${Math.abs(comparison.totalSize.diffPercent).toFixed(2)}%
- 文件数量变化: ${comparison.fileCount.diff > 0 ? "+" : ""}${
        comparison.fileCount.diff
      }
- 新增文件: ${comparison.newFiles.length} 个
- 删除文件: ${comparison.removedFiles.length} 个`;
    }

    const userPrompt = new HumanMessage(`
请分析以下构建产物信息：

## 总体统计
- 总大小: ${(summary.totalSize / 1024 / 1024).toFixed(2)}MB
- Gzip 后: ${(summary.totalGzipSize / 1024 / 1024).toFixed(2)}MB
- 文件数量: ${summary.fileCount}

## 最大的文件
${bundlesSummary}

## 按类型分组
${typesSummary}
${dependencySummary}
${comparisonSummary}

## 检测到的问题
${issuesSummary || "无明显问题"}

请提供：
1. 性能评估（3-5 句话）
2. 具体优化建议（3-5 条，每条简洁明了）
3. 优先级排序

请用简洁专业的语言回答，不要过于冗长。
`);

    const response = await this.llm!.invoke([systemPrompt, userPrompt]);
    return response.content.toString();
  }
}
