# AI 国际化插件

AI-powered internationalization plugin for Vite. 自动扫描、翻译和管理多语言文件。

## 特性

- 🔍 **自动扫描** - 自动扫描代码中的中文文本
- 🤖 **AI 翻译** - 使用 OpenAI 翻译到多语言
- 📦 **自动生成** - 自动生成语言文件
- 🔄 **热更新** - 支持 Vite HMR
- 🎯 **智能检测** - 过滤代码、注释和系统消息

## 安装

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

## 基础用法

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
      targetLocales: ["en-US"],
      autoScan: true,
      autoTranslate: true,
    }),
  ],
});
```

## 配置选项

### API 配置

| 选项     | 类型     | 默认值                       | 说明           |
| -------- | -------- | ---------------------------- | -------------- |
| `apiKey` | `string` | `process.env.OPENAI_API_KEY` | OpenAI API Key |
| `apiUrl` | `string` | `https://api.openai.com/v1`  | OpenAI API URL |
| `model`  | `string` | `gpt-4`                      | 使用的模型     |

### 扫描配置

| 选项      | 类型       | 默认值                            | 说明       |
| --------- | ---------- | --------------------------------- | ---------- |
| `include` | `string[]` | `['src/**/*.vue', 'src/**/*.ts']` | 包含的文件 |
| `exclude` | `string[]` | `['node_modules/**', 'dist/**']`  | 排除的文件 |

### 输出配置

| 选项            | 类型       | 默认值        | 说明         |
| --------------- | ---------- | ------------- | ------------ |
| `localesDir`    | `string`   | `src/locales` | 语言文件目录 |
| `defaultLocale` | `string`   | `zh-CN`       | 默认语言     |
| `targetLocales` | `string[]` | `['en-US']`   | 目标语言     |

### 功能开关

| 选项            | 类型      | 默认值 | 说明     |
| --------------- | --------- | ------ | -------- |
| `autoScan`      | `boolean` | `true` | 自动扫描 |
| `autoTranslate` | `boolean` | `true` | 自动翻译 |

## 使用示例

### 1. 基础使用

在 Vue 组件中使用中文：

```vue
<template>
  <div>
    <h1>欢迎使用 AI Vite Plugins</h1>
    <p>这是一个示例页面</p>
  </div>
</template>
```

插件会自动：

1. 扫描到 "欢迎使用 AI Vite Plugins" 和 "这是一个示例页面"
2. 生成 `src/locales/zh-CN.json`
3. 使用 AI 翻译到 `src/locales/en-US.json`

### 2. 配合 vue-i18n 使用

```typescript
// src/i18n/index.ts
import { createI18n } from "vue-i18n";
import zhCN from "../locales/zh-CN.json";
import enUS from "../locales/en-US.json";

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

export default i18n;
```

```vue
<template>
  <div>
    <h1>{{ t("欢迎使用 AI Vite Plugins") }}</h1>
    <p>{{ t("这是一个示例页面") }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

### 3. 增量更新

当你修改代码添加新的中文文本时，插件会自动：

1. 检测文件变化
2. 扫描新增的文本
3. 更新语言文件
4. 触发 HMR

### 4. 只扫描不翻译

如果你想手动翻译，可以关闭自动翻译：

```typescript
vitePluginAII18n({
  autoScan: true,
  autoTranslate: false, // 关闭自动翻译
});
```

这样插件只会生成 `zh-CN.json`，你可以手动编辑其他语言文件。

## 工作原理

### 扫描阶段

1. 使用正则表达式匹配中文字符
2. 过滤掉注释、代码片段
3. 去重并生成 key-value 对

### 翻译阶段

1. 读取已有翻译（避免重复翻译）
2. 调用 OpenAI API 批量翻译
3. 合并新旧翻译
4. 写入语言文件

### 热更新

1. 监听文件变化
2. 增量扫描和翻译
3. 触发 Vite HMR

## 最佳实践

### 1. 使用环境变量

```bash
# .env.development
I18N_AUTO_SCAN=true
I18N_AUTO_TRANSLATE=true

# .env.production
I18N_AUTO_SCAN=false
I18N_AUTO_TRANSLATE=false
```

```typescript
vitePluginAII18n({
  autoScan: process.env.I18N_AUTO_SCAN === "true",
  autoTranslate: process.env.I18N_AUTO_TRANSLATE === "true",
});
```

### 2. 提交语言文件到 Git

```bash
git add src/locales/*.json
git commit -m "chore: update i18n files"
```

### 3. 定期检查翻译质量

AI 翻译可能不够准确，建议定期检查和修正。

### 4. 使用缓存

插件会自动缓存已翻译的内容，避免重复调用 API。

## 常见问题

### 1. 翻译不准确怎么办？

可以手动修改语言文件，插件不会覆盖已有的翻译。

### 2. 如何支持更多语言？

在 `targetLocales` 中添加语言代码：

```typescript
targetLocales: ["en-US", "ja-JP", "ko-KR", "fr-FR"];
```

### 3. 如何自定义扫描规则？

使用 `include` 和 `exclude` 选项：

```typescript
include: ['src/**/*.vue', 'src/**/*.tsx'],
exclude: ['src/test/**', 'src/**/*.spec.ts']
```

### 4. API 调用次数会很多吗？

不会。插件会：

- 批量翻译（一次 API 调用翻译多条文本）
- 缓存已翻译的内容
- 只翻译新增的文本

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-i18n)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-i18n)
- [问题反馈](https://github.com/Mo520/vite-plugin-ai/issues)
