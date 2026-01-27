/**
 * AI 代码审查器
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import crypto from "crypto";

export interface ReviewIssue {
  file: string;
  line?: number;
  category: "security" | "performance" | "style" | "best-practice";
  severity: "error" | "warn" | "info";
  message: string;
  suggestion?: string;
  code?: string;
}

export interface ReviewerOptions {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  level: "quick" | "standard" | "thorough";
  rules: {
    security?: string;
    performance?: string;
    style?: string;
    bestPractice?: string;
  };
  cache: boolean;
}

export class CodeReviewer {
  private llm: ChatOpenAI | null = null;
  private options: ReviewerOptions;
  private cache: Map<string, ReviewIssue[]> = new Map();

  constructor(options: ReviewerOptions) {
    this.options = options;

    if (options.apiKey) {
      this.llm = new ChatOpenAI({
        openAIApiKey: options.apiKey,
        configuration: { baseURL: options.apiUrl },
        modelName: options.model,
        temperature: options.temperature ?? 0.2,
        maxTokens: options.maxTokens ?? 4000,
        topP: undefined, // 避免与 temperature 冲突
      });

      // 覆盖 invocationParams 方法，移除 top_p 参数（兼容 Claude 等模型）
      const originalInvocationParams = this.llm.invocationParams.bind(this.llm);
      this.llm.invocationParams = (options: any) => {
        const params = originalInvocationParams(options);
        delete params.top_p;
        return params;
      };
    }
  }

  /**
   * 审查代码
   */
  async review(code: string, filePath: string): Promise<ReviewIssue[]> {
    if (!this.llm) {
      return [];
    }

    // 检查缓存
    if (this.options.cache) {
      const cacheKey = this.getCacheKey(code);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }
    }

    try {
      const issues = await this.performReview(code, filePath);

      // 保存到缓存
      if (this.options.cache) {
        const cacheKey = this.getCacheKey(code);
        this.cache.set(cacheKey, issues);
      }

      return issues;
    } catch (error: any) {
      console.error(`❌ 审查失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 执行审查
   */
  private async performReview(
    code: string,
    filePath: string,
  ): Promise<ReviewIssue[]> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(code, filePath);

    const response = await this.llm!.invoke([systemPrompt, userPrompt]);
    const content = response.content.toString();

    // 解析 JSON 响应
    try {
      const result = JSON.parse(content);
      const issues = this.parseIssues(result, filePath);
      return issues;
    } catch (error) {
      // 如果解析失败，尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const issues = this.parseIssues(result, filePath);
        return issues;
      }
      return [];
    }
  }

  /**
   * 构建系统提示
   */
  private buildSystemPrompt(): SystemMessage {
    const { level, rules } = this.options;

    let prompt = `你是一个专业的代码审查专家。请审查代码并识别问题。

审查级别: ${level}
`;

    // 添加规则说明
    if (rules.security !== "off") {
      prompt += `\n🔒 安全问题 (${rules.security}):
- XSS 漏洞
- SQL 注入
- eval() 使用
- 敏感信息泄露
- 不安全的依赖`;
    }

    if (rules.performance !== "off") {
      prompt += `\n⚡ 性能问题 (${rules.performance}):
- 大循环
- 内存泄漏
- 重复计算
- 不必要的渲染
- 阻塞操作`;
    }

    if (rules.style !== "off") {
      prompt += `\n📝 代码规范 (${rules.style}):
- 命名规范
- 代码复杂度
- 重复代码
- 注释完整性`;
    }

    if (rules.bestPractice !== "off") {
      prompt += `\n🎨 最佳实践 (${rules.bestPractice}):
- 错误处理
- 类型安全
- 组件设计
- 状态管理`;
    }

    prompt += `\n\n返回 JSON 格式:
{
  "issues": [
    {
      "line": 10,  // 必须是准确的行号！
      "category": "security",
      "severity": "error",
      "message": "使用了 eval()，存在安全风险",
      "suggestion": "使用 JSON.parse() 或其他安全方法"
    }
  ]
}

**重要提示**：
1. line 字段必须是准确的行号，与代码中的行号一致
2. 如果代码带有行号前缀（如 "10: const x = 1"），请提取正确的行号
3. 只返回 JSON，不要其他解释`;

    return new SystemMessage(prompt);
  }

  /**
   * 构建用户提示
   */
  private buildUserPrompt(code: string, filePath: string): HumanMessage {
    const fileExt = filePath.split(".").pop();
    const language = this.getLanguage(fileExt || "");
    const lines = code.split("\n");

    // 添加行号到代码中，帮助 AI 准确定位
    const codeWithLineNumbers = lines
      .map((line, index) => `${index + 1}: ${line}`)
      .join("\n");

    return new HumanMessage(`
请审查以下 ${language} 代码：

文件: ${filePath}
总行数: ${lines.length}

代码（带行号）:
\`\`\`${language}
${codeWithLineNumbers}
\`\`\`

**重要**：请返回准确的行号！行号必须与上面代码中的行号一致。

请返回 JSON 格式的问题列表。
`);
  }

  /**
   * 解析问题
   */
  private parseIssues(result: any, filePath: string): ReviewIssue[] {
    if (!result.issues || !Array.isArray(result.issues)) {
      return [];
    }

    return result.issues
      .map((issue: any) => ({
        file: filePath,
        line: issue.line,
        category: issue.category || "best-practice",
        severity: issue.severity || "info",
        message: issue.message || "未知问题",
        suggestion: issue.suggestion,
        code: issue.code,
      }))
      .filter((issue: ReviewIssue) => {
        // 根据规则过滤 - 处理连字符和驼峰命名的转换
        const categoryKey =
          issue.category === "best-practice" ? "bestPractice" : issue.category;
        const rule =
          this.options.rules[categoryKey as keyof typeof this.options.rules];
        return rule && rule !== "off";
      });
  }

  /**
   * 获取语言类型
   */
  private getLanguage(ext: string): string {
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      vue: "vue",
      css: "css",
      scss: "scss",
      less: "less",
    };

    return langMap[ext] || ext;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(code: string): string {
    return crypto.createHash("md5").update(code).digest("hex");
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hits: number } {
    return {
      size: this.cache.size,
      hits: 0, // 可以添加计数器跟踪
    };
  }
}
