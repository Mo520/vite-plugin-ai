# uni-app 迁移到 Vue 3 说明

## 已完成的修改

### 1. 依赖更新

- ✅ 移除所有 `@dcloudio/*` 相关依赖
- ✅ 添加 `vue-router` 用于路由管理
- ✅ 添加 `@vitejs/plugin-vue` 用于 Vue 3 支持

### 2. 配置文件

- ✅ `vite.config.ts`: 移除 uni 插件，改用标准 Vue 插件
- ✅ `tsconfig.json`: 移除 uni-app 类型定义
- ✅ `package.json`: 更新脚本命令为标准 Vue 项目命令

### 3. 源代码

- ✅ `src/main.ts`: 从 SSR 模式改为标准 SPA 模式
- ✅ `src/App.vue`: 移除 uni-app 生命周期，添加 router-view
- ✅ `src/i18n/index.ts`: localStorage 替代 uni.setStorageSync
- ✅ `src/router/index.ts`: 新建 Vue Router 配置

### 4. 页面组件

- ✅ 所有 `<view>` 标签替换为 `<div>`
- ✅ 所有 `<text>` 标签替换为 `<p>` 或 `<h1>`
- ✅ 所有 `<scroll-view>` 替换为 `<div>`
- ✅ `uni.navigateTo()` 替换为 `router.push()`
- ✅ `uni.navigateBack()` 替换为 `router.back()`
- ✅ `uni.showToast()` 替换为 `alert()` (可后续优化)

### 5. 删除的文件

- ✅ `src/pages.json` (uni-app 页面配置)
- ✅ `src/manifest.json` (uni-app 应用配置)

## 路由映射

| 原 uni-app 路径               | 新 Vue Router 路径 |
| ----------------------------- | ------------------ |
| /pages/index/index            | /                  |
| /pages/hosd/index             | /hosd              |
| /pages/code-review-test/index | /code-review-test  |
| /pages/mock-test/index        | /mock-test         |

## 下一步操作

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 构建生产版本

```bash
pnpm build
```

### 4. 预览生产构建

```bash
pnpm preview
```

## 建议的后续优化

1. **UI 提示组件**: 将 `alert()` 替换为更好的 Toast 组件库（如 Element Plus、Ant Design Vue 等）

2. **样式优化**: 检查并调整页面样式，确保在标准浏览器中显示正常

3. **响应式设计**: 添加媒体查询，优化移动端和桌面端体验

4. **状态管理**: 如果需要，可以添加 Pinia 进行状态管理

5. **API 请求**: 考虑使用 axios 或其他 HTTP 客户端库统一管理 API 请求

## 注意事项

- 所有 AI 插件功能保持不变
- Monorepo 结构保持不变
- 所有 packages 包不受影响
- 仅主应用从 uni-app 迁移到标准 Vue 3
