#!/bin/bash

echo "🚀 启动 AI Vite Plugins 文档站点..."

# 进入 docs 目录
cd docs

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  pnpm install
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
pnpm docs:dev
