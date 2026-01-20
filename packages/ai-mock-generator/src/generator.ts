/**
 * AI Mock Generator - 数据生成器
 */

import type {
  TypeDefinition,
  GenerationContext,
  PropertyDefinition,
} from './types';

export class MockDataGenerator {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(options: { apiKey: string; apiUrl: string; model: string }) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl;
    this.model = options.model;
  }

  /**
   * 生成 Mock 数据
   */
  async generate(context: GenerationContext): Promise<any> {
    const { type, count, locale, quality } = context;

    // 构建 AI Prompt
    const prompt = this.buildPrompt(type, count, locale, quality);

    // 调用 AI API
    const response = await this.callAI(prompt);

    // 解析响应
    return this.parseResponse(response, type.isArray);
  }

  /**
   * 构建 AI Prompt
   */
  private buildPrompt(
    type: TypeDefinition,
    count: number,
    locale: string,
    quality: string
  ): string {
    const properties = type.properties
      .map((p) => this.formatProperty(p))
      .join('\n');

    return `
你是一个专业的 Mock 数据生成器。请根据以下类型定义生成真实、合理的测试数据。

类型名称: ${type.name}
数据语言: ${locale === 'zh-CN' ? '中文' : '英文'}
数据数量: ${count}
质量要求: ${quality === 'high' ? '高质量（真实业务数据）' : quality === 'fast' ? '快速生成' : '平衡质量和速度'}

类型定义:
${properties}

要求:
1. 生成 ${count} 条数据
2. 数据要符合业务逻辑和真实场景
3. 字段值要合理（如价格不能为负数，年龄在合理范围）
4. 日期格式使用 ISO 8601
5. 返回 JSON 数组格式，不要包含任何其他文字
6. 理解字段语义，生成真实数据（如 userName 生成真实姓名）

示例格式:
[
  {
    "id": 1,
    "name": "张三",
    ...
  }
]

请生成数据:
`.trim();
  }

  /**
   * 格式化属性
   */
  private formatProperty(prop: PropertyDefinition): string {
    let line = `- ${prop.name}: ${prop.type}`;

    if (prop.comment) {
      line += ` // ${prop.comment}`;
    }

    if (prop.constraints) {
      const constraints = [];
      if (prop.constraints.min !== undefined) {
        constraints.push(`min: ${prop.constraints.min}`);
      }
      if (prop.constraints.max !== undefined) {
        constraints.push(`max: ${prop.constraints.max}`);
      }
      if (prop.constraints.unique) {
        constraints.push('unique');
      }
      if (prop.constraints.enum) {
        constraints.push(`enum: [${prop.constraints.enum.join(', ')}]`);
      }
      if (constraints.length > 0) {
        line += ` (${constraints.join(', ')})`;
      }
    }

    return line;
  }

  /**
   * 调用 AI API
   */
  private async callAI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Failed to call AI API:', error);
      throw error;
    }
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(response: string, isArray: boolean = true): any {
    try {
      // 移除 markdown 代码块标记
      let cleanedResponse = response.trim();
      
      // 移除开头的 ```json 或 ```
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      
      // 移除结尾的 ```
      cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
      
      // 提取 JSON 部分（查找数组或对象）
      const jsonMatch = cleanedResponse.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (!jsonMatch) {
        throw new Error('No JSON array or object found in response');
      }

      const data = JSON.parse(jsonMatch[0]);

      return isArray ? data : data[0];
    } catch (error: any) {
      console.error('Failed to parse AI response:', error);
      console.error('Response:', response);
      throw error;
    }
  }

  /**
   * 生成基础数据（不使用 AI）
   */
  generateBasic(type: TypeDefinition, count: number): any[] {
    const data = [];

    for (let i = 0; i < count; i++) {
      const item: any = {};

      for (const prop of type.properties) {
        item[prop.name] = this.generateBasicValue(prop, i);
      }

      data.push(item);
    }

    return data;
  }

  /**
   * 生成基础值
   */
  private generateBasicValue(prop: PropertyDefinition, index: number): any {
    const { type, constraints } = prop;

    // 处理枚举
    if (constraints?.enum) {
      return constraints.enum[index % constraints.enum.length];
    }

    // 根据类型生成
    switch (type) {
      case 'number':
        const min = constraints?.min ?? 0;
        const max = constraints?.max ?? 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;

      case 'string':
        return `${prop.name}_${index + 1}`;

      case 'boolean':
        return Math.random() > 0.5;

      case 'Date':
        return new Date().toISOString();

      default:
        return null;
    }
  }
}
