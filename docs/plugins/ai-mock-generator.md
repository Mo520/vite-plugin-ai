# AI Mock 生成器

AI-powered Mock data generator for Vite. 生成真实的测试数据，支持 AI 和快速模式。

## 特性

- 🤖 **AI 生成** - 使用 OpenAI 生成真实的业务数据
- ⚡ **快速模式** - 不需要 AI 的基础算法生成
- 💾 **数据持久化** - 保存生成的数据到文件
- 🔄 **自动生成** - 服务器启动时自动生成
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔍 **查询支持** - 过滤、排序、分页
- 🎭 **Mock 服务器** - 内置 Mock 服务器，拦截请求

## 安装

::: code-group

```bash [npm]
npm install -D vite-plugin-ai-mock-generator
```

```bash [yarn]
yarn add -D vite-plugin-ai-mock-generator
```

```bash [pnpm]
pnpm add -D vite-plugin-ai-mock-generator
```

:::

## 基础用法

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { vitePluginAIMockGenerator } from "vite-plugin-ai-mock-generator";

export default defineConfig({
  plugins: [
    vitePluginAIMockGenerator({
      // API 配置
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      temperature: 0.7, // 数据多样性（0-2，越高越多样）
      maxTokens: 4000, // 最大 token 数

      // 基础配置
      enabled: true,
      autoGenerate: true,

      // 端点配置
      endpoints: [
        {
          path: "/api/users",
          method: "GET",
          response: {
            name: "User",
            properties: [
              { name: "id", type: "number" },
              { name: "name", type: "string", comment: "用户名" },
              { name: "email", type: "string", comment: "邮箱" },
            ],
            isArray: true,
          },
          count: 20,
        },
      ],
    }),
  ],
});
```

## 配置选项

### API 配置

| 选项          | 类型     | 默认值                       | 说明                                |
| ------------- | -------- | ---------------------------- | ----------------------------------- |
| `apiKey`      | `string` | `process.env.OPENAI_API_KEY` | OpenAI API Key                      |
| `apiUrl`      | `string` | `https://api.openai.com/v1`  | OpenAI API URL                      |
| `model`       | `string` | `gpt-4`                      | 使用的模型                          |
| `temperature` | `number` | `0.7`                        | AI 创造性（0-2，越高数据越多样）    |
| `maxTokens`   | `number` | `4000`                       | 最大 token 数（控制响应长度和成本） |

### 基础配置

| 选项           | 类型               | 默认值  | 说明         |
| -------------- | ------------------ | ------- | ------------ |
| `enabled`      | `boolean`          | `true`  | 是否启用插件 |
| `autoGenerate` | `boolean`          | `false` | 自动生成数据 |
| `endpoints`    | `EndpointConfig[]` | `[]`    | 端点配置     |

### 生成配置

| 选项                 | 类型                             | 默认值     | 说明         |
| -------------------- | -------------------------------- | ---------- | ------------ |
| `generation.locale`  | `string`                         | `zh-CN`    | 数据语言     |
| `generation.count`   | `number`                         | `20`       | 默认生成数量 |
| `generation.quality` | `'fast' \| 'balanced' \| 'high'` | `balanced` | 生成质量     |

### 存储配置

| 选项              | 类型      | 默认值      | 说明         |
| ----------------- | --------- | ----------- | ------------ |
| `storage.dir`     | `string`  | `mock-data` | 存储目录     |
| `storage.persist` | `boolean` | `true`      | 持久化到文件 |
| `storage.cache`   | `boolean` | `true`      | 启用缓存     |

### 服务器配置

| 选项           | 类型                         | 默认值       | 说明           |
| -------------- | ---------------------------- | ------------ | -------------- |
| `server.delay` | `number \| [number, number]` | `[100, 300]` | 响应延迟（ms） |
| `server.cors`  | `boolean`                    | `true`       | 启用 CORS      |

## 使用示例

### 1. 基础用户数据

```typescript
{
  path: '/api/users',
  method: 'GET',
  response: {
    name: 'User',
    properties: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string', comment: '用户名' },
      { name: 'email', type: 'string', comment: '邮箱' },
      { name: 'avatar', type: 'string', comment: '头像URL' },
      { name: 'age', type: 'number', comment: '年龄' },
      { name: 'phone', type: 'string', comment: '手机号' },
    ],
    isArray: true,
  },
  count: 50,
}
```

### 2. 商品数据

```typescript
{
  path: '/api/products',
  method: 'GET',
  response: {
    name: 'Product',
    properties: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string', comment: '商品名称' },
      { name: 'price', type: 'number', comment: '价格' },
      { name: 'description', type: 'string', comment: '商品描述' },
      { name: 'category', type: 'string', comment: '分类' },
      { name: 'stock', type: 'number', comment: '库存' },
      { name: 'image', type: 'string', comment: '商品图片' },
    ],
    isArray: true,
  },
  count: 30,
}
```

