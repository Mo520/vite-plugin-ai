/**
 * AI Code Review Plugin
 *
 * 功能：
 * - 审查代码质量
 * - 检测安全问题
 * - 发现性能问题
 * - 提供改进建议
 */

import type { Plugin } from "vite";
import { CodeReviewer } from "./reviewer";
import { GitUtils } from "./git-utils";
import { Reporter } from "./reporter";

export interface CodeReviewOptions {
  // AI 配置
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;

  // 审查模式
  mode?: "changed" | "all" | "manual";
  files?: string[]; // manual 模式下指定的文件

  // 审查级别
  level?: "quick" | "standard" | "thorough";

  // 规则配置
  rules?: {
    security?: "error" | "warn" | "info" | "off";
    performance?: "error" | "warn" | "info" | "off";
    style?: "error" | "warn" | "info" | "off";
    bestPractice?: "error" | "warn" | "info" | "off";
  };

  // 文件过滤
  include?: string[];
  exclude?: string[];

  // 输出配置
  output?: {
    console?: boolean;
    html?: boolean;
    markdown?: boolean;
    json?: boolean;
    failOnError?: boolean;
  };

  // 性能优化
  cache?: boolean;
  batchSize?: number;
  maxConcurrent?: number;

  // 功能开关
  enabled?: boolean;
}

