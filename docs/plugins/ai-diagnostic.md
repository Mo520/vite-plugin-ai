# AI 智能诊断

AI-powered diagnostic plugin for Vite. 智能分析构建错误，提供修复建议。

## 特性

- 🔍 **自动检测** - 自动检测构建错误
- 🤖 **AI 修复** - 使用 OpenAI 提供修复建议
- 🔄 **自动重试** - 自动应用修复并重试
- 📊 **详细报告** - 生成诊断报告
- 🎯 **智能分析** - 理解错误上下文

## 安装

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

## 基础用法

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIDiagnostic } from "vite-plugin-ai-diagnostic";

export default defineConfig({
  plugins: [
    vitePluginAIDiagnostic({
      apiKey: process.env.OPENAI_API_KEY,
      autoFix: true,
      maxRetries: 3,
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

| 选项              | 类型      | 默认值  | 说明               |
| ----------------- | --------- | ------- | ------------------ |
| `apiKey`          | `string`  | -       | OpenAI API Key     |
| `autoFix`         | `boolean` | `false` | 自动应用修复       |
| `maxRetries`      | `number`  | `3`     | 最大重试次数       |
| `output.console`  | `boolean` | `true`  | 控制台输出         |
| `output.html`     | `boolean` | `true`  | 生成 HTML 报告     |
| `output.markdown` | `boolean` | `true`  | 生成 Markdown 报告 |
| `output.json`     | `boolean` | `false` | 生成 JSON 报告     |

## 工作流程

### 1. 错误检测

```
构建失败 → 捕获错误 → 提取错误信息
```

### 2. AI 分析

```
错误信息 + 源代码 → OpenAI 分析 → 修复建议
```

### 3. 应用修复

```
修复建议 → 应用到代码 → 重新构建
```

### 4. 生成报告

```
诊断结果 → 生成报告 → 保存到文件
```

## 诊断报告

### 控制台输出

```
🛠️  AI 智能诊断启动...

❌ 构建错误:
  文件: src/utils/api.ts:15:10
  错误: Property 'data' does not exist on type 'Response'

🤖 AI 分析中...

💡 修复建议:
  1. 添加类型断言: (response as any).data
  2. 或定义接口: interface ApiResponse { data: any }
  3. 或使用 response.json()

✅ 已应用修复方案 2
🔄 重新构建中...
✨ 构建成功！
```

### HTML 报告

生成 `ai-reports/diagnostic-report.html`，包含：

- 错误详情
- 源代码片段
- 修复建议
- 修复历史

## 使用场景

### 1. 开发环境

```typescript
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      vitePluginAIDiagnostic({
        autoFix: isDev, // 开发环境自动修复
        maxRetries: 3,
      }),
    ],
  };
});
```

### 2. CI/CD

```typescript
vitePluginAIDiagnostic({
  autoFix: false, // CI 环境不自动修复
  output: {
    console: true,
    html: true,
    markdown: true, // 生成报告供查看
  },
});
```

### 3. 只诊断不修复

```typescript
vitePluginAIDiagnostic({
  autoFix: false, // 只提供建议，不自动修复
});
```

## 支持的错误类型

### TypeScript 错误

- 类型不匹配
- 缺少属性
- 类型推断错误
- 泛型错误

### 语法错误

- 缺少括号
- 缺少分号
- 语法不正确

### 导入错误

- 模块未找到
- 导入路径错误
- 循环依赖

### 运行时错误

- undefined 访问
- null 引用
- 异步错误

## 最佳实践

### 1. 谨慎使用自动修复

```typescript
autoFix: process.env.NODE_ENV === "development"; // 只在开发环境自动修复
```

### 2. 限制重试次数

```typescript
maxRetries: 3; // 避免无限重试
```

### 3. 保存诊断报告

```typescript
output: {
  html: true,
  markdown: true, // 提交到 Git，方便团队查看
}
```

### 4. 结合其他工具

```typescript
plugins: [
  checker({ typescript: true }), // TypeScript 检查
  vitePluginAIDiagnostic(), // AI 诊断
];
```

## 常见问题

### 1. 自动修复安全吗？

建议只在开发环境启用，生产环境手动审查修复建议。

### 2. 会修改源代码吗？

是的，如果启用 `autoFix: true`，会直接修改源文件。建议使用 Git 管理代码。

### 3. 支持哪些错误？

目前主要支持 TypeScript 和语法错误，其他类型正在开发中。

### 4. API 调用频繁吗？

只在构建失败时调用，且有重试限制。

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-diagnostic)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-diagnostic)
