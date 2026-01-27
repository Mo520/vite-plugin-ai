/**
 * Git 工具类
 * 用于获取 Git 变更信息
 * 统一策略：对比上一次提交（HEAD~1）
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export class GitUtils {
  /**
   * 获取 Git 变更的文件列表
   * 统一策略：对比上一次提交（HEAD~1）
   */
  async getChangedFiles(): Promise<string[]> {
    try {
      // 检查是否在 Git 仓库中
      if (!this.isGitRepository()) {
        console.warn("⚠️  不在 Git 仓库中，无法获取变更文件");
        return [];
      }

      console.log(`🔍 [Git] 对比策略: HEAD~1 vs HEAD`);

      // 统一使用对比上一次提交的方式
      const changedFiles = this.getCommitDiffFiles();

      console.log(`🔍 [Git] 检测到 ${changedFiles.length} 个变更文件`);
      changedFiles.forEach((f) => console.log(`   - ${f}`));

      // 过滤存在的文件
      const existingFiles = changedFiles.filter((file) => {
        const fullPath = path.resolve(process.cwd(), file);
        const exists = fs.existsSync(fullPath);
        if (!exists) {
          console.warn(`⚠️  文件不存在: ${fullPath}`);
        }
        return exists;
      });

      console.log(`🔍 [Git] 过滤后文件: ${existingFiles.length} 个`);
      existingFiles.forEach((f) => console.log(`   ✓ ${f}`));

      return existingFiles;
    } catch (error: any) {
      console.warn(`⚠️  获取 Git 变更文件失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 检查是否在 Git 仓库中
   */
  private isGitRepository(): boolean {
    try {
      execSync("git rev-parse --git-dir", {
        stdio: "ignore",
        cwd: process.cwd(),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取与上一次提交的差异文件
   */
  private getCommitDiffFiles(): string[] {
    try {
      // 尝试对比上一次提交
      const output = execSync("git diff --name-only HEAD~1 HEAD", {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      const files = output
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);

      if (files.length > 0) {
        return files;
      }

      // 如果没有上一次提交（首次提交），获取当前提交的所有文件
      console.log(`   ℹ️  没有上一次提交，获取当前提交的所有文件`);
      return this.getLastCommitFiles();
    } catch (error) {
      // 降级：获取未提交的变更
      console.log(`   ℹ️  无法对比提交，尝试获取未提交的变更`);
      return this.getUncommittedFiles();
    }
  }

  /**
   * 获取最近一次提交的所有文件
   */
  private getLastCommitFiles(): string[] {
    try {
      const output = execSync(
        "git diff-tree --no-commit-id --name-only -r HEAD",
        {
          encoding: "utf-8",
          cwd: process.cwd(),
        },
      );

      return output
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * 获取未提交的变更文件（降级方案）
   */
  private getUncommittedFiles(): string[] {
    try {
      // 获取未暂存的文件
      const unstagedOutput = execSync("git diff --name-only", {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      // 获取已暂存的文件
      const stagedOutput = execSync("git diff --cached --name-only", {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      const unstagedFiles = unstagedOutput
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);

      const stagedFiles = stagedOutput
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);

      // 合并并去重
      return [...new Set([...unstagedFiles, ...stagedFiles])];
    } catch {
      return [];
    }
  }

  /**
   * 获取最近 N 次提交的变更文件
   */
  async getRecentChangedFiles(commits: number = 1): Promise<string[]> {
    try {
      const output = execSync(`git diff --name-only HEAD~${commits}`, {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      return output
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * 获取当前分支名
   */
  getCurrentBranch(): string {
    try {
      const output = execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      return output.trim();
    } catch {
      return "unknown";
    }
  }

  /**
   * 获取文件的 Git 状态
   */
  getFileStatus(filePath: string): string {
    try {
      const output = execSync(`git status --short "${filePath}"`, {
        encoding: "utf-8",
        cwd: process.cwd(),
      });

      const status = output.trim().substring(0, 2);

      // 解析状态
      if (status.includes("M")) return "modified";
      if (status.includes("A")) return "added";
      if (status.includes("D")) return "deleted";
      if (status.includes("R")) return "renamed";
      if (status.includes("?")) return "untracked";

      return "unchanged";
    } catch {
      return "unknown";
    }
  }
}
