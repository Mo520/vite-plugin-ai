# AI 代码审查

AI-powered code review plugin for Vite. 自动审查代码质量、安全性和最佳实践。

## 特性

- 🔍 **自动审查** - 构建时自动审查代码
- 🤖 **AI 分析** - 使用 OpenAI 分析代码质量
- 🔒 **安全检查** - 检测安全漏洞
- ⚡ **性能分析** - 发现性能问题
- 📊 **详细报告** - 生成详细的审查报告
- 🎯 **Git 集成** - 只审查变更的文件

## 安装

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

## 基础用法

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAICodeReview } from "vite-plugin-ai-code-review";

export default defineConfig({
  plugins: [
    vitePluginAICodeReview({
      // API 配置
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      temperature: 0.2, // 一致的审查标准（0-2，越低越一致）
      maxTokens: 4000, // 最大 token 数

      // 审查配置
      mode: "changed", // 只审查变更的文件
      level: "standard",
      rules: {
        security: "error",
        performance: "warn",
        style: "info",
      },

      // 输出配置
      output: {
        console: true,
        html: true,
        markdown: true,
      },
    }),
  ],
});
```

## 配置选项

### 审查模式

| 选项      | 说明                          |
| --------- | ----------------------------- |
| `all`     | 审查所有文件                  |
| `changed` | 只审查 Git 变更的文件（推荐） |

### 审查级别

| 级别       | 说明             |
| ---------- | ---------------- |
| `basic`    | 基础检查（快速） |
| `standard` | 标准检查（推荐） |
| `strict`   | 严格检查（详细） |

### API 配置

| 选项          | 类型     | 默认值  | 说明                                |
| ------------- | -------- | ------- | ----------------------------------- |
| `apiKey`      | `string` | -       | OpenAI API Key                      |
| `apiUrl`      | `string` | -       | OpenAI API URL（可选）              |
| `model`       | `string` | `gpt-4` | 使用的 AI 模型                      |
| `temperature` | `number` | `0.2`   | AI 创造性（0-2，越低越一致）        |
| `maxTokens`   | `number` | `4000`  | 最大 token 数（控制响应长度和成本） |

### 规则配置

| 规则           | 级别                                 | 说明     |
| -------------- | ------------------------------------ | -------- |
| `security`     | `error` \| `warn` \| `info` \| `off` | 安全问题 |
| `performance`  | `error` \| `warn` \| `info` \| `off` | 性能问题 |
| `style`        | `error` \| `warn` \| `info` \| `off` | 代码风格 |
| `bestPractice` | `error` \| `warn` \| `info` \| `off` | 最佳实践 |

## 审查报告

### 控制台输出

```
🔍 AI 代码审查开始...

📁 src/utils/api.ts
  ❌ [安全] 使用了不安全的 eval() 函数
  ⚠️  [性能] 循环中存在重复计算
  ℹ️  [风格] 建议使用 const 代替 let

📁 src/components/UserList.vue
  ⚠️  [性能] 组件未使用 memo 优化
  ℹ️  [最佳实践] 建议添加 key 属性

✨ 审查完成
  - 文件数: 2
  - 错误: 1
  - 警告: 2
  - 提示: 2
```

### HTML 报告

生成 `ai-reports/code-review.html`，包含：

- 问题列表
- 代码片段
- 修复建议
- 统计图表

### Markdown 报告

生成 `ai-reports/code-review.md`，适合提交到 Git。

## 使用场景

### 1. 构建时审查

```typescript
export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [
      ...(isBuild
        ? [
            vitePluginAICodeReview({
              mode: "changed",
              level: "standard",
            }),
          ]
        : []),
    ],
  };
});
```

### 2. CI/CD 集成

```yaml
# .github/workflows/code-review.yml
name: Code Review

on: [push, pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: code-review-report
          path: ai-reports/code-review.html
```

### 3. 只审查特定文件

```typescript
vitePluginAICodeReview({
  include: ["src/**/*.ts", "src/**/*.vue"],
  exclude: ["src/**/*.spec.ts", "src/test/**"],
});
```

### 4. 自定义 AI 参数

```typescript
vitePluginAICodeReview({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
  temperature: 0.2, // 一致的审查标准（0-2，越低越一致）
  maxTokens: 3000, // 控制响应长度
});
```

## 最佳实践

### 1. 使用 changed 模式

```typescript
mode: "changed"; // 只审查变更，节省时间和 API 调用
```

### 2. 根据项目调整规则

```typescript
rules: {
  security: 'error',      // 安全问题必须修复
  performance: 'warn',    // 性能问题警告
  style: 'off',          // 关闭风格检查（使用 ESLint）
  bestPractice: 'info',  // 最佳实践提示
}
```

### 3. 设置失败阈值

```typescript
output: {
  failOnError: true,  // 有错误时构建失败
  failOnWarning: false, // 警告不影响构建
}
```

### 4. 缓存审查结果

```typescript
cache: true; // 启用缓存，避免重复审查
```

## 常见问题

### 1. 审查时间太长？

使用 `mode: 'changed'` 只审查变更的文件。

### 2. 如何忽略某些问题？

在代码中添加注释：

```typescript
// @ai-review-ignore
eval(code);
```

### 3. 如何自定义审查规则？

目前使用 AI 自动分析，未来会支持自定义规则。

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-code-review)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-code-review)
