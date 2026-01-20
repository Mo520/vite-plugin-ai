/**
 * 历史对比分析器
 */

import fs from "fs";
import path from "path";
import type {
  BundleInfo,
  HistoryComparison,
  HistoryRecord,
  ComparisonResult,
} from "./types";

export class HistoryAnalyzer {
  private historyFile: string;

  constructor() {
    const reportsDir = path.resolve(process.cwd(), "ai-reports");
    this.historyFile = path.join(reportsDir, ".perf-history.json");
  }

  /**
   * 对比当前构建与历史记录
   */
  compare(
    currentBundles: BundleInfo[],
    currentTotalSize: number,
    currentFileCount: number
  ): HistoryComparison | undefined {
    const history = this.loadHistory();

    if (history.length === 0) {
      // 没有历史记录，保存当前记录
      this.saveHistory(currentBundles, currentTotalSize, currentFileCount);
      return undefined;
    }

    // 获取上一次记录
    const previous = history[history.length - 1];

    // 对比总大小
    const totalSize = this.compareValue(currentTotalSize, previous.totalSize);

    // 对比文件数量
    const fileCount = this.compareValue(currentFileCount, previous.fileCount);

    // 对比最大文件变化
    const largestFileChanges = this.compareLargestFiles(
      currentBundles,
      previous.files
    );

    // 检测新增和删除的文件
    const currentFileNames = new Set(currentBundles.map((b) => b.name));
    const previousFileNames = new Set(previous.files.map((f) => f.name));

    const newFiles = currentBundles
      .filter((b) => !previousFileNames.has(b.name))
      .map((b) => b.name);

    const removedFiles = previous.files
      .filter((f) => !currentFileNames.has(f.name))
      .map((f) => f.name);

    // 保存当前记录
    this.saveHistory(currentBundles, currentTotalSize, currentFileCount);

    return {
      totalSize,
      fileCount,
      largestFileChanges,
      newFiles,
      removedFiles,
    };
  }

  /**
   * 对比数值
   */
  private compareValue(current: number, previous: number): ComparisonResult {
    const diff = current - previous;
    const diffPercent = previous === 0 ? 0 : (diff / previous) * 100;

    let trend: "increased" | "decreased" | "unchanged";
    if (Math.abs(diffPercent) < 1) {
      trend = "unchanged";
    } else if (diff > 0) {
      trend = "increased";
    } else {
      trend = "decreased";
    }

    return {
      current,
      previous,
      diff,
      diffPercent,
      trend,
    };
  }

  /**
   * 对比最大文件的变化
   */
  private compareLargestFiles(
    currentBundles: BundleInfo[],
    previousFiles: Array<{ name: string; size: number }>
  ): Array<{
    name: string;
    current: number;
    previous: number;
    diff: number;
  }> {
    const changes: Array<{
      name: string;
      current: number;
      previous: number;
      diff: number;
    }> = [];

    // 创建文件映射
    const previousMap = new Map(previousFiles.map((f) => [f.name, f.size]));

    currentBundles.forEach((bundle) => {
      const previousSize = previousMap.get(bundle.name);
      if (previousSize !== undefined) {
        const diff = bundle.size - previousSize;
        // 只记录变化超过 10KB 的文件
        if (Math.abs(diff) > 10 * 1024) {
          changes.push({
            name: bundle.name,
            current: bundle.size,
            previous: previousSize,
            diff,
          });
        }
      }
    });

    // 按变化幅度排序
    return changes
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 10);
  }

  /**
   * 加载历史记录
   */
  private loadHistory(): HistoryRecord[] {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.historyFile, "utf-8");
      const history = JSON.parse(content);
      // 只保留最近 10 次记录
      return history.slice(-10);
    } catch (error) {
      console.warn("⚠️  无法读取历史记录");
      return [];
    }
  }

  /**
   * 保存历史记录
   */
  private saveHistory(
    bundles: BundleInfo[],
    totalSize: number,
    fileCount: number
  ): void {
    const history = this.loadHistory();

    const record: HistoryRecord = {
      timestamp: new Date().toISOString(),
      totalSize,
      fileCount,
      files: bundles.map((b) => ({
        name: b.name,
        size: b.size,
      })),
    };

    history.push(record);

    // 确保目录存在
    const dir = path.dirname(this.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 只保留最近 10 次记录
    const recentHistory = history.slice(-10);

    fs.writeFileSync(
      this.historyFile,
      JSON.stringify(recentHistory, null, 2),
      "utf-8"
    );
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    if (fs.existsSync(this.historyFile)) {
      fs.unlinkSync(this.historyFile);
    }
  }
}
