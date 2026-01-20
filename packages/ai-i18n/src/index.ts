/**
 * AI 国际化助手插件入口
 *
 * 功能：
 * - 扫描源码中的中文文本
 * - 使用 AI 自动翻译
 * - 生成/更新 i18n 语言文件
 */

import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { I18nScanner } from "./scanner";
import { I18nTranslator } from "./translator";
import { I18nGenerator } from "./generator";

export interface I18nPluginOptions {
  // AI 配置
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  // 扫描配置
  include?: string[];
  exclude?: string[];
  // 输出配置
  localesDir?: string;
  defaultLocale?: string;
  targetLocales?: string[];
  // 功能开关
  autoScan?: boolean;
  autoTranslate?: boolean;
}

export function vitePluginAII18n(options: I18nPluginOptions = {}): Plugin {
  const {
    apiKey = process.env.OPENAI_API_KEY || "",
    apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1",
    model = "gpt-4",
    include = ["src/**/*.vue", "src/**/*.ts"],
    exclude = ["node_modules/**", "dist/**"],
    localesDir = "src/locales",
    defaultLocale = "zh-CN",
    targetLocales = ["en-US"],
    autoScan = true,
    autoTranslate = true,
  } = options;

  const scanner = new I18nScanner({ include, exclude });
  const translator = new I18nTranslator({ apiKey, apiUrl, model });
  const generator = new I18nGenerator({ localesDir, defaultLocale });

  let scannedTexts: Map<string, string[]> = new Map();

  return {
    name: "vite-plugin-ai-i18n",
    enforce: "pre",

    configResolved(config) {
      // 🔥 关键：在最早期就创建空文件，确保 TypeScript 编译时文件存在
      const fullLocalesDir = path.resolve(config.root, localesDir);

      // 确保目录存在
      if (!fs.existsSync(fullLocalesDir)) {
        fs.mkdirSync(fullLocalesDir, { recursive: true });
      }

      // 为所有语言创建空文件（如果不存在）
      const allLocales = [defaultLocale, ...targetLocales];
      for (const locale of allLocales) {
        const filePath = path.join(fullLocalesDir, `${locale}.json`);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, "{}", "utf-8");
          console.log(
            pc.green(
              `✅ 已生成 ${pc.cyan(locale)} 语言文件: ${pc.gray(
                `src\\locales\\${locale}.json`,
              )}`,
            ),
          );
        }
      }

      console.log(pc.cyan("\n🌍 AI 国际化助手已启动..."));
      console.log(`📂 语言文件目录: ${pc.yellow(localesDir)}`);
      console.log(`🔤 默认语言: ${pc.cyan(defaultLocale)}`);
      console.log(`🎯 目标语言: ${pc.cyan(targetLocales.join(", "))}`);
      console.log(`🔍 自动扫描: ${autoScan ? pc.green("✅") : pc.red("❌")}`);
      console.log(
        `🤖 自动翻译: ${autoTranslate ? pc.green("✅") : pc.red("❌")}`,
      );
      console.log(
        `🔑 API Key: ${apiKey ? pc.green("已配置") : pc.yellow("未配置")}\n`,
      );
    },

    async buildStart() {
      if (!autoScan) return;

      console.log(pc.cyan("🔍 正在扫描中文文本...\n"));
      scannedTexts = await scanner.scan();

      const totalTexts = Array.from(scannedTexts.values()).flat().length;
      console.log(
        pc.blue(`📝 发现 ${pc.yellow(totalTexts.toString())} 条待翻译文本\n`),
      );

      if (totalTexts === 0) return;

      // 生成默认语言文件
      await generator.generate(scannedTexts, defaultLocale);

      // 自动翻译到目标语言
      if (autoTranslate && apiKey) {
        for (const locale of targetLocales) {
          console.log(pc.cyan(`\n🌐 正在翻译到 ${pc.yellow(locale)}...`));

          // 读取已有翻译
          const existingTranslations =
            generator.loadExistingTranslations(locale);

          const translations = await translator.translate(
            scannedTexts,
            defaultLocale,
            locale,
            existingTranslations,
          );
          await generator.generateTranslated(
            scannedTexts,
            translations,
            locale,
          );
        }
      }

      console.log(pc.green("\n✨ 国际化处理完成\n"));
    },

    // 监听文件变化，增量更新
    async handleHotUpdate({ file, server }) {
      if (!autoScan) return;
      if (!file.match(/\.(vue|ts|tsx)$/)) return;
      if (file.includes("node_modules") || file.includes(localesDir)) return;

      console.log(`\n🔄 检测到文件变化: ${file}`);
      const texts = scanner.scanFile(file);

      if (texts.length > 0) {
        console.log(`📝 发现 ${texts.length} 条新文本`);
        scannedTexts.set(file, texts);

        // 更新语言文件
        await generator.generate(scannedTexts, defaultLocale);

        if (autoTranslate && apiKey) {
          for (const locale of targetLocales) {
            const fileTextsMap = new Map([[file, texts]]);

            // 读取已有翻译
            const existingTranslations =
              generator.loadExistingTranslations(locale);

            const translations = await translator.translate(
              fileTextsMap,
              defaultLocale,
              locale,
              existingTranslations,
            );
            await generator.generateTranslated(
              fileTextsMap,
              translations,
              locale,
            );
          }
        }
      }
    },
  };
}
