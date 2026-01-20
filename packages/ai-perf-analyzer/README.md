# vite-plugin-ai-perf-analyzer

AI-powered performance analyzer for Vite. Analyze bundle size and suggest optimizations.

## ✨ Features

- 📊 **Bundle Analysis** - Analyze bundle size and composition
- 🤖 **AI Suggestions** - Get AI-powered optimization suggestions
- 📈 **History Tracking** - Track performance over time
- 🎯 **Threshold Alerts** - Alert when bundle size exceeds limits
- 📄 **Reports** - Generate detailed performance reports

## 📦 Installation

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-perf-analyzer
```

```bash [yarn]
yarn add -D vite-plugin-ai-perf-analyzer
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-perf-analyzer
```

:::

## 🚀 Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIPerfAnalyzer } from "vite-plugin-ai-perf-analyzer";

export default defineConfig({
  plugins: [
    vitePluginAIPerfAnalyzer({
      apiKey: process.env.OPENAI_API_KEY,
      enabled: true,
      threshold: {
        bundleSize: 500, // KB
        totalSize: 5, // MB
        chunkCount: 20,
      },
      output: {
        console: true,
        html: true,
      },
    }),
  ],
});
```

## 📚 Documentation

Full documentation: https://mo520.github.io/vite-plugin-ai/plugins/ai-perf-analyzer

## 📄 License

MIT
