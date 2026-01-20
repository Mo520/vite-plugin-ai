/**
 * 共享工具函数
 */

import fs from "fs";
import path from "path";
import pc from "picocolors";

/**
 * 从错误对象中提取源文件路径
 */
export function extractSourceFile(
  error: Error,
  fallbackFile: string | null,
): string | null {
  const errorStr = error.toString();
  const stackStr = error.stack || "";

  // 方法 1: 从错误消息中提取绝对路径
  const filePathMatch =
    errorStr.match(/([A-Z]:[\\/][\w\\/.-]+\.(vue|ts|js|tsx|jsx))/i) ||
    stackStr.match(/([A-Z]:[\\/][\w\\/.-]+\.(vue|ts|js|tsx|jsx))/i);

  if (filePathMatch) {
    const filePath = filePathMatch[1];
    if (!filePath.includes("node_modules") && fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // 方法 2: 从错误消息中提取相对路径
  const relativeMatch =
    errorStr.match(/(src[\\/][\w\\/.-]+\.(vue|ts|js|tsx|jsx))/i) ||
    stackStr.match(/(src[\\/][\w\\/.-]+\.(vue|ts|js|tsx|jsx))/i);

  if (relativeMatch) {
    const relativePath = relativeMatch[1];
    const absolutePath = path.resolve(process.cwd(), relativePath);
    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  // 方法 3: 使用 fallback
  if (fallbackFile && !fallbackFile.includes("node_modules")) {
    return fallbackFile;
  }

  return null;
}

/**
 * 读取源文件内容
 */
export function readSourceFile(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch (error) {
    console.warn(pc.yellow(`⚠️  无法读取文件: ${filePath}`));
  }
  return null;
}

/**
 * 获取文件信息
 */
export function getFileInfo(filePath: string): {
  path: string;
  size: number;
  lines: number;
  content: string;
} | null {
  const content = readSourceFile(filePath);
  if (!content) return null;

  return {
    path: filePath,
    size: content.length,
    lines: content.split("\n").length,
    content,
  };
}
