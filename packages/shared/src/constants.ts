/**
 * 共享常量定义
 */

export const PLUGIN_PREFIX = "vite-plugin";

export const DEFAULT_CONFIG = {
  enabled: true,
  debug: false,
};

export const FILE_EXTENSIONS = {
  vue: [".vue"],
  typescript: [".ts", ".tsx"],
  javascript: [".js", ".jsx"],
  all: [".vue", ".ts", ".tsx", ".js", ".jsx"],
};

export const ERROR_TYPES = {
  BUILD: "build",
  TRANSFORM: "transform",
  RENDER: "render",
};
