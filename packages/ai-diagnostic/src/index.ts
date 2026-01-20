/**
 * AI 诊断插件入口
 *
 * 功能：
 * - 自动诊断构建错误
 * - 提供修复建议
 * - 自动修复代码
 */

import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { AIErrorDiagnostic } from "./diagnostic";
import { extractSourceFile } from "vite-plugin-ai-shared";
import { DiagnosticReporter, type DiagnosticReport } from "./reporter";

export interface AIPluginOptions {
  apiKey?: string;
  apiUrl?: string;
  autoFix?: boolean;
  model?: string;
  maxRetries?: number;
  output?: {
    console?: boolean;
    html?: boolean;
    markdown?: boolean;
    json?: boolean;
  };
}

export function vitePluginAIDiagnostic(options: AIPluginOptions = {}): Plugin {
  const {
    apiKey = process.env.OPENAI_API_KEY || "",
    apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1",
    autoFix = false,
    model = "gpt-4",
    maxRetries = 3,
    output = {
      console: true,
      html: true,
      markdown: false,
      json: false,
    },
  } = options;

  const diagnostic = new AIErrorDiagnostic({
    apiKey,
    apiUrl,
    model,
    maxRetries,
  });

  let buildErrors: any[] = [];
  let lastTransformFile: string | null = null;
  let processedErrors = new Set<string>(); // 记录已处理的错误

  // 处理错误的函数
  async function processError(error: any) {
    // 生成错误的唯一标识
    const errorKey = `${error.file}:${error.message}`;

    // 如果已经处理过，跳过
    if (processedErrors.has(errorKey)) {
      console.log("🔍 [调试] 跳过重复错误:", errorKey);
      return;
    }

    processedErrors.add(errorKey);

    try {
      console.log("\n⚠️  检测到错误，正在使用 AI 分析...\n");
      console.log(`📝 错误信息: ${error.message}`);
      console.log(`📂 文件路径: ${error.file || "未知"}`);
      console.log(
        `📄 代码长度: ${error.code ? error.code.length + " 字符" : "无"}`,
      );
      console.log(`🔧 自动修复: ${autoFix ? "是" : "否"}\n`);

      if (!error.file || !error.code) {
        console.log("⚠️  跳过此错误：缺少文件路径或代码内容\n");
        return;
      }

      const result = await diagnostic.diagnose(error, autoFix);

      // 控制台输出
      if (output.console !== false) {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔍 错误分析：");
        console.log(result.analysis);
        console.log("\n💡 修复建议：");
        console.log(result.suggestion);

        if (result.fixedCode && result.filePath) {
          console.log("\n✅ 已自动修复代码");
          console.log("修复的文件：", result.filePath);
          console.log("\n💡 请重新运行构建命令");
        } else if (autoFix) {
          console.log("\n⚠️  无法自动修复：AI 未生成修复代码");
        }
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      }

      // 生成报告
      const report: DiagnosticReport = {
        timestamp: new Date().toLocaleString("zh-CN"),
        error: {
          type: error.type || "unknown",
          message: error.message,
          file: error.file,
          stack: error.stack,
        },
        analysis: result.analysis,
        suggestion: result.suggestion,
        fixed: !!(result.fixedCode && result.filePath),
        fixedFilePath: result.filePath,
      };

      await DiagnosticReporter.generate(report, output);
    } catch (err: any) {
      console.error("❌ AI 诊断失败：", err.message);
    }
  }

  return {
    name: "vite-plugin-ai-diagnostic",

    // 确保插件在其他插件之后执行，以捕获更多错误
    enforce: "post",

    configResolved(config) {
      console.log("\n🤖 AI 诊断助手已启动...");
      console.log(`⚙️  自动修复: ${autoFix ? "✅ 已启用" : "❌ 未启用"}`);
      console.log(`📝 根目录: ${config.root}`);
      console.log(
        `📝 入口: ${config.build.rollupOptions?.input || "index.html"}\n`,
      );
    },

    buildStart() {
      buildErrors = [];
      processedErrors.clear();
      console.log("🔍 [调试] buildStart 已执行");
    },

    // 解析模块时捕获错误
    async resolveId(source, importer, options) {
      // 不要在这里 try-catch，让错误自然传播到 buildEnd
      return null;
    },

    // 加载模块时捕获错误
    async load(id) {
      // 不要在这里 try-catch，让错误自然传播到 buildEnd
      return null;
    },

    // Rollup 钩子：模块解析完成后调用
    moduleParsed(moduleInfo) {
      // 检查模块是否有导入错误
      if (moduleInfo.meta && moduleInfo.meta.error) {
        console.log("\n⚠️  moduleParsed 检测到错误:", moduleInfo.id);

        let code = undefined;
        if (moduleInfo.id && fs.existsSync(moduleInfo.id)) {
          code = fs.readFileSync(moduleInfo.id, "utf-8");
        }

        const errorInfo = {
          type: "module",
          message: moduleInfo.meta.error,
          stack: "",
          file: moduleInfo.id,
          code: code,
        };

        buildErrors.push(errorInfo);
      }
    },

    buildEnd(error?: Error) {
      console.log("🔍 [调试] buildEnd 已执行, 有错误:", !!error);

      if (error) {
        console.log("\n⚠️  buildEnd 捕获到错误:", error.message);

        const realFilePath = extractSourceFile(error, lastTransformFile);

        let code = undefined;
        if (realFilePath && fs.existsSync(realFilePath)) {
          try {
            code = fs.readFileSync(realFilePath, "utf-8");
            console.log(`📂 读取源文件成功: ${realFilePath}`);
            console.log(`📄 源文件长度: ${code.length} 字符`);
          } catch (e) {
            console.warn("⚠️  无法读取文件:", realFilePath);
          }
        }

        const errorInfo = {
          type: "build",
          message: error.message,
          stack: error.stack,
          file: realFilePath,
          code: code,
        };

        buildErrors.push(errorInfo);
      }
    },

    // Rollup 输出生成阶段的钩子
    renderStart(outputOptions, inputOptions) {
      console.log("🔍 [调试] renderStart 已执行");
    },

    renderError(error?: Error) {
      console.log("🔍 [调试] renderError 已执行");
      if (!error) return;

      console.log("\n⚠️  renderError 捕获到错误:", error.message);

      const realFilePath = extractSourceFile(error, lastTransformFile);

      let code = undefined;
      if (realFilePath && fs.existsSync(realFilePath)) {
        try {
          code = fs.readFileSync(realFilePath, "utf-8");
          console.log(`📂 读取源文件成功: ${realFilePath}`);
          console.log(`📄 源文件长度: ${code.length} 字符`);
        } catch (e) {
          console.warn("⚠️  无法读取文件:", realFilePath);
        }
      }

      const errorInfo = {
        type: "render",
        message: error.message,
        stack: error.stack,
        file: realFilePath,
        code: code,
      };

      buildErrors.push(errorInfo);
    },

    // 监听所有阶段的错误
    watchChange(id, change) {
      console.log("🔍 [调试] watchChange:", id);
    },

    async closeBundle() {
      if (buildErrors.length > 0) {
        console.log(
          `\n🔍 [调试] closeBundle 检测到 ${buildErrors.length} 个错误\n`,
        );

        // 处理所有收集到的错误（去重由 processError 函数处理）
        for (const error of buildErrors) {
          await processError(error);
        }
      } else {
        console.log("✨ 构建完成，未检测到错误\n");
      }
    },

    transform(code: string, id: string) {
      lastTransformFile = id;

      try {
        return null;
      } catch (error: any) {
        console.log("\n⚠️  transform 捕获到错误:", error.message);
        buildErrors.push({
          type: "transform",
          message: error.message,
          stack: error.stack,
          file: id,
          code: code,
        });
        throw error;
      }
    },
  };
}