export function vitePluginAICodeReview(
  options: CodeReviewOptions = {},
): Plugin {
  const {
    apiKey = process.env.OPENAI_API_KEY || "",
    apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1",
    model = "gpt-4",
    temperature = 0.2,
    maxTokens = 4000,
    mode = "changed",
    files = [],
    level = "standard",
    rules = {
      security: "error",
      performance: "warn",
      style: "info",
      bestPractice: "info",
    },
    include = ["**/*.{ts,tsx,js,jsx,vue}"],
    exclude = ["**/node_modules/**", "**/dist/**", "**/*.test.{ts,js}"],
    output = {
      console: true,
      html: true,
      markdown: false,
      json: false,
      failOnError: false,
    },
    cache = true,
    batchSize = 5,
    maxConcurrent = 3,
    enabled = true,
  } = options;

  if (!enabled) {
    return {
      name: "vite-plugin-ai-code-review",
    };
  }

  const reviewer = new CodeReviewer({
    apiKey,
    apiUrl,
    model,
    temperature,
    maxTokens,
    level,
    rules,
    cache,
  });

  const gitUtils = new GitUtils();
  const reporter = new Reporter(output);

  let filesToReview: string[] = [];
  let allIssues: any[] = [];

  return {
    name: "vite-plugin-ai-code-review",
    enforce: "post",

    configResolved(config) {
      console.log("\n🔍 AI Code Review 已启动...");
      console.log(`📂 审查模式: ${mode}`);
      console.log(`📊 审查级别: ${level}`);
      console.log(`🔑 API Key: ${apiKey ? "已配置" : "未配置"}\n`);
    },

    async buildStart() {
      if (!apiKey) {
        console.warn("⚠️  未配置 API Key，跳过代码审查");
        return;
      }

      // 确定要审查的文件
      if (mode === "changed") {
        filesToReview = await gitUtils.getChangedFiles();
        console.log(`🔍 [Git] 检测到 ${filesToReview.length} 个变更文件`);
        filesToReview.forEach((f) => console.log(`   - ${f}`));
      } else if (mode === "manual") {
        filesToReview = files;
      } else {
        // mode === "all" 时在 transform 中处理
        filesToReview = [];
      }

      // 过滤文件
      filesToReview = filesToReview.filter((file) =>
        shouldReview(file, include, exclude),
      );

      if (mode !== "all" && filesToReview.length > 0) {
        console.log(`📝 过滤后需要审查 ${filesToReview.length} 个文件\n`);

        // 在 buildStart 时直接审查文件（因为 transform 可能不会被调用）
        for (const file of filesToReview) {
          try {
            const fs = await import("fs");
            const path = await import("path");
            const fullPath = path.resolve(process.cwd(), file);

            if (fs.existsSync(fullPath)) {
              const code = fs.readFileSync(fullPath, "utf-8");
              console.log(`🔍 [审查] ${file}`);

              const issues = await reviewer.review(code, file);

              if (issues.length > 0) {
                allIssues.push(...issues);

                // 实时输出问题
                if (output.console) {
                  issues.forEach((issue) => {
                    const icon = getSeverityIcon(issue.severity);
                    console.log(
                      `${icon} [${issue.category}] ${issue.file}:${
                        issue.line || "?"
                      }`,
                    );
                    console.log(`   ${issue.message}`);
                    if (issue.suggestion) {
                      console.log(`   💡 ${issue.suggestion}`);
                    }
                  });
                  console.log("");
                }
              } else {
                console.log(`✅ 未发现问题\n`);
              }
            }
          } catch (error: any) {
            console.warn(`⚠️  审查失败 ${file}: ${error.message}`);
          }
        }
      } else if (mode !== "all") {
        console.log(`📝 没有需要审查的文件\n`);
      }
    },

    async transform(code: string, id: string) {
      // 只在 all 模式下使用 transform
      if (mode !== "all") {
        return null;
      }

      // 跳过非源码文件
      if (id.includes("node_modules") || !shouldReview(id, include, exclude)) {
        return null;
      }

      // 只审查源文件（不是编译后的文件）
      if (!id.match(/\.(vue|ts|tsx|js|jsx)$/)) {
        return null;
      }

      try {
        console.log(`🔍 [审查] ${id}`);

        // 读取原始源文件（而不是使用 transform 中的 code）
        const fs = await import("fs");
        let sourceCode = code;

        // 如果文件存在，读取原始内容
        if (fs.existsSync(id)) {
          sourceCode = fs.readFileSync(id, "utf-8");
        }

        const issues = await reviewer.review(sourceCode, id);

        if (issues.length > 0) {
          allIssues.push(...issues);

          // 实时输出问题
          if (output.console) {
            issues.forEach((issue) => {
              const icon = getSeverityIcon(issue.severity);
              console.log(
                `${icon} [${issue.category}] ${issue.file}:${
                  issue.line || "?"
                }`,
              );
              console.log(`   ${issue.message}`);
              if (issue.suggestion) {
                console.log(`   💡 ${issue.suggestion}`);
              }
            });
            console.log("");
          }
        }
      } catch (error: any) {
        console.warn(`⚠️  审查失败 ${id}: ${error.message}`);
      }

      return null;
    },

    async buildEnd() {
      if (allIssues.length === 0) {
        console.log("✨ 代码审查完成，未发现问题\n");
        return;
      }

      // 生成报告
      await reporter.generate(allIssues);

      // 检查是否需要失败构建
      if (output.failOnError) {
        const errors = allIssues.filter((i) => i.severity === "error");
        if (errors.length > 0) {
          throw new Error(`代码审查发现 ${errors.length} 个错误`);
        }
      }
    },
  };
}

/**
 * 判断文件是否需要审查
 */
function shouldReview(
  filePath: string,
  include: string[],
  exclude: string[],
): boolean {
  // 检查排除规则
  for (const pattern of exclude) {
    if (matchPattern(filePath, pattern)) {
      return false;
    }
  }

  // 检查包含规则
  for (const pattern of include) {
    if (matchPattern(filePath, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * 简单的模式匹配
 */
function matchPattern(filePath: string, pattern: string): boolean {
  // 移除 **/ 前缀
  const cleanPattern = pattern.replace(/^\*\*\//, "");

  // 提取扩展名
  const extMatch = cleanPattern.match(/\{(.+)\}/);
  if (extMatch) {
    const exts = extMatch[1].split(",").map((e) => e.trim());
    return exts.some((ext) => filePath.endsWith(ext));
  }

  // 简单的包含匹配
  return filePath.includes(cleanPattern.replace(/\*/g, ""));
}

/**
 * 获取严重程度图标
 */
function getSeverityIcon(severity: string): string {
  switch (severity) {
    case "error":
      return "❌";
    case "warn":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📝";
  }
}

// 导出类
export { CodeReviewer, GitUtils, Reporter };

// 默认导出
export default vitePluginAICodeReview;
