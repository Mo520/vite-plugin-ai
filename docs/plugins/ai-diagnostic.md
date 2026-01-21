# AI 智能诊断

AI-powered diagnostic plugin for Vite. 智能分析构建错误，提供修复建议。

## 特性

- 🔍 **自动检测** - 自动检测构建错误
- 🤖 **AI 分析** - 使用 OpenAI 智能分析错误并提供修复建议
- 📊 **详细报告** - 生成多种格式的诊断报告（HTML、Markdown、JSON）
- 🎯 **智能分析** - 深度理解错误上下文，提供可操作的修复方案

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
      // API 配置
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      temperature: 0.1, // 精确分析（0-2，越低越精确）
      maxTokens: 4000, // 最大 token 数

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

### API 配置

| 选项          | 类型     | 默认值  | 说明                                |
| ------------- | -------- | ------- | ----------------------------------- |
| `apiKey`      | `string` | -       | OpenAI API Key                      |
| `apiUrl`      | `string` | -       | OpenAI API URL（可选）              |
| `model`       | `string` | `gpt-4` | 使用的 AI 模型                      |
| `temperature` | `number` | `0.1`   | AI 创造性（0-2，越低越精确）        |
| `maxTokens`   | `number` | `4000`  | 最大 token 数（控制响应长度和成本） |

### 输出配置

| 选项              | 类型      | 默认值  | 说明               |
| ----------------- | --------- | ------- | ------------------ |
| `output.console`  | `boolean` | `true`  | 控制台输出         |
| `output.html`     | `boolean` | `true`  | 生成 HTML 报告     |
| `output.markdown` | `boolean` | `false` | 生成 Markdown 报告 |
| `output.json`     | `boolean` | `false` | 生成 JSON 报告     |

## 工作流程

### 1. 主动扫描（构建开始时）

```
扫描 src 目录 → 检查所有源文件 → 发现潜在问题
```

插件会主动扫描以下内容：

- Vue 文件结构（template/script 标签完整性）
- 括号匹配（圆括号、花括号）
- 模块导入路径验证

### 2. 错误检测（构建过程中）

```
构建失败 → 捕获错误 → 提取错误信息和源代码
```

### 3. AI 分析

```
错误信息 + 源代码 → OpenAI 深度分析 → 生成修复建议
```

### 4. 生成报告

```
诊断结果 → 生成多格式报告 → 保存到 ai-reports 目录
```

## 诊断报告

### 控制台输出

```
🤖 AI 诊断助手已启动...
⚙️  自动修复: ❌ 未启用

⚠️  检测到错误，正在使用 AI 分析...

📝 错误信息: Property 'data' does not exist on type 'Response'
📂 文件路径: src/utils/api.ts
📄 代码长度: 245 字符

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 错误分析：
这是一个 TypeScript 类型错误。Response 对象默认没有 data 属性，
需要先解析响应体才能访问数据。

💡 修复建议：
1. 使用 response.json() 解析响应：
   const data = await response.json();

2. 或定义自定义接口：
   interface ApiResponse extends Response {
     data: any;
   }

3. 或使用类型断言（不推荐）：
   (response as any).data
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
export default defineConfig({
  plugins: [
    vitePluginAIDiagnostic({
      apiKey: process.env.OPENAI_API_KEY,
      output: {
        console: true, // 实时查看分析结果
        html: true, // 生成详细报告
      },
    }),
  ],
});
```

### 2. CI/CD 环境

```typescript
vitePluginAIDiagnostic({
  apiKey: process.env.OPENAI_API_KEY,
  output: {
    console: true,
    html: true,
    markdown: true, // 生成 Markdown 报告便于查看
    json: true, // 生成 JSON 供其他工具使用
  },
});
```

### 3. 自定义 AI 参数

```typescript
vitePluginAIDiagnostic({
  apiKey: process.env.OPENAI_API_KEY,
  apiUrl: "https://api.openai.com/v1", // 自定义 API 地址
  model: "gpt-4-turbo", // 使用更快的模型
  temperature: 0.1, // 精确分析（0-2，越低越精确）
  maxTokens: 2000, // 限制响应长度，降低成本
});
```

## 支持的错误类型

### 主动扫描检测

- **Vue 文件结构问题**
  - 缺少 template/script 标签
  - 标签未闭合
- **语法问题**

  - 括号不匹配（圆括号、花括号）
  - 基本语法错误

- **模块导入问题**
  - 相对路径导入的模块不存在
  - 文件路径错误

### 构建过程检测

- **TypeScript 错误**（由 vite-plugin-checker 处理）

  - 类型不匹配
  - 缺少属性
  - 类型推断错误
  - 泛型错误

- **编译错误**

  - Vue 模板解析错误
  - JSX/TSX 语法错误
  - 编译器错误

- **模块解析错误**

  - 模块未找到
  - 导入路径错误
  - 循环依赖

- **运行时错误**
  - undefined 访问
  - null 引用
  - 异步错误

## 最佳实践

### 1. 配置环境变量

```bash
# .env
OPENAI_API_KEY=sk-xxx
OPENAI_API_URL=https://api.openai.com/v1  # 可选
```

### 2. 保存诊断报告

```typescript
output: {
  html: true,     // 生成可视化报告
  markdown: true, // 便于团队查看和分享
  json: true,     // 供其他工具集成
}
```

### 3. 结合其他工具

```typescript
import checker from "vite-plugin-checker";

plugins: [
  checker({ typescript: true }), // TypeScript 类型检查
  vitePluginAIDiagnostic(), // AI 智能诊断
];
```

### 4. 根据错误类型调整

```typescript
// 对于复杂错误，使用更强大的模型
vitePluginAIDiagnostic({
  model: "gpt-4-turbo", // 更快更便宜
  // model: 'gpt-4',    // 更准确但较慢
});
```

## 常见问题

### 1. 会自动修复代码吗？

不会。插件只提供智能分析和修复建议，不会自动修改源代码。你需要根据建议手动修复。

### 2. 支持哪些错误类型？

目前主要支持：

- TypeScript 类型错误
- 语法错误
- 导入/导出错误
- 模块解析错误

### 3. API 调用频繁吗？

只在构建失败时调用 AI 分析，不会频繁调用。每次构建失败只分析一次。

### 4. 报告保存在哪里？

默认保存在项目根目录的 `ai-reports/` 文件夹中：

- `diagnostic-report.html` - HTML 可视化报告
- `diagnostic-report.md` - Markdown 文本报告
- `diagnostic-report.json` - JSON 结构化数据

### 5. 如何使用自定义 API？

```typescript
vitePluginAIDiagnostic({
  apiUrl: "https://your-api.com/v1",
  apiKey: "your-key",
});
```

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-diagnostic)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-diagnostic)
