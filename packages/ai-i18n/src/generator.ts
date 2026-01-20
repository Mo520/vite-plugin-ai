/**
 * i18n 语言文件生成器
 */

import fs from "fs";
import path from "path";
import pc from "picocolors";

export interface GeneratorOptions {
  localesDir: string;
  defaultLocale: string;
}

export class I18nGenerator {
  private options: GeneratorOptions;

  constructor(options: GeneratorOptions) {
    this.options = options;
  }

  /**
   * 生成语言文件
   */
  async generate(texts: Map<string, string[]>, locale: string): Promise<void> {
    const { localesDir } = this.options;

    // 确保目录存在
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    // 读取现有文件
    const filePath = path.join(localesDir, `${locale}.json`);
    let existing: Record<string, string> = {};

    if (fs.existsSync(filePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.warn(pc.yellow(`⚠️  无法解析现有语言文件: ${filePath}`));
      }
    }

    // 生成新的翻译对象
    const translations: Record<string, string> = { ...existing };
    let newCount = 0;

    for (const [file, fileTexts] of texts) {
      for (const text of fileTexts) {
        const key = this.generateKey(text);
        if (!translations[key]) {
          translations[key] = text;
          newCount++;
        }
      }
    }

    // 按 key 排序
    const sorted = Object.keys(translations)
      .sort()
      .reduce((obj, key) => {
        obj[key] = translations[key];
        return obj;
      }, {} as Record<string, string>);

    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), "utf-8");

    console.log(pc.green(`✅ 已更新 ${pc.cyan(locale)} 语言文件: ${pc.gray(filePath)}`));
    if (newCount > 0) {
      console.log(pc.gray(`   新增 ${pc.yellow(newCount.toString())} 条翻译`));
    }
  }

  /**
   * 生成语言文件（用于目标语言）- 支持增量翻译
   */
  async generateTranslated(
    originalTexts: Map<string, string[]>,
    translations: Map<string, Map<string, string>>,
    locale: string,
  ): Promise<void> {
    const { localesDir } = this.options;

    // 确保目录存在
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    // 读取现有文件
    const filePath = path.join(localesDir, `${locale}.json`);
    let existing: Record<string, string> = {};

    if (fs.existsSync(filePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.warn(pc.yellow(`⚠️  无法解析现有语言文件: ${filePath}`));
      }
    }

    // 生成新的翻译对象（保留已有翻译）
    const translationsObj: Record<string, string> = { ...existing };
    let newCount = 0;
    let skippedCount = 0;

    for (const [file, textMap] of translations) {
      for (const [originalText, translatedText] of textMap) {
        const key = this.generateKey(originalText);
        if (!translationsObj[key]) {
          translationsObj[key] = translatedText;
          newCount++;
        } else {
          skippedCount++;
        }
      }
    }

    // 按 key 排序
    const sorted = Object.keys(translationsObj)
      .sort()
      .reduce((obj, key) => {
        obj[key] = translationsObj[key];
        return obj;
      }, {} as Record<string, string>);

    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), "utf-8");

    console.log(pc.green(`✅ 已更新 ${pc.cyan(locale)} 语言文件: ${pc.gray(filePath)}`));
    if (newCount > 0) {
      console.log(pc.gray(`   ✨ 新增 ${pc.yellow(newCount.toString())} 条翻译`));
    }
    if (skippedCount > 0) {
      console.log(pc.gray(`   ⏭️  跳过 ${pc.blue(skippedCount.toString())} 条已有翻译`));
    }
  }

  /**
   * 加载已有翻译
   */
  loadExistingTranslations(locale: string): Record<string, string> {
    const { localesDir } = this.options;
    const filePath = path.join(localesDir, `${locale}.json`);

    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.warn(pc.yellow(`⚠️  无法解析现有语言文件: ${filePath}`));
      }
    }

    return {};
  }

  /**
   * 生成翻译 key
   */
  private generateKey(text: string): string {
    // 使用拼音首字母或简化文本作为 key
    // 这里使用简单的哈希方式
    const cleaned = text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();

    // 截取前 30 个字符
    const truncated = cleaned.slice(0, 30);

    // 如果太短，添加哈希后缀
    if (truncated.length < 3) {
      const hash = this.simpleHash(text);
      return `text_${hash}`;
    }

    return truncated;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(0, 6);
  }
}
