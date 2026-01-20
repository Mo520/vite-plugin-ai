#!/bin/bash

echo "📦 构建 AI Vite Plugins 文档站点..."

# 进入 docs 目录
cd docs

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建文档
echo "🔨 构建文档..."
pnpm docs:build

echo "✅ 构建完成！"
echo "📁 输出目录: docs/.vitepress/dist"
echo ""
echo "预览构建结果:"
echo "  pnpm docs:preview"
