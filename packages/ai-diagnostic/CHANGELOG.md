# vite-plugin-ai-diagnostic

## 1.1.0

### Minor Changes

- feat: expose temperature and maxTokens configuration parameters

  All plugins now support configurable `temperature` and `maxTokens` parameters instead of hardcoded values:

  - **vite-plugin-ai-diagnostic**: temperature=0.1, maxTokens=4000 (precise analysis)
  - **vite-plugin-ai-code-review**: temperature=0.2, maxTokens=4000 (consistent review)
  - **vite-plugin-ai-perf-analyzer**: temperature=0.2, maxTokens=4000 (objective analysis)
  - **vite-plugin-ai-i18n**: temperature=0.3, maxTokens=4000 (translation flexibility)
  - **vite-plugin-ai-mock-generator**: temperature=0.7, maxTokens=4000 (creative data generation)

  Users can now customize these parameters in their vite.config.ts:

  ```typescript
  vitePluginAIDiagnostic({
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.1, // custom temperature
    maxTokens: 2000, // custom max tokens
  });
  ```

## 1.0.10

### Patch Changes

- Fix dependency: change vite-plugin-ai-shared from workspace to npm version
- Updated dependencies
  - vite-plugin-ai-shared@1.0.2

## 1.0.10

### Patch Changes

- Fix dependency: change vite-plugin-ai-shared from workspace to npm version (^1.0.1)

## 1.0.9

### Patch Changes

- Improve AI fix suggestions accuracy: AI now sees actual source code context
- Extract error line and surrounding code (±5 lines) for better analysis
- Provide more precise code examples based on actual source code
- Better formatted suggestions with clear step-by-step instructions

## 1.0.8

### Patch Changes

- Fix ESM module compatibility: externalize Node.js built-in modules (fs, path, glob)
- Improve banner for ESM builds to support dynamic require

## 1.0.7

### Patch Changes

- Add proactive file scanning feature: automatically scan all source files in `src` directory at build start
- Detect potential issues before build errors occur (Vue file structure, bracket matching, module imports)
- **Merge multiple errors into single report**: All errors are now combined in one HTML/Markdown/JSON report
- Add `glob` dependency for file scanning
- Improve error detection coverage and user experience

## 1.0.6

### Patch Changes

- Optimize npm keywords for better discoverability

## 1.0.5

### Patch Changes

- Updated dependencies
  - vite-plugin-ai-shared@1.0.1

## 1.0.4

### Patch Changes

- Fix ESM syntax errors by disabling treeshake and adding charset option

## 1.0.3

### Patch Changes

- Fix bundle size by externalizing dependencies and fixing ESM dynamic require issues

## 1.0.2

### Patch Changes

- Add default export for better developer experience

## 1.0.1

### Patch Changes

- Support Vite 4, 5, 6, and 7
