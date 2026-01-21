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
  // 基础配置
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4',

  // AI 参数配置（v1.1.0+）
  temperature: 0.3,  // AI 创造性（0-2，越低越精确）
  maxTokens: 4000,   // 最大 token 数（控制响应长度和成本）
}
```

#### temperature 参数说明

控制 AI 输出的随机性和创造性（范围：0-2）：

- **0.0 - 0.3**：精确、一致、客观

  - 适合：错误诊断、代码审查、性能分析
  - 示例：`temperature: 0.1`

- **0.3 - 0.7**：平衡

  - 适合：翻译、一般任务
  - 示例：`temperature: 0.3`

- **0.7 - 2.0**：创造性、多样性
  - 适合：生成测试数据、创意内容
  - 示例：`temperature: 0.7`

#### maxTokens 参数说明

限制 AI 响应的最大 token 数量：

- **控制成本**：减少 token 使用，降低 API 费用
- **控制长度**：限制响应长度，避免过长输出
- **推荐值**：
  - 简洁输出：`2000`
  - 标准输出：`4000`（默认）
  - 详细输出：`6000+`

#### 各插件默认值

| 插件              | temperature | maxTokens | 说明           |
| ----------------- | ----------- | --------- | -------------- |
| ai-diagnostic     | 0.1         | 4000      | 精确的错误分析 |
| ai-code-review    | 0.2         | 4000      | 一致的审查标准 |
| ai-perf-analyzer  | 0.2         | 4000      | 客观的性能分析 |
| ai-i18n           | 0.3         | 4000      | 翻译灵活性     |
| ai-mock-generator | 0.7         | 4000      | 创造性数据生成 |

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
import { vitePluginAIDiagnostic } from "vite-plugin-ai-diagnostic";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isBuild = command === "build";

  return {
    plugins: [
      // 国际化（开发和构建都启用）
      vitePluginAII18n({
        apiKey: env.OPENAI_API_KEY,
        model: "gpt-4",
        temperature: 0.3, // 翻译灵活性
        maxTokens: 4000,
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
              model: "gpt-4",
              temperature: 0.7, // 数据多样性
              maxTokens: 4000,
              enabled: true,
              autoGenerate: true,
            }),
          ]
        : []),

      // 智能诊断（开发和构建都启用）
      vitePluginAIDiagnostic({
        apiKey: env.OPENAI_API_KEY,
        model: "gpt-4",
        temperature: 0.1, // 精确分析
        maxTokens: 4000,
        output: {
          console: true,
          html: true,
        },
      }),
    ],
  };
});
```

## 环境变量配置

你也可以通过环境变量统一管理 AI 参数：

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# AI 参数配置
VITE_AI_TEMPERATURE=0.3
VITE_AI_MAX_TOKENS=4000
```

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vitePluginAII18n({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      temperature: Number(process.env.VITE_AI_TEMPERATURE) || 0.3,
      maxTokens: Number(process.env.VITE_AI_MAX_TOKENS) || 4000,
    }),
  ],
});
```
