import { defineConfig } from "vitepress";

export default defineConfig({
  title: "AI Vite Plugins",
  description: "一套强大的 AI 驱动的 Vite 插件集合",
  lang: "zh-CN",
  base: "/vite-plugin-ai/", // GitHub Pages 部署路径

  head: [
    ["link", { rel: "icon", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#646cff" }],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "指南", link: "/guide/introduction" },
      { text: "插件", link: "/plugins/ai-i18n" },
      {
        text: "GitHub",
        link: "https://github.com/Mo520/vite-plugin-ai",
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "开始",
          items: [
            { text: "介绍", link: "/guide/introduction" },
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "配置", link: "/guide/configuration" },
            { text: "技术架构", link: "/guide/architecture" },
          ],
        },
      ],
      "/plugins/": [
        {
          text: "插件列表",
          items: [
            { text: "AI 国际化", link: "/plugins/ai-i18n" },
            { text: "AI Mock 生成器", link: "/plugins/ai-mock-generator" },
            { text: "AI 代码审查", link: "/plugins/ai-code-review" },
            { text: "AI 智能诊断", link: "/plugins/ai-diagnostic" },
            { text: "AI 性能分析", link: "/plugins/ai-perf-analyzer" },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Mo520/vite-plugin-ai",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Haihui Mo",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/Mo520/vite-plugin-ai/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    lastUpdated: {
      text: "最后更新",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      label: "页面导航",
      level: [2, 3],
    },
  },

  markdown: {
    lineNumbers: true,
  },
});
