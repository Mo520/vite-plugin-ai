/**
 * i18n 插件工具函数
 */

import fs from "fs";
import path from "path";

/**
 * 简单的 glob 实现
 */
export async function glob(
  patterns: string[],
  excludePatterns: string[]
): Promise<string[]> {
  const results: string[] = [];
  const cwd = process.cwd();

  for (const pattern of patterns) {
    const files = await matchPattern(pattern, cwd);
    results.push(...files);
  }

  // 过滤排除的文件
  return results.filter((file) => {
    const relativePath = path.relative(cwd, file);
    return !excludePatterns.some((p) => matchGlob(relativePath, p));
  });
}

/**
 * 匹配单个 glob 模式
 */
async function matchPattern(pattern: string, cwd: string): Promise<string[]> {
  const results: string[] = [];

  // 解析模式
  const parts = pattern.split("/");
  const hasGlobstar = parts.includes("**");

  if (hasGlobstar) {
    // 递归搜索
    const baseDir = parts.slice(0, parts.indexOf("**")).join("/") || ".";
    const filePattern = parts.slice(parts.indexOf("**") + 1).join("/");
    await walkDir(path.join(cwd, baseDir), filePattern, results);
  } else {
    // 直接匹配
    const fullPath = path.join(cwd, pattern);
    if (fs.existsSync(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 递归遍历目录
 */
async function walkDir(
  dir: string,
  pattern: string,
  results: string[]
): Promise<void> {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 跳过 node_modules 和隐藏目录
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      await walkDir(fullPath, pattern, results);
    } else if (entry.isFile()) {
      if (matchGlob(entry.name, pattern)) {
        results.push(fullPath);
      }
    }
  }
}

/**
 * 简单的 glob 匹配
 */
function matchGlob(str: string, pattern: string): boolean {
  // 转换 glob 模式为正则
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".");

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(str);
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
