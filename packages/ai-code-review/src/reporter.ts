/**
 * 报告生成器
 */

import fs from "fs";
import path from "path";
import type { ReviewIssue } from "./reviewer";

export interface ReporterOptions {
  console?: boolean;
  html?: boolean;
  markdown?: boolean;
  json?: boolean;
  failOnError?: boolean;
}

export class Reporter {
  private options: ReporterOptions;

  constructor(options: ReporterOptions = {}) {
    this.options = options;
  }

  /**
   * 生成报告
   */
  async generate(issues: ReviewIssue[]): Promise<void> {
    // 控制台报告
    if (this.options.console) {
      this.generateConsoleReport(issues);
    }

    // HTML 报告
    if (this.options.html) {
      await this.generateHTMLReport(issues);
    }

    // Markdown 报告
    if (this.options.markdown) {
      await this.generateMarkdownReport(issues);
    }

    // JSON 报告
    if (this.options.json) {
      await this.generateJSONReport(issues);
    }
  }

  /**
   * 生成控制台报告
   */
  private generateConsoleReport(issues: ReviewIssue[]): void {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 代码审查报告");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 按严重程度分组
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warn");
    const infos = issues.filter((i) => i.severity === "info");

    console.log(`❌ 错误: ${errors.length}`);
    console.log(`⚠️  警告: ${warnings.length}`);
    console.log(`ℹ️  信息: ${infos.length}`);
    console.log(`📝 总计: ${issues.length}\n`);

    // 按类别分组
    const byCategory = this.groupByCategory(issues);
    console.log("📋 问题分类:");
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  ${this.getCategoryIcon(category)} ${category}: ${count}`);
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  /**
   * 生成 HTML 报告
   */
  private async generateHTMLReport(issues: ReviewIssue[]): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>代码审查报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
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
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .summary-card:hover {
      transform: translateY(-4px);
    }
    .summary-card.error { 
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      color: white;
    }
    .summary-card.warn { 
      background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
      color: #333;
    }
    .summary-card.info { 
      background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
      color: white;
    }
    .summary-card h2 { 
      font-size: 42px; 
      margin: 10px 0;
      font-weight: bold;
    }
    .summary-card p { 
      font-size: 16px;
      font-weight: 500;
    }
    .section-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .issue {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      background: #fafafa;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: box-shadow 0.2s;
    }
    .issue:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .issue-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .issue-badge {
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .issue-badge.error { background: #ff6b6b; color: white; }
    .issue-badge.warn { background: #feca57; color: #333; }
    .issue-badge.info { background: #48dbfb; color: white; }
    .issue-category {
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
      background: #667eea;
      color: white;
    }
    .issue-file {
      color: #666;
      font-size: 14px;
      font-family: 'Courier New', monospace;
      background: #f0f0f0;
      padding: 4px 10px;
      border-radius: 6px;
      flex: 1;
      min-width: 200px;
    }
    .issue-line {
      color: #667eea;
      font-weight: bold;
      font-size: 14px;
    }
    .issue-message {
      margin: 15px 0;
      color: #333;
      line-height: 1.8;
      font-size: 15px;
    }
    .issue-suggestion {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin-top: 15px;
      border-radius: 8px;
      line-height: 1.6;
    }
    .issue-suggestion::before {
      content: "💡 建议: ";
      font-weight: bold;
      color: #2e7d32;
      font-size: 16px;
    }
    .category-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 20px 0;
    }
    .category-tag {
      padding: 8px 16px;
      border-radius: 20px;
      background: #f0f0f0;
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }
    .footer {
      background: #f7fafc;
      padding: 25px;
      text-align: center;
      color: #718096;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 代码审查报告</h1>
      <div class="time">生成时间: ${new Date().toLocaleString("zh-CN")}</div>
    </div>

    <div class="content">
      <div class="summary">
        <div class="summary-card error">
          <h2>${issues.filter((i) => i.severity === "error").length}</h2>
          <p>错误</p>
        </div>
        <div class="summary-card warn">
          <h2>${issues.filter((i) => i.severity === "warn").length}</h2>
          <p>警告</p>
        </div>
        <div class="summary-card info">
          <h2>${issues.filter((i) => i.severity === "info").length}</h2>
          <p>信息</p>
        </div>
      </div>

      <div class="section-title">📊 问题分类统计</div>
      <div class="category-stats">
        ${Object.entries(this.groupByCategory(issues))
          .map(
            ([category, count]) =>
              `<div class="category-tag">${this.getCategoryIcon(
                category
              )} ${category}: ${count}</div>`
          )
          .join("")}
      </div>

      <div class="section-title">📋 问题详情</div>
      ${issues
        .map(
          (issue) => `
      <div class="issue">
        <div class="issue-header">
          <span class="issue-badge ${
            issue.severity
          }">${issue.severity.toUpperCase()}</span>
          <span class="issue-category">${issue.category}</span>
          <span class="issue-file">${issue.file}</span>
          ${
            issue.line ? `<span class="issue-line">行 ${issue.line}</span>` : ""
          }
        </div>
        <div class="issue-message">${issue.message}</div>
        ${
          issue.suggestion
            ? `<div class="issue-suggestion">${issue.suggestion}</div>`
            : ""
        }
      </div>
    `
        )
        .join("")}
    </div>

    <div class="footer">
      <p>AI Code Review Plugin v1.0.0</p>
      <p>Powered by LangChain & OpenAI</p>
    </div>
  </div>
</body>
</html>
    `;

