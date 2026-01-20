# vite-plugin-ai-code-review

AI-powered code review plugin for Vite. Automatically review code quality, security, and best practices.

## ✨ Features

- 🔍 **Auto Review** - Automatically review code on build
- 🤖 **AI Analysis** - Use OpenAI to analyze code quality
- 🔒 **Security Check** - Detect security vulnerabilities
- ⚡ **Performance** - Find performance issues
- 📊 **Reports** - Generate detailed review reports
- 🎯 **Git Integration** - Review only changed files

## 📦 Installation

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-code-review
```

```bash [yarn]
yarn add -D vite-plugin-ai-code-review
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-code-review
```

:::

## 🚀 Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAICodeReview } from "vite-plugin-ai-code-review";

export default defineConfig({
  plugins: [
    vitePluginAICodeReview({
      apiKey: process.env.OPENAI_API_KEY,
      mode: "changed", // 'all' | 'changed'
      level: "standard", // 'basic' | 'standard' | 'strict'
      rules: {
        security: "error",
        performance: "warn",
        style: "info",
      },
      output: {
        console: true,
        html: true,
        markdown: true,
      },
    }),
  ],
});
```

## 📚 Documentation

Full documentation: https://mo520.github.io/vite-plugin-ai/plugins/ai-code-review

## 📄 License

MIT
