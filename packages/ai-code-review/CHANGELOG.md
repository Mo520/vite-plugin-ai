# vite-plugin-ai-code-review

## 1.2.0

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

## 1.1.0

### Minor Changes

- Fix dependency: change vite-plugin-ai-shared from workspace to npm version

### Patch Changes

- Updated dependencies
  - vite-plugin-ai-shared@1.0.2