    // 创建报告目录
    const reportsDir = path.join(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, "code-review-report.html");
    fs.writeFileSync(reportPath, html, "utf-8");
    console.log(`📄 HTML 报告已生成: ${reportPath}\n`);
  }

  /**
   * 生成 Markdown 报告
   */
  private async generateMarkdownReport(issues: ReviewIssue[]): Promise<void> {
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warn");
    const infos = issues.filter((i) => i.severity === "info");

    let markdown = `# 🔍 代码审查报告

生成时间: ${new Date().toLocaleString("zh-CN")}

## 📊 概览

| 类型 | 数量 |
|------|------|
| ❌ 错误 | ${errors.length} |
| ⚠️ 警告 | ${warnings.length} |
| ℹ️ 信息 | ${infos.length} |
| 📝 总计 | ${issues.length} |

## 📋 问题详情

`;

    issues.forEach((issue, index) => {
      const icon = this.getSeverityIcon(issue.severity);
      markdown += `### ${index + 1}. ${icon} ${issue.category}

**文件**: \`${issue.file}${issue.line ? `:${issue.line}` : ""}\`  
**严重程度**: ${issue.severity}  
**问题**: ${issue.message}

`;

      if (issue.suggestion) {
        markdown += `💡 **建议**: ${issue.suggestion}\n\n`;
      }

      markdown += "---\n\n";
    });

    // 创建报告目录
    const reportsDir = path.join(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, "code-review-report.md");
    fs.writeFileSync(reportPath, markdown, "utf-8");
    console.log(`📄 Markdown 报告已生成: ${reportPath}\n`);
  }

  /**
   * 生成 JSON 报告
   */
  private async generateJSONReport(issues: ReviewIssue[]): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: issues.length,
        errors: issues.filter((i) => i.severity === "error").length,
        warnings: issues.filter((i) => i.severity === "warn").length,
        infos: issues.filter((i) => i.severity === "info").length,
      },
      issues: issues,
    };

    // 创建报告目录
    const reportsDir = path.join(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, "code-review-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`📄 JSON 报告已生成: ${reportPath}\n`);
  }

  /**
   * 按类别分组
   */
  private groupByCategory(issues: ReviewIssue[]): Record<string, number> {
    const groups: Record<string, number> = {};

    issues.forEach((issue) => {
      groups[issue.category] = (groups[issue.category] || 0) + 1;
    });

    return groups;
  }

  /**
   * 获取类别图标
   */
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      security: "🔒",
      performance: "⚡",
      style: "📝",
      "best-practice": "🎨",
    };

    return icons[category] || "📋";
  }

  /**
   * 获取严重程度图标
   */
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  }
}
