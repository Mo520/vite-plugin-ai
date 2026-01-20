# AI Vite Plugins

🚀 一套强大的 AI 驱动的 Vite 插件集合，帮助你提升开发效率。

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

每个插件都有详细的文档：

- [AI i18n 插件文档](./packages/ai-i18n/README.md)
- [AI Mock Generator 文档](./packages/ai-mock-generator/README.md)
- [AI Code Review 文档](./packages/ai-code-review/README.md)
- [AI Diagnostic 文档](./packages/ai-diagnostic/README.md)
- [AI Perf Analyzer 文档](./packages/ai-perf-analyzer/README.md)

## 🛠️ 开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 克隆项目

```bash
git clone https://github.com/Mo520/vite-plugin-ai.git
cd vite-plugin-ai
```

### 快速启动

```bash
# 运行快速启动脚本
chmod +x quick-start.sh
./quick-start.sh
```

或者手动执行：

```bash
# 1. 安装依赖
pnpm install

# 2. 构建所有包
pnpm build

# 3. 运行测试
pnpm test
```

### 常用命令

```bash
# 构建所有包
pnpm build

# 开发模式（watch）
pnpm dev

# 运行测试
pnpm test

# 清理构建产物
pnpm clean

# 构建特定包
pnpm --filter vite-plugin-ai-i18n build

# 开发特定包
pnpm --filter vite-plugin-ai-i18n dev
```

## 📝 发布流程

### 1. 配置 Changesets

```bash
pnpm changeset init
```

### 2. 创建 Changeset

```bash
pnpm changeset
```

### 3. 更新版本

```bash
pnpm changeset version
```

### 4. 构建

```bash
pnpm build
```

### 5. 发布到 npm

```bash
# 登录 npm
npm login

# 发布
pnpm changeset publish

# 推送 tags
git push --follow-tags
```

## 🏗️ 项目结构

```
ai-vite-plugins/
├── packages/
│   ├── shared/              # 共享工具库
│   ├── ai-i18n/             # AI 国际化插件
│   ├── ai-mock-generator/   # AI Mock 生成器
│   ├── ai-code-review/      # AI 代码审查
│   ├── ai-diagnostic/       # AI 智能诊断
│   └── ai-perf-analyzer/    # AI 性能分析
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── turbo.json               # Turborepo 配置
├── package.json             # 根 package.json
└── README.md                # 项目文档
```

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

[MIT](./LICENSE)

## 🔗 相关链接

- [Vite 官方文档](https://vitejs.dev/)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)

## 💬 支持

如有问题或建议，请：

- 提交 [Issue](https://github.com/Mo520/vite-plugin-ai/issues)
- 发起 [Discussion](https://github.com/Mo520/vite-plugin-ai/discussions)

---

**使用 AI Vite Plugins，让开发更智能！** 🚀
