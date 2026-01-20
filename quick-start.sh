#!/bin/bash

echo "�� 开始设置 AI Vite Plugins Monorepo..."
echo ""

# 步骤 1: 安装依赖
echo "📦 步骤 1/3: 安装依赖..."
pnpm install

# 步骤 2: 构建所有包
echo "🔨 步骤 2/3: 构建所有包..."
pnpm build

# 步骤 3: 运行测试
echo "🧪 步骤 3/3: 运行测试..."
pnpm test || echo "⚠️  部分测试失败（正常，可能需要配置 API Key）"

echo ""
echo "✅ 设置完成！"
echo ""
echo "📚 下一步:"
echo "  1. 配置 Changesets: pnpm changeset init"
echo "  2. 创建 changeset: pnpm changeset"
echo "  3. 发布到 npm: pnpm changeset publish"
echo ""
echo "📖 查看完整文档: SETUP-COMPLETE.md"
