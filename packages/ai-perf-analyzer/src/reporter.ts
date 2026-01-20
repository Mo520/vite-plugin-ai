/**
 * 性能分析报告生成器
 */

import fs from "fs";
import path from "path";
import pc from "picocolors";
import type { AnalysisResult, PerformanceIssue } from "./types";

export interface ReporterOptions {
  console?: boolean;
  html?: boolean;
  json?: boolean;
}

export class PerfReporter {
  /**
   * 生成报告
   */
  async generate(
    result: AnalysisResult,
    options: ReporterOptions = {},
  ): Promise<void> {
    if (options.html) {
      await this.generateHTMLReport(result);
    }

    if (options.json) {
      await this.generateJSONReport(result);
    }
  }

  /**
   * 控制台输出
   */
  printConsole(result: AnalysisResult): void {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚡ 性能分析报告");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 总体统计
    console.log("📊 总体统计:");
    console.log(
      `   总大小: ${(result.summary.totalSize / 1024 / 1024).toFixed(2)}MB`,
    );
    console.log(
      `   Gzip后: ${(result.summary.totalGzipSize / 1024 / 1024).toFixed(2)}MB`,
    );
    console.log(`   文件数: ${result.summary.fileCount}\n`);

    // 历史对比
    if (result.comparison) {
      console.log("📈 历史对比:");
      const { totalSize, fileCount, newFiles, removedFiles } =
        result.comparison;
      const sizeIcon = totalSize.trend === "increased" ? "📈" : "📉";
      console.log(
        `   ${sizeIcon} 总大小: ${totalSize.trend === "increased" ? "+" : ""}${(
          totalSize.diff /
          1024 /
          1024
        ).toFixed(2)}MB (${
          totalSize.diffPercent > 0 ? "+" : ""
        }${totalSize.diffPercent.toFixed(2)}%)`,
      );
      console.log(
        `   📊 文件数: ${fileCount.diff > 0 ? "+" : ""}${fileCount.diff}`,
      );
      if (newFiles.length > 0) {
        console.log(`   ✨ 新增: ${newFiles.slice(0, 3).join(", ")}`);
      }
      if (removedFiles.length > 0) {
        console.log(`   🗑️  删除: ${removedFiles.slice(0, 3).join(", ")}`);
      }
      console.log();
    }

    // 依赖分析
    if (result.dependencies) {
      console.log("📦 依赖分析:");
      console.log(`   总依赖数: ${result.dependencies.total}`);
      if (result.dependencies.duplicates.length > 0) {
        console.log(
          `   ⚠️  重复依赖: ${result.dependencies.duplicates.length} 个`,
        );
        result.dependencies.duplicates.slice(0, 3).forEach((dep) => {
          console.log(
            `      - ${dep.name}: 被 ${dep.usedBy.length} 个文件使用`,
          );
        });
      }
      console.log();
    }

    // 最大文件
    console.log("📦 最大的文件:");
    result.summary.largestFiles.slice(0, 5).forEach((file, index) => {
      console.log(
        `   ${index + 1}. ${file.name}: ${(file.size / 1024).toFixed(2)}KB`,
      );
    });
    console.log();

    // 按类型统计
    console.log("📋 按类型统计:");
    Object.entries(result.summary.byType).forEach(([type, info]) => {
      console.log(
        `   ${type}: ${info.count} 个, ${(info.size / 1024).toFixed(2)}KB`,
      );
    });
    console.log();

    // 性能问题
    if (result.issues.length > 0) {
      console.log("⚠️  性能问题:");
      result.issues.forEach((issue, index) => {
        const icon = this.getSeverityIcon(issue.severity);
        console.log(`   ${index + 1}. ${icon} ${issue.title}`);
        console.log(`      ${issue.description}`);
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`);
        }
      });
      console.log();
    } else {
      console.log("✅ 未发现明显的性能问题\n");
    }

    // 优化建议
    if (result.suggestions.length > 0) {
      console.log("💡 优化建议:");
      result.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      console.log();
    }

    // 优化示例
    if (result.optimizationExamples && result.optimizationExamples.length > 0) {
      console.log("🔧 优化示例:");
      result.optimizationExamples.slice(0, 3).forEach((example, index) => {
        console.log(`   ${index + 1}. ${example.title} (${example.priority})`);
        console.log(`      ${example.description}`);
      });
      console.log();
    }

    // AI 分析
    if (result.aiAnalysis) {
      console.log("🤖 AI 分析:");
      console.log(
        result.aiAnalysis
          .split("\n")
          .map((line) => `   ${line}`)
          .join("\n"),
      );
      console.log();
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  /**
   * 生成 HTML 报告
   */
  private async generateHTMLReport(result: AnalysisResult): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>性能分析报告</title>
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
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .file-list {
      background: #f7fafc;
      border-radius: 8px;
      padding: 15px;
    }
    .file-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .file-item:last-child {
      border-bottom: none;
    }
    .file-name {
      font-family: monospace;
      color: #333;
    }
    .file-size {
      color: #667eea;
      font-weight: bold;
    }
    .issue {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .issue.medium {
      background: #fffaf0;
      border-left-color: #ed8936;
    }
    .issue.low {
      background: #f0f9ff;
      border-left-color: #4299e1;
    }
    .issue-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }
    .issue-desc {
      color: #666;
      margin-bottom: 8px;
    }
    .issue-suggestion {
      background: #e6fffa;
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      color: #234e52;
    }
    .suggestion-list {
      background: #f0fdf4;
      border-radius: 8px;
      padding: 15px;
    }
    .suggestion-item {
      padding: 10px;
      border-bottom: 1px solid #d1fae5;
      color: #065f46;
    }
    .suggestion-item:last-child {
      border-bottom: none;
    }
    .ai-analysis {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.8;
      color: #1e40af;
      white-space: pre-wrap;
    }
    .footer {
      background: #f7fafc;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
    }
    .trend-up {
      background: linear-gradient(135deg, #f56565 0%, #ed8936 100%) !important;
    }
    .trend-down {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
    }
    .optimization-example {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
    }
    .example-header {
      margin-bottom: 15px;
    }
    .example-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .priority-badge {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: normal;
    }
    .priority-high {
      background: #fed7d7;
      color: #c53030;
    }
    .priority-medium {
      background: #feebc8;
      color: #c05621;
    }
    .priority-low {
      background: #bee3f8;
      color: #2c5282;
    }
    .example-meta {
      display: flex;
      gap: 15px;
      font-size: 14px;
      color: #666;
    }
    .example-desc {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.6;
    }
    .code-block {
      background: #1e293b;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 10px;
    }
    .code-header {
      background: #334155;
      color: #94a3b8;
      padding: 8px 15px;
      font-size: 12px;
      font-family: monospace;
    }
    .code-block pre {
      margin: 0;
      padding: 15px;
      overflow-x: auto;
    }
    .code-block code {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
    }
    .related-files {
      margin-top: 15px;
      padding: 10px;
      background: #e6fffa;
      border-radius: 6px;
      font-size: 14px;
      color: #234e52;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ 性能分析报告</h1>
      <div class="time">生成时间: ${result.timestamp}</div>
    </div>

    <div class="content">
      <!-- 总体统计 -->
      <div class="section">
        <div class="section-title">📊 总体统计</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">总大小</div>
            <div class="stat-value">${(
              result.summary.totalSize /
              1024 /
              1024
            ).toFixed(2)}MB</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Gzip 后</div>
            <div class="stat-value">${(
              result.summary.totalGzipSize /
              1024 /
              1024
            ).toFixed(2)}MB</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">文件数量</div>
            <div class="stat-value">${result.summary.fileCount}</div>
          </div>
        </div>
      </div>

      <!-- 最大文件 -->
      <div class="section">
        <div class="section-title">📦 最大的文件</div>
        <div class="file-list">
          ${result.summary.largestFiles
            .slice(0, 10)
            .map(
              (file) => `
            <div class="file-item">
              <span class="file-name">${file.name}</span>
              <span class="file-size">${(file.size / 1024).toFixed(2)}KB</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- 按类型统计 -->
      <div class="section">
        <div class="section-title">📋 按类型统计</div>
        <div class="file-list">
          ${Object.entries(result.summary.byType)
            .map(
              ([type, info]) => `
            <div class="file-item">
              <span class="file-name">${type}</span>
              <span class="file-size">${info.count} 个, ${(
                info.size / 1024
              ).toFixed(2)}KB</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- 历史对比 -->
      ${
        result.comparison
          ? `
        <div class="section">
          <div class="section-title">📈 历史对比</div>
          <div class="stats-grid">
            <div class="stat-card ${
              result.comparison.totalSize.trend === "increased"
                ? "trend-up"
                : "trend-down"
            }">
              <div class="stat-label">总大小变化</div>
              <div class="stat-value">${
                result.comparison.totalSize.diffPercent > 0 ? "+" : ""
              }${result.comparison.totalSize.diffPercent.toFixed(2)}%</div>
              <div class="stat-label">${
                result.comparison.totalSize.trend === "increased" ? "+" : ""
              }${(result.comparison.totalSize.diff / 1024 / 1024).toFixed(
              2,
            )}MB</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">文件数变化</div>
              <div class="stat-value">${
                result.comparison.fileCount.diff > 0 ? "+" : ""
              }${result.comparison.fileCount.diff}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">新增文件</div>
              <div class="stat-value">${result.comparison.newFiles.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">删除文件</div>
              <div class="stat-value">${
                result.comparison.removedFiles.length
              }</div>
            </div>
          </div>
          ${
            result.comparison.largestFileChanges.length > 0
              ? `
            <div class="file-list" style="margin-top: 15px;">
              <div style="font-weight: bold; padding: 10px; color: #333;">文件大小变化 Top 5:</div>
              ${result.comparison.largestFileChanges
                .slice(0, 5)
                .map(
                  (change) => `
                <div class="file-item">
                  <span class="file-name">${change.name}</span>
                  <span class="file-size ${
                    change.diff > 0 ? "trend-up" : "trend-down"
                  }">
                    ${change.diff > 0 ? "+" : ""}${(change.diff / 1024).toFixed(
                    2,
                  )}KB
                  </span>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      `
          : ""
      }

      <!-- 依赖分析 -->
      ${
        result.dependencies
          ? `
        <div class="section">
          <div class="section-title">📦 依赖分析</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">总依赖数</div>
              <div class="stat-value">${result.dependencies.total}</div>
            </div>
            <div class="stat-card ${
              result.dependencies.duplicates.length > 0 ? "trend-up" : ""
            }">
              <div class="stat-label">重复依赖</div>
              <div class="stat-value">${
                result.dependencies.duplicates.length
              }</div>
            </div>
          </div>
          ${
            result.dependencies.duplicates.length > 0
              ? `
            <div class="file-list" style="margin-top: 15px;">
              <div style="font-weight: bold; padding: 10px; color: #333;">重复打包的依赖:</div>
              ${result.dependencies.duplicates
                .slice(0, 10)
                .map(
                  (dep) => `
                <div class="file-item">
                  <span class="file-name">${dep.name}</span>
                  <span class="file-size">
                    ${(dep.size / 1024).toFixed(2)}KB · 被 ${
                    dep.usedBy.length
                  } 个文件使用
                  </span>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            result.dependencies.largest.length > 0
              ? `
            <div class="file-list" style="margin-top: 15px;">
              <div style="font-weight: bold; padding: 10px; color: #333;">最大的依赖:</div>
              ${result.dependencies.largest
                .slice(0, 10)
                .map(
                  (dep) => `
                <div class="file-item">
                  <span class="file-name">${dep.name}</span>
                  <span class="file-size">${(dep.size / 1024).toFixed(
                    2,
                  )}KB</span>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      `
          : ""
      }

      <!-- 性能问题 -->
      ${
        result.issues.length > 0
          ? `
        <div class="section">
          <div class="section-title">⚠️ 性能问题</div>
          ${result.issues
            .map(
              (issue) => `
            <div class="issue ${issue.severity}">
              <div class="issue-title">${this.getSeverityIcon(
                issue.severity,
              )} ${issue.title}</div>
              <div class="issue-desc">${issue.description}</div>
              ${
                issue.files
                  ? `<div class="issue-desc">相关文件: ${issue.files.join(
                      ", ",
                    )}</div>`
                  : ""
              }
              ${
                issue.suggestion
                  ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>`
                  : ""
              }
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : '<div class="section"><div class="section-title">✅ 未发现明显的性能问题</div></div>'
      }

      <!-- 优化建议 -->
      ${
        result.suggestions.length > 0
          ? `
        <div class="section">
          <div class="section-title">💡 优化建议</div>
          <div class="suggestion-list">
            ${result.suggestions
              .map(
                (suggestion, index) => `
              <div class="suggestion-item">${index + 1}. ${suggestion}</div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- 优化示例 -->
      ${
        result.optimizationExamples && result.optimizationExamples.length > 0
          ? `
        <div class="section">
          <div class="section-title">🔧 优化示例</div>
          ${result.optimizationExamples
            .map(
              (example) => `
            <div class="optimization-example">
              <div class="example-header">
                <div class="example-title">
                  ${example.title}
                  <span class="priority-badge priority-${example.priority}">${
                example.priority === "high"
                  ? "高优先级"
                  : example.priority === "medium"
                  ? "中优先级"
                  : "低优先级"
              }</span>
                </div>
                <div class="example-meta">
                  <span>💪 ${example.difficulty}</span>
                  <span>📈 ${example.impact}</span>
                </div>
              </div>
              <div class="example-desc">${example.description}</div>
              <div class="code-block">
                <div class="code-header">${example.code.language}</div>
                <pre><code>${this.escapeHtml(example.code.content)}</code></pre>
              </div>
              ${
                example.relatedFiles && example.relatedFiles.length > 0
                  ? `
                <div class="related-files">
                  <strong>相关文件:</strong> ${example.relatedFiles.join(", ")}
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- AI 分析 -->
      ${
        result.aiAnalysis
          ? `
        <div class="section">
          <div class="section-title">🤖 AI 分析</div>
          <div class="ai-analysis">${this.escapeHtml(result.aiAnalysis)}</div>
        </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>AI Performance Analyzer v1.0.0</p>
      <p>Powered by Vite & OpenAI</p>
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

    const reportPath = path.resolve(reportsDir, "performance-report.html");
    fs.writeFileSync(reportPath, html, "utf-8");
    console.log(pc.green(`\n📄 性能报告已生成: ${pc.cyan(reportPath)}\n`));
  }

  /**
   * 生成 JSON 报告
   */
  private async generateJSONReport(result: AnalysisResult): Promise<void> {
    const reportsDir = path.resolve(process.cwd(), "ai-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.resolve(reportsDir, "performance-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(pc.green(`📄 JSON 报告已生成: ${pc.cyan(reportPath)}`));
  }

  /**
   * 获取严重程度图标
   */
  private getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      high: "🔴",
      medium: "🟡",
      low: "🔵",
    };
    return icons[severity] || "⚪";
  }

  /**
   * 转义 HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
