/**
 * 依赖分析器
 */

import fs from "fs";
import path from "path";
import type { BundleInfo, DependencyInfo } from "./types";

export class DependencyAnalyzer {
  /**
   * 分析依赖
   */
  analyzeDependencies(bundles: BundleInfo[]): {
    total: number;
    duplicates: DependencyInfo[];
    largest: DependencyInfo[];
  } {
    const jsFiles = bundles.filter((b) => b.type === "javascript");
    const dependencies = this.extractDependencies(jsFiles);

    // 检测重复依赖
    const duplicates = this.findDuplicates(dependencies);

    // 找出最大的依赖
    const largest = [...dependencies]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    return {
      total: dependencies.length,
      duplicates,
      largest,
    };
  }

  /**
   * 从 JS 文件中提取依赖信息
   */
  private extractDependencies(jsFiles: BundleInfo[]): DependencyInfo[] {
    const depMap = new Map<string, DependencyInfo>();

    jsFiles.forEach((file) => {
      // 尝试解析文件内容，提取依赖
      const imports = this.parseImports(file);

      imports.forEach((depName) => {
        if (!depMap.has(depName)) {
          depMap.set(depName, {
            name: depName,
            size: 0,
            usedBy: [],
            isDuplicate: false,
          });
        }

        const dep = depMap.get(depName)!;
        dep.usedBy.push(file.name);
        // 估算依赖大小（简化处理）
        dep.size += file.size / imports.length;
      });
    });

    return Array.from(depMap.values());
  }

  /**
   * 解析文件中的 import 语句
   */
  private parseImports(file: BundleInfo): string[] {
    const imports: string[] = [];

    try {
      const distDir = path.resolve(process.cwd(), "dist");
      const filePath = path.join(distDir, file.path);

      if (!fs.existsSync(filePath)) {
        return imports;
      }

      const content = fs.readFileSync(filePath, "utf-8");

      // 匹配常见的依赖模式
      const patterns = [
        // node_modules 依赖
        /from\s+["']([^"']+)["']/g,
        /require\(["']([^"']+)["']\)/g,
        // Vite 特殊标记
        /__vite_ssr_import__\("([^"]+)"\)/g,
      ];

      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const depName = match[1];
          // 只保留 node_modules 依赖
          if (!depName.startsWith(".") && !depName.startsWith("/")) {
            // 提取包名（去掉子路径）
            const pkgName = depName
              .split("/")
              .slice(0, depName.startsWith("@") ? 2 : 1)
              .join("/");
            if (!imports.includes(pkgName)) {
              imports.push(pkgName);
            }
          }
        }
      });
    } catch (error) {
      // 忽略解析错误
    }

    return imports;
  }

  /**
   * 查找重复打包的依赖
   */
  private findDuplicates(dependencies: DependencyInfo[]): DependencyInfo[] {
    return dependencies
      .filter((dep) => dep.usedBy.length > 1)
      .map((dep) => ({
        ...dep,
        isDuplicate: true,
      }))
      .sort((a, b) => b.usedBy.length - a.usedBy.length)
      .slice(0, 10);
  }
}
