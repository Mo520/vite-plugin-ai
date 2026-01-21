# AI 性能分析

AI-powered performance analyzer for Vite. 分析打包体积，提供优化建议。

## 特性

- 📊 **打包分析** - 分析打包体积和组成
- 🤖 **AI 建议** - 获取 AI 驱动的优化建议
- 📈 **历史追踪** - 追踪性能变化趋势
- 🎯 **阈值告警** - 超过限制时告警
- 📄 **详细报告** - 生成详细的性能报告

## 安装

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

## 基础用法

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIPerfAnalyzer } from "vite-plugin-ai-perf-analyzer";

export default defineConfig({
  plugins: [
    vitePluginAIPerfAnalyzer({
      // API 配置
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      temperature: 0.2, // 客观分析（0-2，越低越客观）
      maxTokens: 4000, // 最大 token 数

      // 基础配置
      enabled: true,

      // 阈值配置
      threshold: {
        bundleSize: 500, // KB
        totalSize: 5, // MB
        chunkCount: 20,
      },

      // 输出配置
      output: {
        console: true,
        html: true,
      },
    }),
  ],
});
```

## 配置选项

### 基础配置

| 选项      | 类型      | 默认值 | 说明     |
| --------- | --------- | ------ | -------- |
| `enabled` | `boolean` | `true` | 是否启用 |

### API 配置

| 选项          | 类型     | 默认值  | 说明                                |
| ------------- | -------- | ------- | ----------------------------------- |
| `apiKey`      | `string` | -       | OpenAI API Key                      |
| `apiUrl`      | `string` | -       | OpenAI API URL（可选）              |
| `model`       | `string` | `gpt-4` | 使用的 AI 模型                      |
| `temperature` | `number` | `0.2`   | AI 创造性（0-2，越低越客观）        |
| `maxTokens`   | `number` | `4000`  | 最大 token 数（控制响应长度和成本） |

### 阈值配置

| 选项                   | 类型     | 默认值 | 说明                   |
| ---------------------- | -------- | ------ | ---------------------- |
| `threshold.bundleSize` | `number` | `500`  | 单个文件大小限制（KB） |
| `threshold.totalSize`  | `number` | `5`    | 总体积限制（MB）       |
| `threshold.chunkCount` | `number` | `20`   | chunk 数量限制         |

### 输出配置

| 选项             | 类型      | 默认值  | 说明       |
| ---------------- | --------- | ------- | ---------- |
| `output.console` | `boolean` | `true`  | 控制台输出 |
| `output.html`    | `boolean` | `true`  | HTML 报告  |
| `output.json`    | `boolean` | `false` | JSON 报告  |

## 分析报告

### 控制台输出

```
📊 AI 性能分析开始...

📦 打包体积分析:
  ├─ index.js: 245 KB
  ├─ vendor.js: 1.2 MB ⚠️  超过阈值
  ├─ chunk-1.js: 89 KB
  └─ chunk-2.js: 156 KB

📈 总体积: 1.69 MB

🤖 AI 优化建议:
  1. vendor.js 过大，建议拆分:
     - lodash (450 KB) → 使用 lodash-es 或按需引入
     - moment (280 KB) → 使用 dayjs 替代
     - echarts (320 KB) → 按需引入图表类型

  2. 启用代码分割:
     - 路由懒加载
     - 组件异步加载

  3. 优化依赖:
     - 移除未使用的依赖
     - 使用 tree-shaking

✨ 分析完成
```

### HTML 报告

生成 `ai-reports/performance-report.html`，包含：

- 📊 体积分布图表
- 📈 历史趋势图
- 🎯 优化建议
- 📦 依赖分析

### 历史追踪

插件会保存历史数据到 `ai-reports/.perf-history.json`：

```json
{
  "history": [
    {
      "date": "2026-01-19",
      "totalSize": 1690000,
      "chunkCount": 4,
      "largestChunk": 1200000
    }
  ]
}
```

## 优化建议示例

### 1. 大型依赖优化

```typescript
// ❌ 全量引入
import _ from "lodash";
import moment from "moment";

// ✅ 按需引入
import debounce from "lodash-es/debounce";
import dayjs from "dayjs";
```

### 2. 代码分割

```typescript
// ❌ 同步导入
import HeavyComponent from "./HeavyComponent.vue";

// ✅ 异步导入
const HeavyComponent = defineAsyncComponent(
  () => import("./HeavyComponent.vue"),
);
```

### 3. 路由懒加载

```typescript
const routes = [
  {
    path: "/dashboard",
    component: () => import("./views/Dashboard.vue"), // 懒加载
  },
];
```

### 4. 依赖优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          ui: ["element-plus"],
          utils: ["lodash-es", "dayjs"],
        },
      },
    },
  },
});
```

## 使用场景

### 1. 构建时分析

```typescript
export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [
      ...(isBuild
        ? [
            vitePluginAIPerfAnalyzer({
              enabled: true,
            }),
          ]
        : []),
    ],
  };
});
```

### 2. CI/CD 集成

```yaml
# .github/workflows/perf-check.yml
name: Performance Check

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: actions/upload-artifact@v3
        with:
          name: perf-report
          path: ai-reports/performance-report.html
```

### 3. 性能监控

定期运行构建，追踪性能变化：

```bash
# 每周运行一次
npm run build
git add ai-reports/.perf-history.json
git commit -m "chore: update perf history"
```

### 4. 自定义 AI 参数

```typescript
vitePluginAIPerfAnalyzer({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
  temperature: 0.2, // 客观分析（0-2，越低越客观）
  maxTokens: 3000, // 控制响应长度
});
```

## 最佳实践

### 1. 设置合理的阈值

```typescript
threshold: {
  bundleSize: 500,  // 根据项目调整
  totalSize: 5,     // 移动端可以更小
  chunkCount: 20,   // 避免过度分割
}
```

### 2. 定期检查报告

```bash
# 构建后查看报告
npm run build
open ai-reports/performance-report.html
```

### 3. 追踪历史趋势

提交 `.perf-history.json` 到 Git，追踪性能变化。

### 4. 结合其他工具

```typescript
plugins: [
  vitePluginAIPerfAnalyzer(), // AI 分析
  visualizer(), // 可视化分析
];
```

## 常见问题

### 1. 如何降低打包体积？

参考 AI 提供的优化建议：

- 按需引入依赖
- 启用代码分割
- 移除未使用的代码
- 使用更小的替代库

### 2. chunk 数量多好还是少好？

适中最好：

- 太少：单个文件过大，加载慢
- 太多：HTTP 请求多，也会慢

### 3. 如何查看依赖体积？

查看 HTML 报告中的依赖分析部分。

### 4. 历史数据保存多久？

默认保存所有历史，可以手动清理旧数据。

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-perf-analyzer)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-perf-analyzer)
