# 技术架构

## 整体架构

AI Vite Plugins 采用 Monorepo 架构，使用现代化的工具链构建：

```
┌─────────────────────────────────────────┐
│         AI Vite Plugins                 │
│         (Monorepo)                      │
├─────────────────────────────────────────┤
│  Turborepo + pnpm workspace             │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Plugin 1 │  │ Plugin 2 │  ...       │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│       └─────┬───────┘                   │
│             │                           │
│      ┌──────▼──────┐                    │
│      │   Shared    │                    │
│      └─────────────┘                    │
└─────────────────────────────────────────┘
```

## 构建流程

### 插件打包 - tsup

所有插件包使用 **tsup** 进行打包，这是一个基于 esbuild 的零配置 TypeScript 打包工具。

#### 为什么选择 tsup？

1. **极快的构建速度** - 基于 esbuild，比 tsc 快 10-100 倍
2. **零配置** - 开箱即用，无需复杂配置
3. **完整的类型支持** - 自动生成 `.d.ts` 类型声明文件
4. **多格式输出** - 同时支持 CJS 和 ESM 格式

#### 统一的 tsup 配置

```typescript
// packages/*/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // 入口文件
  format: ["cjs", "esm"], // 输出 CommonJS 和 ES Module
  dts: true, // 生成类型声明文件
  splitting: false, // 不进行代码拆分
  sourcemap: true, // 生成 sourcemap
  clean: true, // 构建前清理输出目录
  external: ["vite"], // 外部依赖（不打包）
  treeshake: true, // Tree-shaking 优化
  minify: false, // 不压缩（保持可读性）
  target: "node18", // 目标环境 Node.js 18+
});
```

#### 构建输出

每个插件包构建后会生成：

```
dist/
├── index.js          # CommonJS 格式
├── index.mjs         # ES Module 格式
├── index.d.ts        # TypeScript 类型声明
├── index.js.map      # Source map
└── index.mjs.map     # Source map
```

### Turborepo 构建编排

Turborepo 负责协调多个包的构建顺序和缓存：

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"], // 先构建依赖包
      "outputs": ["dist/**"] // 缓存输出目录
    }
  }
}
```

#### 构建流程

```bash
# 1. 用户执行构建命令
pnpm build:packages

# 2. Turborepo 分析依赖关系
#    shared → ai-i18n, ai-code-review, ...

# 3. 按依赖顺序构建
#    ① 构建 shared 包（被其他包依赖）
#    ② 并行构建其他插件包

# 4. tsup 打包每个包
#    TypeScript → esbuild → CJS + ESM

# 5. 生成缓存
#    下次构建时，未修改的包直接使用缓存
```

#### 增量构建示例

```bash
# 首次构建（全量）
$ pnpm build:packages
✓ shared: built in 1.2s
✓ ai-i18n: built in 2.3s
✓ ai-code-review: built in 2.1s
✓ ai-diagnostic: built in 2.5s
✓ ai-mock-generator: built in 2.0s
✓ ai-perf-analyzer: built in 2.2s
Total: 12.3s

# 修改 ai-i18n 后再次构建（增量）
$ pnpm build:packages
✓ shared: cache hit
✓ ai-i18n: built in 2.3s
✓ ai-code-review: cache hit
✓ ai-diagnostic: cache hit
✓ ai-mock-generator: cache hit
✓ ai-perf-analyzer: cache hit
Total: 2.3s  ← 快了 5 倍！
```

## AI 技术栈

### LangChain 框架

本项目的核心 AI 功能基于 **LangChain** 框架构建：

#### 为什么选择 LangChain？

1. **统一的抽象层** - 提供一致的 API 来与不同的 LLM 交互
2. **灵活的模型切换** - 轻松切换 OpenAI、Anthropic 等不同提供商
3. **强大的工具链** - 内置提示模板、输出解析、错误处理等
4. **工作流编排** - 通过 LangGraph 构建复杂的 AI 工作流

#### 使用的 LangChain 组件

```typescript
// 核心组件
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// LangGraph（用于复杂工作流）
import { StateGraph } from "@langchain/langgraph";
```

### 各插件的 AI 实现

#### 1. AI 国际化插件

```typescript
// packages/ai-i18n/src/translator.ts
export class I18nTranslator {
  private llm: ChatOpenAI;

  async translate(texts: string[], targetLang: string) {
    const messages = [
      new SystemMessage("你是一个专业的翻译助手..."),
      new HumanMessage(`翻译以下文本到 ${targetLang}...`),
    ];

    const response = await this.llm.invoke(messages);
    return this.parseTranslations(response.content);
  }
}
```

**特点**：

- 批量翻译优化
- 上下文感知翻译
- 缓存机制减少 API 调用

#### 2. AI 代码审查插件

```typescript
// packages/ai-code-review/src/reviewer.ts
export class CodeReviewer {
  private llm: ChatOpenAI;

