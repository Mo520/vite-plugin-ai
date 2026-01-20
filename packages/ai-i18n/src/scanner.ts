/**
 * 中文文本扫描器
 */

import fs from "fs";
import path from "path";
import { glob } from "./utils";

export interface ScannerOptions {
  include: string[];
  exclude: string[];
  debug?: boolean; // 调试模式
}

export class I18nScanner {
  private options: ScannerOptions;

  // 匹配中文字符的正则
  private chineseRegex = /[\u4e00-\u9fa5]+[^\n<>{}]*[\u4e00-\u9fa5]*/g;

  // 需要忽略的模式
  private ignorePatterns = [
    /console\.(log|warn|error|info)/,
    /\/\/.*$/,
    /\/\*[\s\S]*?\*\//,
    /<!--[\s\S]*?-->/,
  ];

  constructor(options: ScannerOptions) {
    this.options = options;
  }

  /**
   * 扫描所有匹配的文件
   */
  async scan(): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>();
    const files = await glob(this.options.include, this.options.exclude);

    for (const file of files) {
      const texts = this.scanFile(file);
      if (texts.length > 0) {
        results.set(file, texts);
      }
    }

    return results;
  }

  /**
   * 扫描单个文件
   */
  scanFile(filePath: string): string[] {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath);

    let texts: string[] = [];

    if (ext === ".vue") {
      texts = this.scanVueFile(content);
    } else if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
      texts = this.scanScriptFile(content);
    }

    // 使用 Set 去重并过滤（性能优化）
    const uniqueTexts = new Set(texts);
    return Array.from(uniqueTexts).filter((t) => this.isValidText(t));
  }

  /**
   * 扫描 Vue 文件
   */
  private scanVueFile(content: string): string[] {
    const texts: string[] = [];

    // 扫描 template 部分
    const templateMatch = content.match(
      /<template[^>]*>([\s\S]*?)<\/template>/
    );
    if (templateMatch) {
      texts.push(...this.extractChineseFromTemplate(templateMatch[1]));
    }

    // 扫描 script 部分
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      texts.push(...this.extractChineseFromScript(scriptMatch[1]));
    }

    return texts;
  }

  /**
   * 扫描脚本文件
   */
  private scanScriptFile(content: string): string[] {
    return this.extractChineseFromScript(content);
  }

  /**
   * 安全地移除注释（不影响字符串中的内容）
   */
  private removeComments(code: string): string {
    let result = "";
    let inString = false;
    let stringChar = "";
    let inBlockComment = false;
    let inLineComment = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1];
      const prevChar = code[i - 1];

      // 处理字符串
      if (!inBlockComment && !inLineComment) {
        if (
          (char === '"' || char === "'" || char === "`") &&
          prevChar !== "\\"
        ) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
      }

      // 在字符串中，保留所有字符
      if (inString) {
        result += char;
        continue;
      }

      // 处理块注释
      if (char === "/" && nextChar === "*" && !inLineComment) {
        inBlockComment = true;
        i++; // 跳过 *
        continue;
      }
      if (char === "*" && nextChar === "/" && inBlockComment) {
        inBlockComment = false;
        i++; // 跳过 /
        continue;
      }

      // 处理行注释
      if (char === "/" && nextChar === "/" && !inBlockComment) {
        inLineComment = true;
        i++; // 跳过第二个 /
        continue;
      }
      if (char === "\n" && inLineComment) {
        inLineComment = false;
        result += char;
        continue;
      }

      // 跳过注释内容
      if (inBlockComment || inLineComment) {
        continue;
      }

      result += char;
    }

    return result;
  }

  /**
   * 从模板中提取中文
   */
  private extractChineseFromTemplate(template: string): string[] {
    const texts: string[] = [];

    // 移除注释
    let cleaned = template.replace(/<!--[\s\S]*?-->/g, "");

    // 1. 提取 t() 或 $t() 函数中的文本（这些是需要翻译的 key）
    const tFunctionRegex = /(?:\$t|\bt)\s*\(\s*["']([^"']+)["']\s*\)/g;
    let match;
    while ((match = tFunctionRegex.exec(cleaned)) !== null) {
      const text = match[1];
      if (/[\u4e00-\u9fa5]/.test(text)) {
        texts.push(text);
      }
    }

    // 2. 提取标签内的纯文本（不包含插值表达式）
    const tagTextRegex = />([^<{]+)</g;
    while ((match = tagTextRegex.exec(cleaned)) !== null) {
      const text = match[1].trim();
      if (text && /[\u4e00-\u9fa5]/.test(text)) {
        texts.push(text);
      }
    }

    // 3. 提取插值中的字符串字面量（不包括 t() 调用）
    const interpolationRegex = /\{\{\s*["']([^"']+)["']\s*\}\}/g;
    while ((match = interpolationRegex.exec(cleaned)) !== null) {
      const text = match[1];
      if (/[\u4e00-\u9fa5]/.test(text)) {
        texts.push(text);
      }
    }

    // 4. 提取静态属性中的中文
    const staticAttrRegex =
      /(?:placeholder|title|label|alt|content|aria-label)=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/g;
    while ((match = staticAttrRegex.exec(cleaned)) !== null) {
      texts.push(match[1]);
    }

    return texts;
  }

  /**
   * 从脚本中提取中文
   */
  private extractChineseFromScript(script: string): string[] {
    const texts: string[] = [];

    // 安全地移除注释
    const cleaned = this.removeComments(script);

    // 1. 提取 t() 函数中的文本（这些是需要翻译的 key）
    const tFunctionRegex = /\bt\s*\(\s*["']([^"']+)["']\s*\)/g;
    let match;
    while ((match = tFunctionRegex.exec(cleaned)) !== null) {
      const text = match[1];
      if (/[\u4e00-\u9fa5]/.test(text)) {
        texts.push(text);
      }
    }

    // 2. 提取所有字符串字面量（不在 t() 中的）
    const allStrings: string[] = [];

    // 单引号字符串
    const singleQuoteRegex = /'([^'\\]*(\\.[^'\\]*)*)'/g;
    while ((match = singleQuoteRegex.exec(cleaned)) !== null) {
      allStrings.push(match[1]);
    }

    // 双引号字符串
    const doubleQuoteRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
    while ((match = doubleQuoteRegex.exec(cleaned)) !== null) {
      allStrings.push(match[1]);
    }

    // 模板字符串（简单情况，不包含插值）
    const templateRegex = /`([^`$\\]*(\\.[^`$\\]*)*)`/g;
    while ((match = templateRegex.exec(cleaned)) !== null) {
      allStrings.push(match[1]);
    }

    // 3. 过滤出包含中文的字符串
    for (const str of allStrings) {
      if (/[\u4e00-\u9fa5]/.test(str)) {
        texts.push(str);
      }
    }

    return texts;
  }

  /**
   * 验证文本是否有效
   */
  private isValidText(text: string): boolean {
    const debug = this.options.debug;

    // 1. 基础过滤
    if (text.length < 2) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 文本太短`);
      return false;
    }

    if (!/[\u4e00-\u9fa5]/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 不包含中文`);
      return false;
    }

    if (/^\s*$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 纯空格`);
      return false;
    }

    // 2. 过滤 i18n 相关
    if (/^\$t\(|^t\(|^i18n\.|_uni_app$|^[a-z_]+_[a-z_]+$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: i18n key`);
      return false;
    }

    // 3. 过滤系统提示信息
    if (/^[⚠️❌✅🔍📝💡🎯🚀🔧📊]/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 系统提示`);
      return false;
    }

    // 4. 过滤技术术语
    if (
      /\.(json|js|ts|vue|md|txt|html|css|jsx|tsx)\s*(文件|不存在|已|错误)/.test(
        text
      )
    ) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 技术术语`);
      return false;
    }

    if (/^[a-zA-Z0-9_\-\.]+\s*(文件|不存在|错误|失败)/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 技术错误信息`);
      return false;
    }

    // 5. 过滤变量名和路径
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 变量名`);
      return false;
    }

    if (/^\/[a-zA-Z0-9_\-\/]*$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 路径`);
      return false;
    }

    // 6. 过滤 URL 和邮箱
    if (/^https?:\/\//.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: URL`);
      return false;
    }

    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 邮箱`);
      return false;
    }

    // 7. 过滤纯数字和日期
    if (/^\d+$/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 纯数字`);
      return false;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 日期`);
      return false;
    }

    // 8. 过滤代码片段
    if (
      /^(const|let|var|function|class|import|export|return)\s/.test(text)
    ) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 代码片段`);
      return false;
    }

    // 9. 过滤过长的文本（可能是代码）
    if (text.length > 100) {
      if (debug) console.log(`[过滤] "${text}" - 原因: 文本过长`);
      return false;
    }

    // 10. 过滤包含特殊字符过多的文本
    const specialCharCount = (
      text.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：""''（）《》]/g) || []
    ).length;
    if (specialCharCount > text.length * 0.3) {
      if (debug)
        console.log(`[过滤] "${text}" - 原因: 特殊字符过多 (${specialCharCount})`);
      return false;
    }

    if (debug) console.log(`[保留] "${text}"`);
    return true;
  }
}
