# vite-plugin-ai-diagnostic

AI-powered diagnostic plugin for Vite. Automatically detect and fix build errors.

## ✨ Features

- 🔍 **Auto Detect** - Automatically detect build errors
- 🤖 **AI Analysis** - Use OpenAI to analyze errors and suggest fixes
- 📊 **Reports** - Generate diagnostic reports (HTML, Markdown, JSON)
- 🎯 **Smart Analysis** - Understand error context and provide actionable suggestions

## 📦 Installation

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-diagnostic
```

```bash [yarn]
yarn add -D vite-plugin-ai-diagnostic
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-diagnostic
```

:::

## 🚀 Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIDiagnostic } from "vite-plugin-ai-diagnostic";

export default defineConfig({
  plugins: [
    vitePluginAIDiagnostic({
      apiKey: process.env.OPENAI_API_KEY,
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

Full documentation: https://mo520.github.io/vite-plugin-ai/plugins/ai-diagnostic

## 📄 License

MIT
