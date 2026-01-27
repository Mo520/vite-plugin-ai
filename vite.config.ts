import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { vitePluginAII18n } from "./packages/ai-i18n/src";
import { vitePluginAIMockGenerator } from "./packages/ai-mock-generator/src";
import { vitePluginAIPerfAnalyzer } from "./packages/ai-perf-analyzer/src";
import { vitePluginAIDiagnostic } from "./packages/ai-diagnostic/src";
import { vitePluginAICodeReview } from "./packages/ai-code-review/src";
import checker from "vite-plugin-checker";
import mockEndpoints from "./mock.config";

export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");

  // 判断是否为构建模式
  const isBuild = command === "build";

  return {
    plugins: [
      vue(),
      // TypeScript 检查器（捕获类型错误）
      checker({
        typescript: true,
        overlay: true,
        enableBuild: true, // 在构建时启用检查
        terminal: true, // 在终端显示错误
      }),
      // AI Mock Generator（仅在开发模式启用）
      // ...(!isBuild
      //   ? [
      vitePluginAIMockGenerator({
        apiKey: env.OPENAI_API_KEY || "",
        apiUrl: env.OPENAI_API_URL || "https://api.openai.com/v1",
        model: env.OPENAI_MODEL || "gpt-4",
        enabled: true,
        autoGenerate: true,
        endpoints: mockEndpoints, // 使用外部配置文件
        generation: {
          locale: "zh-CN",
          count: 20,
          quality: "fast", // 使用快速模式，不需要 AI
        },
        storage: {
          dir: "mock-data",
          persist: true,
          cache: true,
        },
        server: {
          delay: [100, 300],
          cors: true,
        },
        output: {
          console: true,
          logs: true,
        },
      }),
      //     ]
      //   : []),
      // AI 国际化助手插件
      // vitePluginAII18n({
      //   apiKey: env.OPENAI_API_KEY || "",
      //   apiUrl: env.OPENAI_API_URL || "https://api.openai.com/v1",
      //   model: env.OPENAI_MODEL || "gpt-4",
      //   localesDir: "src/locales",
      //   defaultLocale: "zh-CN",
      //   targetLocales: ["en-US"],
      //   autoScan: env.I18N_AUTO_SCAN === "true",
      //   autoTranslate: env.I18N_AUTO_TRANSLATE === "true",
      //   // 扫描配置
      //   extractMode: "function-only", // 'function-only' | 'all'
      //   functionNames: ["t", "$t"], // 自定义函数名
      // }),
      // AI 智能诊断助手插件（仅在构建时启用）
      ...(isBuild
        ? [
            // vitePluginAIDiagnostic({
            //   apiKey: env.OPENAI_API_KEY || "",
            //   apiUrl: env.OPENAI_API_URL || "https://api.openai.com/v1",
            //   model: env.OPENAI_MODEL || "gpt-4",
            //   // autoFix: env.OPENAI_AUTO_FIX === "true",
            //   // maxRetries: Number(env.OPENAI_MAX_RETRIES) || 3,
            //   output: {
            //     console: true,
            //     html: true,
            //     markdown: true,
            //     json: true,
            //   },
            // }),
            // AI 代码审查插件
            // vitePluginAICodeReview({
            //   apiKey: env.OPENAI_API_KEY || "",
            //   apiUrl: env.OPENAI_API_URL || "https://api.openai.com/v1",
            //   model: env.OPENAI_MODEL || "gpt-4",
            //   mode: "changed", // 只审查 Git 变更的文件
            //   level: "standard", // 标准审查级别
            //   rules: {
            //     security: "error",
            //     performance: "warn",
            //     style: "info",
            //     bestPractice: "info",
            //   },
            //   output: {
            //     console: true,
            //     html: true,
            //     markdown: true,
            //     json: true,
            //     failOnError: false, // 不因错误中断构建
            //   },
            //   cache: true, // 启用缓存
            // }),
            // AI 性能分析插件（仅在构建时启用）
            // vitePluginAIPerfAnalyzer({
            //   apiKey: env.OPENAI_API_KEY || "",
            //   apiUrl: env.OPENAI_API_URL || "https://api.openai.com/v1",
            //   model: env.OPENAI_MODEL || "gpt-4",
            //   enabled:
            //     !!env.OPENAI_API_KEY &&
            //     env.OPENAI_API_KEY !== "your-api-key-here", // 只在有真实 API key 时启用
            //   threshold: {
            //     bundleSize: 500, // 500KB
            //     totalSize: 5, // 5MB
            //     chunkCount: 20,
            //   },
            //   output: {
            //     console: true,
            //     html: true,
            //     json: false,
            //   },
            // }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
