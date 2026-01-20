# 配置指南

本指南介绍如何配置 AI Vite Plugins。

## 环境变量

所有插件都支持通过环境变量配置：

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

## 通用配置

### API 配置

所有插件都支持以下 API 配置：

```typescript
{
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4',
}
```

### 输出配置

大部分插件支持输出配置：

```typescript
{
  output: {
    console: true,  // 控制台输出
    html: true,     // HTML 报告
    markdown: true, // Markdown 报告
    json: false,    // JSON 报告
  }
}
```

## 按环境配置

### 开发环境

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      // 开发环境启用的插件
      ...(isDev
        ? [
            vitePluginAII18n({ autoScan: true }),
            vitePluginAIMockGenerator({ enabled: true }),
          ]
        : []),
    ],
  };
});
```

### 生产环境

```typescript
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      // 生产环境启用的插件
      ...(isProd
        ? [
            vitePluginAICodeReview({ mode: "changed" }),
            vitePluginAIPerfAnalyzer({ enabled: true }),
          ]
        : []),
    ],
  };
});
```

## 完整示例

```typescript
import { defineConfig, loadEnv } from "vite";
import { vitePluginAII18n } from "vite-plugin-ai-i18n";
import { vitePluginAIMockGenerator } from "vite-plugin-ai-mock-generator";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isBuild = command === "build";

  return {
    plugins: [
      // 国际化（开发和构建都启用）
      vitePluginAII18n({
        apiKey: env.OPENAI_API_KEY,
        localesDir: "src/locales",
        defaultLocale: "zh-CN",
        targetLocales: ["en-US"],
        autoScan: !isBuild,
        autoTranslate: !isBuild,
      }),

      // Mock 生成器（只在开发环境）
      ...(!isBuild
        ? [
            vitePluginAIMockGenerator({
              apiKey: env.OPENAI_API_KEY,
              enabled: true,
              autoGenerate: true,
            }),
          ]
        : []),
    ],
  };
});
```
