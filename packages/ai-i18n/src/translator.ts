/**
 * AI 翻译器
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import pc from "picocolors";

export interface TranslatorOptions {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export class I18nTranslator {
  private llm: ChatOpenAI | null = null;
  private options: TranslatorOptions;

  constructor(options: TranslatorOptions) {
    this.options = options;

    if (options.apiKey) {
      this.llm = new ChatOpenAI({
        openAIApiKey: options.apiKey,
        configuration: { baseURL: options.apiUrl },
        modelName: options.model,
        temperature: options.temperature ?? 0.3,
        maxTokens: options.maxTokens ?? 4000,
      });
    }
  }

  /**
   * 批量翻译文本 - 支持增量翻译（跳过已翻译的文本）
   */
  async translate(
    texts: Map<string, string[]>,
    sourceLocale: string,
    targetLocale: string,
    existingTranslations?: Record<string, string>,
  ): Promise<Map<string, Map<string, string>>> {
    if (!this.llm) {
      console.warn(pc.yellow("⚠️  未配置 API Key，跳过翻译"));
      // 返回原文作为翻译
      const results = new Map<string, Map<string, string>>();
      for (const [file, fileTexts] of texts) {
        const textMap = new Map<string, string>();
        fileTexts.forEach((text) => textMap.set(text, text));
        results.set(file, textMap);
      }
      return results;
    }

    const results = new Map<string, Map<string, string>>();
    const allTexts = Array.from(texts.values()).flat();
    const uniqueTexts = [...new Set(allTexts)];

    if (uniqueTexts.length === 0) return results;

    // 过滤出需要翻译的文本（未翻译的）
    const textsToTranslate: string[] = [];
    const cachedTranslations = new Map<string, string>();

    uniqueTexts.forEach((text) => {
      const key = this.generateKey(text);
      if (existingTranslations && existingTranslations[key]) {
        // 使用已有翻译
        cachedTranslations.set(text, existingTranslations[key]);
      } else {
        // 需要翻译
        textsToTranslate.push(text);
      }
    });

    console.log(pc.blue("📊 翻译统计:"));
    console.log(`   总计: ${pc.cyan(uniqueTexts.length.toString())} 条`);
    console.log(
      `   ✅ 已有: ${pc.green(cachedTranslations.size.toString())} 条`,
    );
    console.log(
      `   🆕 新增: ${pc.yellow(textsToTranslate.length.toString())} 条`,
    );

    try {
      // 只翻译新增的文本
      let newTranslations: string[] = [];
      if (textsToTranslate.length > 0) {
        console.log(pc.cyan(`\n🤖 正在翻译新增文本...`));
        newTranslations = await this.batchTranslate(
          textsToTranslate,
          sourceLocale,
          targetLocale,
        );
      }

      // 创建完整的翻译映射（原文 -> 译文）
      const translationMap = new Map<string, string>(cachedTranslations);
      textsToTranslate.forEach((text, index) => {
        translationMap.set(text, newTranslations[index] || text);
      });

      // 按文件组织翻译结果
      for (const [file, fileTexts] of texts) {
        const textMap = new Map<string, string>();
        fileTexts.forEach((text) => {
          textMap.set(text, translationMap.get(text) || text);
        });
        results.set(file, textMap);
      }

      return results;
    } catch (error: any) {
      console.error(pc.red("❌ 翻译失败:"), error.message);
      // 返回原文
      const results = new Map<string, Map<string, string>>();
      for (const [file, fileTexts] of texts) {
        const textMap = new Map<string, string>();
        fileTexts.forEach((text) => textMap.set(text, text));
        results.set(file, textMap);
      }
      return results;
    }
  }

  /**
   * 生成翻译 key（与 generator 保持一致）
   */
  private generateKey(text: string): string {
    const cleaned = text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();

    const truncated = cleaned.slice(0, 30);

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

  /**
   * 批量翻译（分批处理避免超限）
   */
  private async batchTranslate(
    texts: string[],
    sourceLocale: string,
    targetLocale: string,
  ): Promise<string[]> {
    const batchSize = 20;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const translated = await this.translateBatch(
        batch,
        sourceLocale,
        targetLocale,
      );
      results.push(...translated);

      // 显示进度
      const progress = Math.min(i + batchSize, texts.length);
      console.log(
        pc.gray(
          `  📊 翻译进度: ${pc.cyan(progress.toString())}/${pc.cyan(
            texts.length.toString(),
          )}`,
        ),
      );
    }

    return results;
  }

  /**
   * 翻译一批文本
   */
  private async translateBatch(
    texts: string[],
    sourceLocale: string,
    targetLocale: string,
  ): Promise<string[]> {
    const localeName = this.getLocaleName(targetLocale);

    const systemPrompt = new SystemMessage(
      `你是专业的软件本地化翻译专家。请将以下${this.getLocaleName(
        sourceLocale,
      )}文本翻译成${localeName}。
要求：
1. 保持专业术语的准确性
2. 翻译要自然流畅，符合目标语言习惯
3. 保留原文中的变量占位符（如 {name}、%s 等）
4. 每行一个翻译，与输入顺序严格对应
5. 只输出翻译结果，不要解释
6. 如果原文包含换行，翻译也保持相同的换行`,
    );

    const userPrompt = new HumanMessage(
      texts.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    );

    const response = await this.llm!.invoke([systemPrompt, userPrompt]);
    const content = response.content.toString();

    // 解析翻译结果
    const lines = content.split("\n").filter((l) => l.trim());
    const results: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      if (i < lines.length) {
        // 移除序号前缀
        const translated = lines[i].replace(/^\d+\.\s*/, "").trim();
        results.push(translated);
      } else {
        // 如果翻译结果不够，使用原文
        results.push(texts[i]);
      }
    }

    return results;
  }

  /**
   * 获取语言名称
   */
  private getLocaleName(locale: string): string {
    const names: Record<string, string> = {
      "zh-CN": "简体中文",
      "zh-TW": "繁体中文",
      "en-US": "英语",
      "ja-JP": "日语",
      "ko-KR": "韩语",
      "fr-FR": "法语",
      "de-DE": "德语",
      "es-ES": "西班牙语",
      "pt-BR": "葡萄牙语",
      "ru-RU": "俄语",
      "ar-SA": "阿拉伯语",
    };
    return names[locale] || locale;
  }
}
