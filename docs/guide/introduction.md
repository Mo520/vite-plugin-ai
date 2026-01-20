# 介绍

AI Vite Plugins 是一套强大的 AI 驱动的 Vite 插件集合，旨在通过自动化和智能化提升开发效率。

## 什么是 AI Vite Plugins？

AI Vite Plugins 是一个 Monorepo 项目，包含多个独立的 Vite 插件，每个插件都利用 AI 技术解决特定的开发问题：

- **AI 国际化** - 自动扫描、翻译和管理多语言文件
- **AI Mock 生成器** - 生成真实的测试数据
- **AI 代码审查** - 自动分析代码质量和潜在问题
- **AI 智能诊断** - 智能分析和修复构建错误
- **AI 性能分析** - 分析和优化构建性能

## 核心特性

### 🤖 AI 驱动

所有插件都集成了 OpenAI API，提供智能化的功能：

- 自然语言翻译
- 代码质量分析
- 错误诊断和修复建议
- 性能优化建议

### ⚡ 高性能

- 基于 Turborepo 的 Monorepo 架构
- 支持增量构建和缓存
- 与 Vite HMR 完美集成

### 📦 模块化设计

- 每个插件独立发布到 npm
- 按需安装，不会增加不必要的依赖
- 统一的 API 设计，易于学习和使用

### 🎯 类型安全

- 完整的 TypeScript 支持
- 详细的类型定义
- 智能的代码提示

## 适用场景

### 国际化项目

如果你的项目需要支持多语言，AI 国际化插件可以：

- 自动扫描代码中的中文文本
- 使用 AI 翻译到目标语言
- 自动生成和更新语言文件
- 支持增量更新

### 前端开发

在前端开发过程中，AI Mock 生成器可以：

- 快速生成测试数据
- 模拟后端 API
- 支持复杂的数据结构
- 提供真实的业务数据

### 代码质量管理

AI 代码审查插件帮助你：

- 发现潜在的安全问题
- 识别性能瓶颈
- 检查代码风格
- 提供最佳实践建议

### 构建优化

AI 性能分析插件可以：

- 分析打包体积
- 识别大型依赖
- 提供优化建议
- 跟踪性能历史

## 技术栈

- **构建工具**: Vite 5.x
- **包管理**: pnpm + Turborepo
- **插件打包**: tsup (快速的 TypeScript 打包工具)
- **语言**: TypeScript 5.x
- **AI 框架**: LangChain + LangGraph
- **AI 服务**: OpenAI API
- **版本管理**: Changesets

## AI 技术架构

本项目使用 **LangChain** 框架来构建 AI 功能：

- **LangChain Core** - 提供核心的 AI 抽象和工具
- **LangGraph** - 用于构建复杂的 AI 工作流（如智能诊断）
- **OpenAI Integration** - 与 OpenAI API 的无缝集成

这使得插件能够：

- 灵活切换不同的 AI 模型
- 构建复杂的 AI 工作流
- 更好的错误处理和重试机制
- 支持流式响应和批处理

## 开源协议

MIT License - 可以自由使用、修改和分发。

## 贡献

欢迎贡献代码、报告问题或提出建议！

- [GitHub 仓库](https://github.com/Mo520/vite-plugin-ai)
- [问题反馈](https://github.com/Mo520/vite-plugin-ai/issues)
- [讨论区](https://github.com/Mo520/vite-plugin-ai/discussions)