  async review(code: string, filePath: string) {
    const prompt = this.buildReviewPrompt(code, filePath);
    const response = await this.llm.invoke(prompt);
    return this.parseReviewResult(response.content);
  }
}
```

**特点**：

- 多维度代码分析（安全、性能、风格）
- 结构化输出解析
- 优先级分级

#### 3. AI 智能诊断插件

```typescript
// packages/ai-diagnostic/src/langgraph.ts
import { StateGraph } from "@langchain/langgraph";

export class DiagnosticGraph {
  private graph: StateGraph;

  constructor() {
    this.graph = new StateGraph({
      channels: {
        error: { value: null },
        analysis: { value: null },
        solution: { value: null },
      },
    });

    // 定义工作流节点
    this.graph
      .addNode("analyze", this.analyzeError)
      .addNode("diagnose", this.diagnoseIssue)
      .addNode("suggest", this.suggestFix)
      .addEdge("analyze", "diagnose")
      .addEdge("diagnose", "suggest");
  }
}
```

**特点**：

- 使用 **LangGraph** 构建多步骤诊断流程
- 状态管理和流程控制
- 可视化的工作流

#### 4. AI 性能分析插件

```typescript
// packages/ai-perf-analyzer/src/analyzer.ts
export class PerfAnalyzer {
  private llm: ChatOpenAI | null;

  async analyzePerformance(bundles: BundleInfo[]) {
    if (!this.llm) return this.basicAnalysis(bundles);

    const analysis = await this.llm.invoke([
      new SystemMessage("你是一个前端性能优化专家..."),
      new HumanMessage(this.formatBundleData(bundles)),
    ]);

    return this.parseOptimizations(analysis.content);
  }
}
```

**特点**：

- 可选的 AI 增强分析
- 基础分析 + AI 深度分析
- 历史数据对比

## 数据流

### 典型的 AI 处理流程

```
用户代码
   │
   ▼
┌──────────────┐
│ Vite Plugin  │ ← 插件钩子触发
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  数据收集     │ ← 扫描、解析、提取
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ LangChain    │ ← 构建提示、调用 LLM
│  + OpenAI    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  结果解析     │ ← 解析 AI 响应
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  输出/保存    │ ← 生成文件、报告
└──────────────┘
```

## 性能优化

### 1. 缓存策略

```typescript
// 翻译缓存
const translationCache = new Map<string, string>();

async translate(text: string) {
  if (translationCache.has(text)) {
    return translationCache.get(text);
  }

  const result = await this.llm.invoke(...);
  translationCache.set(text, result);
  return result;
}
```

### 2. 批处理

```typescript
// 批量翻译
async batchTranslate(texts: string[]) {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await this.translateBatch(batch);
    results.push(...batchResults);
  }

  return results;
}
```

### 3. 增量更新

```typescript
// 只处理变更的文件
async handleHotUpdate({ file }) {
  const newTexts = this.scanFile(file);
  const existingTranslations = this.loadCache();

  // 只翻译新增的文本
  const textsToTranslate = newTexts.filter(
    text => !existingTranslations.has(text)
  );

  if (textsToTranslate.length > 0) {
    await this.translate(textsToTranslate);
  }
}
```

## 错误处理

### 重试机制

```typescript
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3, // LangChain 内置重试
  timeout: 30000,
});
```

### 降级策略

```typescript
async analyze(code: string) {
  try {
    // 尝试 AI 分析
    return await this.aiAnalysis(code);
  } catch (error) {
    console.warn("AI 分析失败，使用基础分析");
    // 降级到基础分析
    return this.basicAnalysis(code);
  }
}
```

## 扩展性

### 支持多个 AI 提供商

```typescript
// 轻松切换到其他提供商
import { ChatAnthropic } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-3-opus-20240229",
});
```

### 自定义提示模板

```typescript
import { PromptTemplate } from "@langchain/core/prompts";

const template = new PromptTemplate({
  template: "翻译以下文本到 {language}:\n{text}",
  inputVariables: ["language", "text"],
});
```

## 安全性

### API Key 管理

```typescript
// 从环境变量读取
const apiKey = process.env.OPENAI_API_KEY;

// 验证
if (!apiKey) {
  console.warn("未配置 API Key，AI 功能将被禁用");
}
```

### 数据隐私

- 不会上传敏感的业务逻辑代码
- 只发送必要的代码片段或文本
- 支持本地缓存，减少 API 调用

## 相关资源

- [LangChain 官方文档](https://js.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraphjs/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
