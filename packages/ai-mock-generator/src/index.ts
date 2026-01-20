/**
 * AI Mock Generator - Vite 插件入口
 */

import type { Plugin } from 'vite';
import type { MockGeneratorOptions, TypeDefinition } from './types';
import { MockStorage } from './storage';
import { MockDataGenerator } from './generator';
import { MockServer } from './server';

export function vitePluginAIMockGenerator(
  options: MockGeneratorOptions = {}
): Plugin {
  const {
    apiKey = process.env.OPENAI_API_KEY || '',
    apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
    model = process.env.OPENAI_MODEL || 'gpt-4',
    enabled = true,
    autoGenerate = false,
    generation = {
      locale: 'zh-CN',
      count: 20,
      quality: 'balanced',
    },
    storage: storageOptions = {
      dir: 'mock-data',
      persist: true,
      cache: true,
    },
    output = {
      console: true,
      logs: false,
    },
  } = options;

  // 如果未启用，返回空插件
  if (!enabled) {
    return {
      name: 'vite-plugin-ai-mock-generator',
    };
  }

  // 初始化组件
  const storage = new MockStorage(storageOptions);
  const generator = new MockDataGenerator({ apiKey, apiUrl, model });
  const server = new MockServer(storage, options);

  return {
    name: 'vite-plugin-ai-mock-generator',
    enforce: 'pre',

    configResolved(config) {
      if (output.console) {
        console.log('\n🤖 AI Mock Generator 已启动');
        console.log(`📂 存储目录: ${storageOptions.dir}`);
        console.log(`🌍 数据语言: ${generation.locale}`);
        console.log(`📊 默认数量: ${generation.count}`);
        console.log(`🔑 API Key: ${apiKey ? '已配置' : '未配置'}`);
        console.log(
          `📍 端点数量: ${options.endpoints?.length || 0}`
        );
      }
    },

    async buildStart() {
      // 如果启用自动生成
      if (autoGenerate && options.endpoints) {
        if (output.console) {
          console.log('\n🔄 开始自动生成 Mock 数据...\n');
        }

        for (const endpoint of options.endpoints) {
          // 检查是否已有数据
          const existingData = storage.get(endpoint.path, endpoint.method);
          if (existingData) {
            if (output.console) {
              console.log(
                `⏭️  跳过 ${endpoint.method} ${endpoint.path} (已有数据)`
              );
            }
            continue;
          }

          try {
            if (output.console) {
              console.log(`🎲 生成 ${endpoint.method} ${endpoint.path}...`);
            }

            // 解析类型定义
            const typeDefinition = parseTypeDefinition(endpoint.response);

            // 生成数据
            const count = endpoint.count || generation.count || 20;
            let data;
            
            // 根据质量设置选择生成方式
            if (generation.quality === 'fast') {
              // 使用基础生成器（不需要 AI）
              data = generator.generateBasic(typeDefinition, count);
            } else {
              // 使用 AI 生成
              data = await generator.generate({
                type: typeDefinition,
                count,
                locale: generation.locale || 'zh-CN',
                quality: generation.quality || 'balanced',
              });
            }

            // 存储数据
            storage.set(endpoint.path, endpoint.method, data, {
              type: endpoint.response as string,
            });

            if (output.console) {
              console.log(
                `✅ 已生成 ${count} 条数据: ${endpoint.method} ${endpoint.path}`
              );
            }
          } catch (error: any) {
            console.error(
              `❌ 生成失败 ${endpoint.method} ${endpoint.path}:`,
              error.message
            );
          }
        }

        if (output.console) {
          console.log('\n✨ Mock 数据生成完成\n');
        }
      }
    },

    configureServer(viteServer) {
      // 配置 Mock 服务器中间件
      server.configureServer(viteServer);
    },
  };
}

/**
 * 解析类型定义
 * 简化版本，实际应该使用 TypeScript Compiler API
 */
function parseTypeDefinition(typeStr: string | TypeDefinition): TypeDefinition {
  if (typeof typeStr === 'object') {
    return typeStr;
  }

  // 简单解析（实际应该更复杂）
  const isArray = typeStr.endsWith('[]');
  const typeName = isArray ? typeStr.slice(0, -2) : typeStr;

  // 返回基础类型定义
  return {
    name: typeName,
    properties: [],
    isArray,
  };
}

// 导出类型
export type { MockGeneratorOptions, EndpointConfig } from './types';
export { MockStorage } from './storage';
export { MockDataGenerator } from './generator';
export { MockServer } from './server';