### 3. 订单数据

```typescript
{
  path: '/api/orders',
  method: 'GET',
  response: {
    name: 'Order',
    properties: [
      { name: 'id', type: 'string', comment: '订单号' },
      { name: 'userId', type: 'number', comment: '用户ID' },
      { name: 'productId', type: 'number', comment: '商品ID' },
      { name: 'quantity', type: 'number', comment: '数量' },
      { name: 'totalPrice', type: 'number', comment: '总价' },
      { name: 'status', type: 'string', comment: '订单状态' },
      { name: 'createdAt', type: 'string', comment: '创建时间' },
    ],
    isArray: true,
  },
  count: 100,
}
```

### 4. 单个对象

```typescript
{
  path: '/api/users/:id',
  method: 'GET',
  response: {
    name: 'User',
    properties: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
    ],
    isArray: false, // 单个对象
  },
}
```

### 5. 使用外部配置文件

```typescript
// mock.config.ts
import type { EndpointConfig } from "vite-plugin-ai-mock-generator";

const mockEndpoints: EndpointConfig[] = [
  {
    path: "/api/users",
    method: "GET",
    response: {
      name: "User",
      properties: [
        { name: "id", type: "number" },
        { name: "name", type: "string", comment: "用户名" },
      ],
      isArray: true,
    },
    count: 20,
  },
  // ... 更多端点
];

export default mockEndpoints;
```

```typescript
// vite.config.ts
import mockEndpoints from "./mock.config";

export default defineConfig({
  plugins: [
    vitePluginAIMockGenerator({
      endpoints: mockEndpoints,
    }),
  ],
});
```

### 6. 自定义 AI 参数

```typescript
vitePluginAIMockGenerator({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
  temperature: 0.7, // 数据多样性（0-2，越高越多样）
  maxTokens: 4000, // 控制响应长度
  generation: {
    quality: "high", // 高质量数据生成
  },
});
```

## 前端调用

### 使用 fetch

```typescript
// 获取用户列表
const response = await fetch("/api/users");
const users = await response.json();

// 获取单个用户
const response = await fetch("/api/users/1");
const user = await response.json();

// 分页查询
const response = await fetch("/api/users?page=1&pageSize=10");
const data = await response.json();

// 过滤查询
const response = await fetch("/api/users?name=张三");
const users = await response.json();
```

### 使用 axios

```typescript
import axios from "axios";

// 获取用户列表
const { data } = await axios.get("/api/users");

// 分页查询
const { data } = await axios.get("/api/users", {
  params: {
    page: 1,
    pageSize: 10,
  },
});
```

## 生成质量对比

### fast（快速模式）

- ✅ 不需要 API Key
- ✅ 生成速度快
- ⚠️ 数据较简单
- ⚠️ 缺少业务逻辑

```json
{
  "id": 1,
  "name": "User_1",
  "email": "user1@example.com"
}
```

### balanced（平衡模式）

- ✅ 需要 API Key
- ✅ 数据较真实
- ✅ 速度适中

```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com"
}
```

### high（高质量模式）

- ✅ 需要 API Key
- ✅ 数据非常真实
- ✅ 包含业务逻辑
- ⚠️ 生成较慢

```json
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@company.com",
  "phone": "13800138000",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
  "age": 28,
  "department": "技术部",
  "position": "前端工程师"
}
```

## 最佳实践

### 1. 开发环境启用，生产环境禁用

```typescript
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      vitePluginAIMockGenerator({
        enabled: isDev, // 只在开发环境启用
      }),
    ],
  };
});
```

### 2. 使用快速模式节省 API 调用

```typescript
vitePluginAIMockGenerator({
  generation: {
    quality: "fast", // 不需要 API Key
  },
});
```

### 3. 提交 mock 数据到 Git

```bash
git add mock-data/*.json
git commit -m "chore: update mock data"
```

团队成员可以直接使用，不需要重新生成。

### 4. 定期更新数据

```bash
# 删除旧数据
rm -rf mock-data

# 重新生成
pnpm dev
```

## 常见问题

### 1. 如何修改已生成的数据？

直接编辑 `mock-data/` 目录下的 JSON 文件，插件不会覆盖已有数据。

### 2. 如何重新生成数据？

删除对应的 JSON 文件，重启开发服务器。

### 3. 支持 POST/PUT/DELETE 吗？

目前主要支持 GET 请求，其他方法正在开发中。

### 4. 如何模拟错误响应？

可以在配置中添加错误处理：

```typescript
{
  path: '/api/error',
  method: 'GET',
  response: {
    error: true,
    message: '服务器错误',
  },
}
```

## 相关链接

- [npm 包](https://www.npmjs.com/package/vite-plugin-ai-mock-generator)
- [GitHub 源码](https://github.com/Mo520/vite-plugin-ai/tree/main/packages/ai-mock-generator)
- [问题反馈](https://github.com/Mo520/vite-plugin-ai/issues)
