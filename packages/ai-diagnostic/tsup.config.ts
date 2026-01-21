import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "vite",
    "vite-plugin-ai-shared",
    "picocolors",
    "@langchain/core",
    "@langchain/openai",
    "@langchain/langgraph",
    "glob",
  ],
  noExternal: [],
  treeshake: false,
  minify: false,
  target: "node18",
  shims: true,
  platform: "node",
  esbuildOptions(options) {
    options.charset = "utf8";
  },
});
