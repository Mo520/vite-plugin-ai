# vite-plugin-ai-mock-generator

AI-powered Mock data generator for Vite. Generate realistic test data with AI or basic algorithms.

## ✨ Features

- 🤖 **AI Generation** - Use OpenAI to generate realistic business data
- ⚡ **Fast Mode** - Basic algorithm generation without AI
- 💾 **Data Persistence** - Save generated data to files
- 🔄 **Auto Generation** - Generate data on server start
- 🎯 **Type Safe** - Full TypeScript support
- 🔍 **Query Support** - Filter, sort, and pagination
- 🎭 **Mock Server** - Built-in mock server with request interception

## 📦 Installation

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-mock-generator
```

```bash [yarn]
yarn add -D vite-plugin-ai-mock-generator
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-mock-generator
```

:::

## 🚀 Quick Start

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

## 📚 Documentation

Full documentation: https://mo520.github.io/vite-plugin-ai/plugins/ai-mock-generator

## 📄 License

MIT
