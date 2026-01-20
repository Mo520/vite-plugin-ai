/**
 * 优化示例生成器
 */

import type {
  OptimizationExample,
  PerformanceIssue,
  DependencyInfo,
} from "./types";

export class OptimizationExamples {
  /**
   * 根据问题生成优化示例
   */
  generate(
    issues: PerformanceIssue[],
    duplicateDeps?: DependencyInfo[]
  ): OptimizationExample[] {
    const examples: OptimizationExample[] = [];

    // 代码分割示例
    if (issues.some((i) => i.type === "size")) {
      examples.push(this.getCodeSplittingExample());
    }

    // 重复依赖优化
    if (duplicateDeps && duplicateDeps.length > 0) {
      examples.push(this.getDependencyOptimizationExample(duplicateDeps));
    }

    // 压缩优化
    if (issues.some((i) => i.type === "optimization")) {
      examples.push(this.getCompressionExample());
    }

    // 图片优化
    if (issues.some((i) => i.description.includes("图片"))) {
      examples.push(this.getImageOptimizationExample());
    }

    // 动态导入
    if (issues.some((i) => i.type === "size" && i.severity === "high")) {
      examples.push(this.getDynamicImportExample());
    }

    // Tree-shaking 优化
    examples.push(this.getTreeShakingExample());

    return examples;
  }

  /**
   * 代码分割示例
   */
  private getCodeSplittingExample(): OptimizationExample {
    return {
      title: "配置代码分割",
      description: "将大文件拆分成多个小文件，提高加载性能",
      priority: "high",
      impact: "可减少 30-50% 的初始加载大小",
      difficulty: "简单",
      code: {
        language: "typescript",
        content: `// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 提取 Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // 提取 UI 组件库
          'ui-vendor': ['element-plus', '@element-plus/icons-vue'],
          
          // 提取工具库
          'utils': ['lodash-es', 'dayjs', 'axios'],
          
          // 提取图表库（如果使用）
          'charts': ['echarts', 'chart.js'],
        },
        
        // 自动分割大于 500KB 的文件
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return \`js/\${facadeModuleId}-[hash].js\`;
        },
      },
    },
    
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
});`,
      },
    };
  }

  /**
   * 重复依赖优化示例
   */
  private getDependencyOptimizationExample(
    duplicates: DependencyInfo[]
  ): OptimizationExample {
    const topDuplicates = duplicates.slice(0, 3).map((d) => d.name);

    return {
      title: "优化重复依赖",
      description: `检测到 ${duplicates.length} 个重复打包的依赖，建议提取到公共 chunk`,
      priority: "high",
      impact: `可减少 ${(
        duplicates.reduce((sum, d) => sum + d.size, 0) /
        1024 /
        1024
      ).toFixed(2)}MB`,
      difficulty: "简单",
      code: {
        language: "typescript",
        content: `// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 提取重复依赖到公共 chunk
          'common-vendor': [
            ${topDuplicates.map((name) => `'${name}'`).join(",\n            ")}
          ],
        },
      },
    },
  },
  
  // 或者使用自动分割策略
  optimizeDeps: {
    include: [
      ${topDuplicates.map((name) => `'${name}'`).join(",\n      ")}
    ],
  },
});`,
      },
      relatedFiles: duplicates.flatMap((d) => d.usedBy).slice(0, 5),
    };
  }

  /**
   * 压缩优化示例
   */
  private getCompressionExample(): OptimizationExample {
    return {
      title: "启用 Gzip/Brotli 压缩",
      description: "使用压缩插件减少传输大小",
      priority: "medium",
      impact: "可减少 60-70% 的传输大小",
      difficulty: "简单",
      code: {
        language: "bash",
        content: `# 1. 安装压缩插件
npm install vite-plugin-compression -D

# 2. 配置插件
# vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 大于 10KB 才压缩
      deleteOriginFile: false,
    }),
    
    // Brotli 压缩（可选，压缩率更高）
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
});

# 3. Nginx 配置（服务器端）
# nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;`,
      },
    };
  }

  /**
   * 图片优化示例
   */
  private getImageOptimizationExample(): OptimizationExample {
    return {
      title: "优化图片资源",
      description: "压缩图片并转换为现代格式",
      priority: "medium",
      impact: "可减少 50-80% 的图片大小",
      difficulty: "简单",
      code: {
        language: "bash",
        content: `# 1. 安装图片优化插件
npm install vite-plugin-imagemin -D

# 2. 配置插件
# vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      // GIF 优化
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      
      // PNG 优化
      optipng: {
        optimizationLevel: 7,
      },
      
      // JPEG 优化
      mozjpeg: {
        quality: 80,
      },
      
      // SVG 优化
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
      
      // WebP 转换
      webp: {
        quality: 80,
      },
    }),
  ],
});

# 3. 使用 WebP 格式（HTML）
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="description">
</picture>`,
      },
    };
  }

  /**
   * 动态导入示例
   */
  private getDynamicImportExample(): OptimizationExample {
    return {
      title: "使用动态导入（懒加载）",
      description: "按需加载组件和路由，减少初始加载大小",
      priority: "high",
      impact: "可减少 40-60% 的初始加载大小",
      difficulty: "中等",
      code: {
        language: "typescript",
        content: `// 1. 路由懒加载
// router/index.ts
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    // 使用动态导入
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
  },
];

// 2. 组件懒加载
// App.vue
<script setup>
import { defineAsyncComponent } from 'vue';

// 异步组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);

// 带加载状态的异步组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./components/AsyncComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000,
});
</script>

// 3. 条件加载
<script setup>
const loadCharts = async () => {
  if (needCharts) {
    const { default: ECharts } = await import('echarts');
    // 使用 ECharts
  }
};
</script>`,
      },
    };
  }

  /**
   * Tree-shaking 优化示例
   */
  private getTreeShakingExample(): OptimizationExample {
    return {
      title: "优化 Tree-shaking",
      description: "确保未使用的代码被正确移除",
      priority: "medium",
      impact: "可减少 10-30% 的代码大小",
      difficulty: "中等",
      code: {
        language: "typescript",
        content: `// 1. 使用 ES6 模块导入（支持 tree-shaking）
// ❌ 不推荐
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ 推荐
import { debounce } from 'lodash-es';
const result = debounce(fn, 300);

// 2. 配置 package.json
{
  "sideEffects": false,  // 标记为无副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}

// 3. Vite 配置
// vite.config.ts
export default defineConfig({
  build: {
    // 启用 tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除特定函数
      },
    },
  },
});

// 4. 避免副作用导入
// ❌ 不推荐（会导入整个模块）
import 'some-library';

// ✅ 推荐（明确导入需要的部分）
import { specificFunction } from 'some-library';`,
      },
    };
  }
}
