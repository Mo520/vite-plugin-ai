/**
 * AI 诊断核心逻辑
 */

import fs from "fs";
import { DiagnosticGraph } from "./langgraph";
import { CodeValidator } from "./validator";

export interface DiagnosticOptions {
  apiKey: string;
  apiUrl: string;
  model: string;
  maxRetries: number;
  temperature?: number;
  maxTokens?: number;
}

export interface DiagnosticResult {
  analysis: string;
  suggestion: string;
  fixedCode?: string;
  filePath?: string;
}

export class AIErrorDiagnostic {
  private options: DiagnosticOptions;
  private graph: DiagnosticGraph;

  constructor(options: DiagnosticOptions) {
    this.options = options;

    this.graph = new DiagnosticGraph(
      options.apiKey,
      options.apiUrl,
      options.model,
      options.maxRetries,
      options.temperature,
      options.maxTokens,
    );
  }

  async diagnose(
    error: any,
    autoFix: boolean = false,
  ): Promise<DiagnosticResult> {
    if (!this.options.apiKey) {
      return {
        analysis: "未配置 API Key，无法使用 AI 诊断功能",
        suggestion: "请在 .env 文件中配置 OPENAI_API_KEY",
        fixedCode: undefined,
        filePath: undefined,
      };
    }

    try {
      // 注意：自动修复功能已暂时禁用，因为不够稳定
      // 强制设置 autoFix 为 false
      const result = await this.graph.run(error, false);

      // 自动修复功能已注释（不够稳定）
      // if (autoFix && result.fixedCode && result.filePath) {
      //   console.log("\n🔍 [验证] 正在验证修复后的代码...");

      //   const validation = CodeValidator.validateFix(
      //     error.code,
      //     result.fixedCode
      //   );

      //   if (!validation.valid) {
      //     console.warn(`⚠️  [验证失败] ${validation.reason}`);
      //     console.log("📝 [提示] 将只提供修复建议，不自动应用修复\n");

      //     return {
      //       analysis: result.analysis,
      //       suggestion:
      //         result.suggestion +
      //         "\n\n⚠️ 自动修复验证失败：" +
      //         validation.reason,
      //       fixedCode: undefined,
      //       filePath: undefined,
      //     };
      //   }

      //   console.log("✅ [验证通过] 代码验证成功\n");
      //   this.applyFix(result.filePath, result.fixedCode);
      // }

      return {
        analysis: result.analysis,
        suggestion: result.suggestion,
        fixedCode: undefined, // 暂时不返回修复代码
        filePath: undefined,
      };
    } catch (error: any) {
      console.error("❌ AI 诊断失败：", error.message);
      return {
        analysis: `诊断过程出错: ${error.message}`,
        suggestion: "请检查 API 配置和网络连接",
        fixedCode: undefined,
        filePath: undefined,
      };
    }
  }

  // 自动修复功能已注释（不够稳定）
  // private applyFix(filePath: string, fixedCode: string): void {
  //   try {
  //     const backupPath = `${filePath}.backup`;
  //     if (fs.existsSync(filePath)) {
  //       fs.copyFileSync(filePath, backupPath);
  //       console.log(`📦 [备份] 已创建备份: ${backupPath}`);
  //     }

  //     fs.writeFileSync(filePath, fixedCode, "utf-8");
  //     console.log(`✅ [修复] 已修复文件: ${filePath}`);
  //     console.log(`💡 [提示] 如需恢复，运行: cp "${backupPath}" "${filePath}"`);
  //   } catch (error: any) {
  //     console.error(`❌ [修复失败] ${error.message}`);
  //   }
  // }
}
