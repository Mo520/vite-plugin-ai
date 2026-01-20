# 快速开始

本指南将帮助你快速上手 AI Vite Plugins。

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0

## 安装

### 安装单个插件

根据需要安装对应的插件：

::: code-group

```bash [npm]
# AI 国际化
npm install -D vite-plugin-ai-i18n

# AI Mock 生成器
npm install -D vite-plugin-ai-mock-generator

# AI 代码审查
npm install -D vite-plugin-ai-code-review

# AI 智能诊断
npm install -D vite-plugin-ai-diagnostic

# AI 性能分析
npm install -D vite-plugin-ai-perf-analyzer
```

```bash [yarn]
# AI 国际化
yarn add -D vite-plugin-ai-i18n

# AI Mock 生成器
yarn add -D vite-plugin-ai-mock-generator

# AI 代码审查
yarn add -D vite-plugin-ai-code-review

# AI 智能诊断
yarn add -D vite-plugin-ai-diagnostic

# AI 性能分析
yarn add -D vite-plugin-ai-perf-analyzer
```

```bash [pnpm]
# AI 国际化
pnpm add -D vite-plugin-ai-i18n

# AI Mock 生成器
pnpm add -D vite-plugin-ai-mock-generator

# AI 代码审查
pnpm add -D vite-plugin-ai-code-review

# AI 智能诊断
pnpm add -D vite-plugin-ai-diagnostic

# AI 性能分析
pnpm add -D vite-plugin-ai-perf-analyzer
```

:::

## 配置 OpenAI API Key

大部分插件需要 OpenAI API Key 才能使用 AI 功能。

### 1. 获取 API Key

访问 [OpenAI Platform](https://platform.openai.com/api-keys) 获取 API Key。

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

::: tip 提示
如果使用国内的 OpenAI 代理服务，可以修改 `OPENAI_API_URL`。
:::

## 基础使用

### 示例：AI 国际化插件

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAII18n } from "vite-plugin-ai-i18n";

export default defineConfig({
  plugins: [
    vitePluginAII18n({
      // API 配置
      apiKey: process.env.OPENAI_API_KEY,
      apiUrl: process.env.OPENAI_API_URL,
      model: process.env.OPENAI_MODEL || "gpt-4",

      // 扫描配置
      include: ["src/**/*.vue", "src/**/*.ts"],
      exclude: ["node_modules/**", "dist/**"],

      // 输出配置
      localesDir: "src/locales",
      defaultLocale: "zh-CN",
      targetLocales: ["en-US", "ja-JP"],

      // 功能开关
      autoScan: true,
      autoTranslate: true,
    }),
  ],
});
```

### 示例：AI Mock 生成器

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIMockGenerator } from "vite-plugin-ai-mock-generator";

export default defineConfig({
  plugins: [
    vitePluginAIMockGenerator({
      apiKey: process.env.OPENAI_API_KEY,
      enabled: true,
      autoGenerate: true,

      endpoints: [
        {
          path: "/api/users",
          method: "GET",
          response: {
            name: "User",
            properties: [
              { name: "id", type: "number" },
              { name: "name", type: "string", comment: "用户名" },
              { name: "email", type: "string", comment: "邮箱" },
              { name: "avatar", type: "string", comment: "头像" },
            ],
            isArray: true,
          },
          count: 20,
        },
      ],

      generation: {
        locale: "zh-CN",
        quality: "fast", // 'fast' | 'balanced' | 'high'
      },

      storage: {
        dir: "mock-data",
        persist: true,
      },
    }),
  ],
});
```

## 运行项目

配置完成后，启动开发服务器：

::: code-group

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

```bash [pnpm]
pnpm dev
```

:::

你会在控制台看到插件的启动信息：

```
🌍 AI 国际化助手已启动...
📂 语言文件目录: src/locales
🔤 默认语言: zh-CN
🎯 目标语言: en-US, ja-JP
🔍 自动扫描: ✅
🤖 自动翻译: ✅
```

## 构建项目

::: code-group

```bash [npm]
npm run build
```

```bash [yarn]
yarn build
```

```bash [pnpm]
pnpm build
```

:::

构建时会自动运行代码审查、性能分析等插件（如果已配置）。

## 下一步

- 查看各个[插件的详细文档](/plugins/ai-i18n)
- 了解[配置选项](/guide/configuration)
- 查看[最佳实践](/guide/best-practices)

## 常见问题

### 1. 没有 OpenAI API Key 可以使用吗？

部分插件支持不使用 AI 的基础模式：

- **AI Mock 生成器**: 设置 `quality: 'fast'` 使用基础算法生成
- **AI 国际化**: 设置 `autoTranslate: false` 只扫描不翻译

### 2. API 调用会很慢吗？

插件都支持缓存机制，已翻译/分析的内容不会重复调用 API。

### 3. 会增加构建时间吗？

- 开发模式：插件异步运行，不影响 HMR 速度
- 构建模式：可以通过配置选择性启用插件

### 4. 支持哪些 Vite 版本？

支持 Vite 4.x 和 5.x。
