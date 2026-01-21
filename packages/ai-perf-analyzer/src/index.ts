/**
 * AI 性能分析插件
 *
 * 功能：
 * - 分析构建产物大小
 * - 检测性能问题
 * - 提供优化建议
 */

import type { Plugin } from "vite";
import pc from "picocolors";
import { PerfAnalyzer } from "./analyzer";
import { PerfReporter } from "./reporter";
import type { AnalysisResult } from "./types";

export interface PerfAnalyzerOptions {
  // AI 配置
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // 分析配置
  enabled?: boolean;
  threshold?: {
    bundleSize?: number; // 单个文件大小阈值 (KB)
    totalSize?: number; // 总大小阈值 (MB)
    chunkCount?: number; // chunk 数量阈值
  };
  // 输出配置
  output?: {
    console?: boolean;
    html?: boolean;
    json?: boolean;
  };
}

export function vitePluginAIPerfAnalyzer(
  options: PerfAnalyzerOptions = {},
): Plugin {
  const {
    apiKey = process.env.OPENAI_API_KEY || "",
    apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1",
    model = process.env.OPENAI_MODEL || "gpt-4",
    temperature = 0.2,
    maxTokens = 4000,
    enabled = true,
    threshold = {
      bundleSize: 500, // 500KB
      totalSize: 5, // 5MB
      chunkCount: 20,
    },
    output = {
      console: true,
      html: true,
      json: false,
    },
  } = options;

  const analyzer = new PerfAnalyzer({
    apiKey,
    apiUrl,
    model,
    threshold,
    temperature,
    maxTokens,
  });
  const reporter = new PerfReporter();

  let analysisResult: AnalysisResult | null = null;

  return {
    name: "vite-plugin-ai-perf-analyzer",
    enforce: "post",

    configResolved(config) {
      if (!enabled) return;

      console.log(pc.cyan("\n⚡ AI 性能分析插件已启动..."));
      console.log(`📊 分析阈值:`);
      console.log(`   单文件: ${pc.yellow(threshold.bundleSize + "KB")}`);
      console.log(`   总大小: ${pc.yellow(threshold.totalSize + "MB")}`);
      console.log(
        `   Chunk数: ${pc.yellow((threshold.chunkCount ?? 10).toString())}`,
      );
      console.log(`🔑 API Key: ${apiKey ? "已配置" : "未配置"}\n`);
    },

    async closeBundle() {
      if (!enabled) return;

      console.log("\n⚡ 正在分析构建产物...\n");

      try {
        // 分析构建产物
        analysisResult = await analyzer.analyze();

        // 生成报告
        await reporter.generate(analysisResult, output);

        // 控制台输出
        if (output.console) {
          reporter.printConsole(analysisResult);
        }
      } catch (error: any) {
        console.error("❌ 性能分析失败:", error.message);
      }
    },
  };
}

// 默认导出
export default vitePluginAIPerfAnalyzer;
