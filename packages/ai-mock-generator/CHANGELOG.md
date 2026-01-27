# vite-plugin-ai-mock-generator

## 1.3.1

### Patch Changes

- fix: add Claude model compatibility by removing top_p parameter

  Fix compatibility issue with Claude and other models that don't support using both `temperature` and `top_p` parameters simultaneously.

  **Changes:**

  - Override `invocationParams` method to remove `top_p` parameter
  - Prevents "400 temperature and top_p cannot both be specified" error
  - Maintains compatibility with OpenAI models

  **Supported Models:**

  - ✅ OpenAI (gpt-4, gpt-3.5-turbo, etc.)
  - ✅ Claude (claude-3-opus, claude-3-sonnet, claude-haiku-4-5, etc.)
  - ✅ Any OpenAI-compatible API

  **Technical Details:**
  LangChain's ChatOpenAI class defaults to setting `top_p: 1`. This fix removes the parameter before sending to the API, allowing models like Claude to work correctly with the `temperature` parameter.

## 1.3.0

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

## 1.2.0

### Minor Changes

- Fix dependency: change vite-plugin-ai-shared from workspace to npm version

### Patch Changes

- Updated dependencies
  - vite-plugin-ai-shared@1.0.2
