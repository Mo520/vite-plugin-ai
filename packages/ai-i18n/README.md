# vite-plugin-ai-i18n

AI-powered internationalization plugin for Vite. Automatically scan, translate and manage i18n files.

## ✨ Features

- 🔍 **Auto Scan** - Automatically scan Chinese text in your code
- 🤖 **AI Translation** - Use OpenAI to translate to multiple languages
- 📦 **Auto Generate** - Generate language files automatically
- 🔄 **Hot Reload** - Support Vite HMR
- 🎯 **Smart Detection** - Filter out code, comments, and system messages

## 📦 Installation

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-i18n
```

```bash [yarn]
yarn add -D vite-plugin-ai-i18n
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-i18n
```

:::

## 🚀 Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAII18n } from "vite-plugin-ai-i18n";

export default defineConfig({
  plugins: [
    vitePluginAII18n({
      // AI Configuration
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      temperature: 0.3,
      maxTokens: 4000,

      // Scan Configuration
      extractMode: "function-only", // 'function-only' | 'all'
      functionNames: ["t", "$t"],

      // Output Configuration
      localesDir: "src/locales",
      defaultLocale: "zh-CN",
      targetLocales: ["en-US"],

      // Feature Switches
      autoScan: true,
      autoTranslate: true,
    }),
  ],
});
```

## 📖 Extract Modes

**`function-only` (Default)**: Only extract text from `t()` or `$t()` functions

```vue
<template>
  <div>{{ $t("Welcome") }}</div>
  <!-- ✅ Will be extracted -->
  <div>Welcome</div>
  <!-- ❌ Will NOT be extracted -->
</template>
```

**`all`**: Extract all Chinese text (Legacy mode)

```vue
<template>
  <div>{{ $t("欢迎") }}</div>
  <!-- ✅ Will be extracted -->
  <div>欢迎</div>
  <!-- ✅ Will be extracted -->
</template>
```

## 📚 Documentation

Full documentation: https://mo520.github.io/vite-plugin-ai/plugins/ai-i18n

## 📄 License

MIT
