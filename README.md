# AI Vite Plugins

<p align="center">
  <a href="https://mo520.github.io/vite-plugin-ai/">
    <img src="https://img.shields.io/badge/docs-online-blue?style=flat-square" alt="Documentation">
  </a>
  <a href="https://github.com/Mo520/vite-plugin-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/Mo520/vite-plugin-ai">
    <img src="https://img.shields.io/github/stars/Mo520/vite-plugin-ai?style=flat-square" alt="GitHub Stars">
  </a>
  <a href="https://www.npmjs.com/search?q=vite-plugin-ai">
    <img src="https://img.shields.io/badge/npm-vite--plugin--ai-red?style=flat-square" alt="npm">
  </a>
</p>

<p align="center">
  🚀 一套强大的 AI 驱动的 Vite 插件集合，帮助你提升开发效率
</p>

<p align="center">
  <a href="https://mo520.github.io/vite-plugin-ai/">📚 在线文档</a> •
  <a href="https://mo520.github.io/vite-plugin-ai/guide/getting-started">🚀 快速开始</a> •
  <a href="https://github.com/Mo520/vite-plugin-ai/issues">💬 问题反馈</a>
</p>

---

## 📦 包列表

| 包名                                                          | 版本  | 描述                                           |
| ------------------------------------------------------------- | ----- | ---------------------------------------------- |
| [vite-plugin-ai-i18n](./packages/ai-i18n)                     | 1.0.0 | AI 国际化插件 - 自动扫描、翻译和管理多语言文件 |
| [vite-plugin-ai-mock-generator](./packages/ai-mock-generator) | 1.0.0 | AI Mock 数据生成器 - 生成真实的测试数据        |
| [vite-plugin-ai-code-review](./packages/ai-code-review)       | 1.0.0 | AI 代码审查 - 自动分析代码质量和潜在问题       |
| [vite-plugin-ai-diagnostic](./packages/ai-diagnostic)         | 1.0.0 | AI 智能诊断 - 智能分析和修复构建错误           |
| [vite-plugin-ai-perf-analyzer](./packages/ai-perf-analyzer)   | 1.0.0 | AI 性能分析 - 分析和优化构建性能               |
| [vite-plugin-ai-shared](./packages/shared)                    | 1.0.0 | 共享工具库 - 所有插件的公共依赖                |

## ✨ 特性

- 🤖 **AI 驱动** - 使用 LangChain + OpenAI 提供智能功能
- ⚡ **高性能** - 基于 Turborepo 的 Monorepo 架构
- 🔧 **易用** - 简单的配置，开箱即用
- 📦 **独立发布** - 每个插件独立发布，按需安装
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📚 **文档完善** - 详细的使用文档和示例

## 🚀 快速开始

### 安装

::: code-group

```bash [npm]
# 安装你需要的插件
npm install -D vite-plugin-ai-i18n
npm install -D vite-plugin-ai-mock-generator
npm install -D vite-plugin-ai-code-review
npm install -D vite-plugin-ai-diagnostic
npm install -D vite-plugin-ai-perf-analyzer
```

```bash [yarn]
# 安装你需要的插件
yarn add -D vite-plugin-ai-i18n
yarn add -D vite-plugin-ai-mock-generator
yarn add -D vite-plugin-ai-code-review
yarn add -D vite-plugin-ai-diagnostic
yarn add -D vite-plugin-ai-perf-analyzer
```

```bash [pnpm]
# 安装你需要的插件
pnpm add -D vite-plugin-ai-i18n
pnpm add -D vite-plugin-ai-mock-generator
pnpm add -D vite-plugin-ai-code-review
pnpm add -D vite-plugin-ai-diagnostic
pnpm add -D vite-plugin-ai-perf-analyzer
```

:::

### 使用示例

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import aiI18n from "vite-plugin-ai-i18n";
import aiMockGenerator from "vite-plugin-ai-mock-generator";

export default defineConfig({
  plugins: [
    aiI18n({
      localeDir: "src/locales",
      defaultLocale: "zh-CN",
      targetLocales: ["en-US", "ja-JP"],
    }),
    aiMockGenerator({
      endpoints: [
        {
          path: "/api/users",
          method: "GET",
          response: {
            name: "User",
            properties: [
              { name: "id", type: "number" },
              { name: "name", type: "string" },
            ],
          },
        },
      ],
    }),
  ],
});
```

## 📖 文档

完整文档请访问：**[https://mo520.github.io/vite-plugin-ai/](https://mo520.github.io/vite-plugin-ai/)**

每个插件的详细文档：

- [AI 国际化插件](https://mo520.github.io/vite-plugin-ai/plugins/ai-i18n)
- [AI Mock 生成器](https://mo520.github.io/vite-plugin-ai/plugins/ai-mock-generator)
- [AI 代码审查](https://mo520.github.io/vite-plugin-ai/plugins/ai-code-review)
- [AI 智能诊断](https://mo520.github.io/vite-plugin-ai/plugins/ai-diagnostic)
- [AI 性能分析](https://mo520.github.io/vite-plugin-ai/plugins/ai-perf-analyzer)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

查看[贡献指南](https://mo520.github.io/vite-plugin-ai/guide/introduction)了解更多。

## 📄 许可证

[MIT](./LICENSE) © 2026 Haihui Mo

## 🔗 相关链接

- [📚 完整文档](https://mo520.github.io/vite-plugin-ai/)
- [🚀 快速开始](https://mo520.github.io/vite-plugin-ai/guide/getting-started)
- [🏗️ 技术架构](https://mo520.github.io/vite-plugin-ai/guide/architecture)
- [⚙️ 配置指南](https://mo520.github.io/vite-plugin-ai/guide/configuration)
- [Vite 官方文档](https://vitejs.dev/)
- [LangChain 文档](https://js.langchain.com/)
- [OpenAI API 文档](https://platform.openai.com/docs)

## 💬 支持

如有问题或建议，请：

- 提交 [Issue](https://github.com/Mo520/vite-plugin-ai/issues)
- 发起 [Discussion](https://github.com/Mo520/vite-plugin-ai/discussions)

---

**使用 AI Vite Plugins，让开发更智能！** 🚀
