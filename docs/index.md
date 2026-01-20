---
layout: home

hero:
  name: AI Vite Plugins
  text: AI 驱动的 Vite 插件集合
  tagline: 让开发更智能，让构建更高效
  image:
    src: /logo.svg
    alt: AI Vite Plugins
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看插件
      link: /plugins/ai-i18n
    - theme: alt
      text: GitHub
      link: https://github.com/Mo520/vite-plugin-ai

features:
  - icon: 🤖
    title: AI 驱动
    details: 基于 LangChain 框架，使用 OpenAI 提供智能功能，自动化繁琐的开发任务
  - icon: 🌍
    title: AI 国际化
    details: 自动扫描中文文本，AI 翻译到多语言，生成 i18n 文件
  - icon: 🎲
    title: AI Mock 生成器
    details: 生成真实的测试数据，支持 AI 和快速模式
  - icon: 🔍
    title: AI 代码审查
    details: 自动分析代码质量、安全性和最佳实践
  - icon: 🛠️
    title: AI 智能诊断
    details: 使用 LangGraph 构建智能诊断工作流，提供修复建议
  - icon: 📊
    title: AI 性能分析
    details: 分析打包体积，提供优化建议
  - icon: ⚡
    title: 高性能
    details: 基于 Turborepo 的 Monorepo 架构，构建快速
  - icon: 📦
    title: 独立发布
    details: 每个插件独立发布到 npm，按需安装
  - icon: 🎯
    title: 类型安全
    details: 完整的 TypeScript 支持，开发体验极佳
---

## 快速安装

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

## 简单使用

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAII18n } from "vite-plugin-ai-i18n";

export default defineConfig({
  plugins: [
    vitePluginAII18n({
      apiKey: process.env.OPENAI_API_KEY,
      localesDir: "src/locales",
      defaultLocale: "zh-CN",
      targetLocales: ["en-US", "ja-JP"],
      autoScan: true,
      autoTranslate: true,
    }),
  ],
});
```

## 为什么选择 AI Vite Plugins？

<div class="why-choose">

### 🚀 提升开发效率

自动化国际化、Mock 数据生成、代码审查等繁琐任务，让你专注于业务开发。

### 🤖 AI 赋能

利用 **LangChain** 框架和 OpenAI 的强大能力，提供智能翻译、代码分析、错误诊断等功能。

### 📦 开箱即用

简单配置即可使用，无需复杂的设置，支持 Vite HMR。

### 🎯 生产就绪

经过实际项目验证，稳定可靠，适合生产环境使用。

</div>

<style>
.why-choose {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.why-choose h3 {
  margin-top: 0;
}
</style>
