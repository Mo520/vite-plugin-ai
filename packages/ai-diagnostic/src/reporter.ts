/**
 * AI 诊断报告生成器
 */

import fs from "fs";
import path from "path";

export interface DiagnosticReport {
  timestamp: string;
  error: {
    type: string;
    message: string;
    file: string;
    stack?: string;
  };
  analysis: string;
  suggestion: string;
  fixed: boolean;
  fixedFilePath?: string;
}

export interface ReporterOptions {
  console?: boolean;
  html?: boolean;
  markdown?: boolean;
  json?: boolean;
}

export class DiagnosticReporter {
  /**
   * 生成报告（根据配置生成多种格式）
   */
  static async generate(
    report: DiagnosticReport,
    options: ReporterOptions = {}
  ): Promise<void> {
    // HTML 报告
    if (options.html) {
      await this.generateHTMLReport(report);
    }

    // Markdown 报告
    if (options.markdown) {
      await this.generateMarkdownReport(report);
    }

    // JSON 报告
    if (options.json) {
      await this.generateJSONReport(report);
    }
  }

  /**
   * 生成 HTML 报告
   */
  static async generateHTMLReport(report: DiagnosticReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 诊断报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .header .time {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-box {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .error-type {
      display: inline-block;
      background: #f56565;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .error-message {
      font-size: 16px;
      color: #c53030;
      font-weight: 500;
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .error-file {
      font-size: 14px;
      color: #666;
      font-family: 'Courier New', monospace;
      background: #f7fafc;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
    }
    .analysis-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.8;
      color: #1e40af;
    }
    .suggestion-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.8;
      color: #065f46;
    }
    .suggestion-box pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .fixed-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .not-fixed-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f59e0b;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .footer {
      background: #f7fafc;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .stack-trace {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI 诊断报告</h1>
      <div class="time">生成时间: ${report.timestamp}</div>
    </div>

    <div class="content">
      <!-- 错误信息 -->
      <div class="section">
        <div class="section-title">❌ 错误信息</div>
        <div class="error-box">
          <span class="error-type">${report.error.type}</span>
          <div class="error-message">${this.escapeHtml(
            report.error.message
          )}</div>
          <div class="error-file">📂 ${report.error.file}</div>
          ${
            report.error.stack
              ? `<div class="stack-trace">${this.escapeHtml(
                  report.error.stack
                )}</div>`
              : ""
          }
        </div>
      </div>

      <!-- AI 分析 -->
      <div class="section">
        <div class="section-title">🔍 AI 分析</div>
        <div class="analysis-box">
          ${this.formatText(report.analysis)}
        </div>
      </div>

      <!-- 修复建议 -->
      <div class="section">
        <div class="section-title">💡 修复建议</div>
        <div class="suggestion-box">
          ${this.formatText(report.suggestion)}
        </div>
      </div>

      <!-- 修复状态 -->
      <div class="section">
        <div class="section-title">🔧 修复状态</div>
        ${
          report.fixed
            ? `<div class="fixed-badge">✅ 已自动修复</div>
             <div style="margin-top: 10px; color: #666;">修复文件: <code>${report.fixedFilePath}</code></div>`
            : `<div class="not-fixed-badge">⚠️ 未自动修复</div>
             <div style="margin-top: 10px; color: #666;">请根据上述建议手动修复</div>`
        }
      </div>
    </div>

    <div class="footer">
      <p>AI Diagnostic Plugin v1.0.0</p>
      <p>Powered by LangGraph & OpenAI</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // 创建报告目录
    const reportsDir = path.resolve(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.resolve(reportsDir, "diagnostic-report.html");
    fs.writeFileSync(reportPath, html, "utf-8");
    console.log(`\n📄 诊断报告已生成: ${reportPath}\n`);
  }

  /**
   * 转义 HTML 特殊字符
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 格式化文本（支持代码块和换行）
   */
  private static formatText(text: string): string {
    // 转义 HTML
    let formatted = this.escapeHtml(text);

    // 处理代码块
    formatted = formatted.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
      }
    );

    // 处理行内代码
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>'
    );

    // 处理换行
    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
  }

  /**
   * 生成 Markdown 报告
   */
  static async generateMarkdownReport(report: DiagnosticReport): Promise<void> {
    const markdown = `# 🤖 AI 诊断报告

**生成时间**: ${report.timestamp}

---

## ❌ 错误信息

**类型**: \`${report.error.type}\`  
**文件**: \`${report.error.file}\`  
**消息**: 
\`\`\`
${report.error.message}
\`\`\`

${
  report.error.stack
    ? `**堆栈跟踪**:\n\`\`\`\n${report.error.stack}\n\`\`\`\n`
    : ""
}

---

## 🔍 AI 分析

${report.analysis}

---

## 💡 修复建议

${report.suggestion}

---

## 🔧 修复状态

${
  report.fixed
    ? `✅ **已自动修复**\n\n修复文件: \`${report.fixedFilePath}\``
    : `⚠️ **未自动修复**\n\n请根据上述建议手动修复`
}

---

*AI Diagnostic Plugin v1.0.0*  
*Powered by LangGraph & OpenAI*
`;

    // 创建报告目录
    const reportsDir = path.resolve(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.resolve(reportsDir, "diagnostic-report.md");
    fs.writeFileSync(reportPath, markdown, "utf-8");
    console.log(`📄 Markdown 报告已生成: ${reportPath}`);
  }

  /**
   * 生成 JSON 报告
   */
  static async generateJSONReport(report: DiagnosticReport): Promise<void> {
    const jsonReport = {
      version: "1.0.0",
      timestamp: report.timestamp,
      error: {
        type: report.error.type,
        message: report.error.message,
        file: report.error.file,
        stack: report.error.stack || null,
      },
      diagnosis: {
        analysis: report.analysis,
        suggestion: report.suggestion,
      },
      fix: {
        applied: report.fixed,
        filePath: report.fixedFilePath || null,
      },
    };

    // 创建报告目录
    const reportsDir = path.resolve(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.resolve(reportsDir, "diagnostic-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2), "utf-8");
    console.log(`📄 JSON 报告已生成: ${reportPath}`);
  }
}
