/**
 * 代码验证器
 */

export class CodeValidator {
  static isValidCode(code: string): boolean {
    if (!code || code.trim().length === 0) {
      return false;
    }

    const chineseChars = code.match(/[\u4e00-\u9fa5]/g);
    const totalChars = code.length;
    const chineseRatio = chineseChars ? chineseChars.length / totalChars : 0;

    if (chineseRatio > 0.3) {
      console.warn(
        `⚠️  代码中中文字符比例过高: ${(chineseRatio * 100).toFixed(1)}%`
      );
      return false;
    }

    const explanationKeywords = [
      "修复说明",
      "修复步骤",
      "主要修改",
      "注意事项",
      "修复方案",
      "问题分析",
      "以下是修复",
      "修复后的代码如下",
    ];

    for (const keyword of explanationKeywords) {
      if (code.includes(keyword)) {
        console.warn(`⚠️  代码中包含解释性文本: "${keyword}"`);
        return false;
      }
    }

    return true;
  }

  static calculateSimilarity(code1: string, code2: string): number {
    const lines1 = code1.split("\n");
    const lines2 = code2.split("\n");

    let sameLines = 0;
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
      if (lines1[i].trim() === lines2[i].trim()) {
        sameLines++;
      }
    }

    return sameLines / maxLines;
  }

  static validateFix(
    originalCode: string,
    fixedCode: string
  ): { valid: boolean; reason?: string } {
    if (!fixedCode || fixedCode.trim().length === 0) {
      return { valid: false, reason: "修复后的代码为空" };
    }

    if (!this.isValidCode(fixedCode)) {
      return { valid: false, reason: "修复后的代码包含过多解释性文本" };
    }

    const lengthRatio = fixedCode.length / originalCode.length;
    if (lengthRatio < 0.5 || lengthRatio > 2) {
      return {
        valid: false,
        reason: `代码长度变化异常: ${(lengthRatio * 100).toFixed(0)}%（原始: ${
          originalCode.length
        }, 修复后: ${fixedCode.length}）`,
      };
    }

    const originalLines = originalCode.split("\n").length;
    const fixedLines = fixedCode.split("\n").length;
    const lineRatio = fixedLines / originalLines;

    if (lineRatio < 0.7 || lineRatio > 1.5) {
      return {
        valid: false,
        reason: `代码行数变化异常: ${(lineRatio * 100).toFixed(
          0
        )}%（原始: ${originalLines} 行, 修复后: ${fixedLines} 行）`,
      };
    }

    const similarity = this.calculateSimilarity(originalCode, fixedCode);
    if (similarity < 0.3) {
      return {
        valid: false,
        reason: `代码相似度过低: ${(similarity * 100).toFixed(0)}%`,
      };
    }

    return { valid: true };
  }
}
