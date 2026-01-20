# AI Vite Plugins 文档

## 本地开发

```bash
# 安装依赖
cd docs
pnpm install

# 启动开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## 部署

### Vercel

1. 导入 GitHub 仓库
2. 设置构建命令: `cd docs && pnpm install && pnpm docs:build`
3. 设置输出目录: `docs/.vitepress/dist`

### Netlify

1. 导入 GitHub 仓库
2. 设置构建命令: `cd docs && pnpm install && pnpm docs:build`
3. 设置发布目录: `docs/.vitepress/dist`

### GitHub Pages

使用 GitHub Actions 自动部署（见 `.github/workflows/deploy-docs.yml`）
