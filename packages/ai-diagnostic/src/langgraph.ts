/**
 * LangGraph 工作流实现
 */

import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface DiagnosticState {
  error: any;
  analysis: string;
  suggestion: string;
  fixedCode: string;
  filePath: string;
  autoFix: boolean;
  retryCount: number;
  messages: any[];
}

export class DiagnosticGraph {
  private llm: ChatOpenAI;
  private graph: any;
  private maxRetries: number;

  constructor(
    apiKey: string,
    apiUrl: string,
    model: string = "gpt-4",
    maxRetries: number = 3,
    temperature: number = 0.1,
    maxTokens: number = 4000,
  ) {
    this.maxRetries = maxRetries;

    console.log("🔧 [LangGraph] 初始化 LLM...");
    console.log("📝 [配置] 模型:", model);
    console.log("📝 [配置] API URL:", apiUrl);
    console.log("📝 [配置] API Key:", apiKey ? "已配置" : "未配置");

    // 创建配置对象，不包含 top_p（避免与 Claude 等模型冲突）
    const llmConfig: any = {
      openAIApiKey: apiKey,
      configuration: {
        baseURL: apiUrl,
      },
      modelName: model,
      temperature,
      maxTokens,
    };

    this.llm = new ChatOpenAI(llmConfig);

    // 覆盖 invocationParams 方法，移除 top_p 参数
    // 这是为了兼容 Claude 等不支持同时使用 temperature 和 top_p 的模型
    const originalInvocationParams = this.llm.invocationParams.bind(this.llm);
    this.llm.invocationParams = (options: any) => {
      const params = originalInvocationParams(options);
      delete params.top_p;
      return params;
    };

    this.graph = this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph<DiagnosticState>({
      channels: {
        error: null,
        analysis: null,
        suggestion: null,
        fixedCode: null,
        filePath: null,
        autoFix: null,
        retryCount: null,
        messages: null,
      },
    });

    workflow.addNode("analyze", this.analyzeNode.bind(this));
    workflow.addNode("suggest", this.suggestNode.bind(this));
    // 自动修复节点已注释（功能不够稳定）
    // workflow.addNode("fix", this.fixNode.bind(this));
    // workflow.addNode("validate", this.validateNode.bind(this));

    workflow.addEdge(START, "analyze");
    workflow.addEdge("analyze", "suggest");
    // 直接结束，不再进行自动修复
    workflow.addEdge("suggest", END);

    // 自动修复流程已注释
    // workflow.addConditionalEdges("suggest", this.shouldFix.bind(this), {
    //   fix: "fix",
    //   end: END,
    // });
    // workflow.addEdge("fix", "validate");
    // workflow.addConditionalEdges("validate", this.shouldRetry.bind(this), {
    //   retry: "analyze",
    //   end: END,
    // });

    return workflow.compile();
  }

  private async analyzeNode(
    state: DiagnosticState,
  ): Promise<Partial<DiagnosticState>> {
    console.log("🔍 [LangGraph] 正在分析错误...");

    const systemPrompt = new SystemMessage(
      "你是一个专业的前端代码诊断专家，精通 Vue3、TypeScript、Vite 和 uni-app。请简洁明了地分析问题。",
    );

    const userPrompt = new HumanMessage(`
请分析以下构建错误：

错误类型: ${state.error.type}
错误信息: ${state.error.message}
文件路径: ${state.error.file || "未知"}

请简洁地说明（3-5句话）：
1. 错误的根本原因
2. 影响范围
3. 严重程度
`);

    const response = await this.llm.invoke([systemPrompt, userPrompt]);
    const analysis = response.content.toString();

    return {
      analysis,
      messages: [...(state.messages || []), systemPrompt, userPrompt, response],
    };
  }

  private async suggestNode(
    state: DiagnosticState,
  ): Promise<Partial<DiagnosticState>> {
    console.log("💡 [LangGraph] 正在生成修复建议...");

    // 提取错误相关的代码片段
    let codeContext = "";
    if (state.error.code && state.error.message) {
      // 尝试从错误信息中提取行号
      const lineMatch = state.error.message.match(/\((\d+):(\d+)\)/);
      if (lineMatch) {
        const errorLine = parseInt(lineMatch[1]);
        const lines = state.error.code.split("\n");

        // 提取错误行前后各5行作为上下文
        const startLine = Math.max(0, errorLine - 6);
        const endLine = Math.min(lines.length, errorLine + 4);
        const contextLines = lines.slice(startLine, endLine);

        codeContext = `
相关代码片段（第 ${startLine + 1}-${endLine} 行）：
\`\`\`
${contextLines
  .map((line, idx) => {
    const lineNum = startLine + idx + 1;
    const marker = lineNum === errorLine ? " ← 错误位置" : "";
    return `${lineNum}: ${line}${marker}`;
  })
  .join("\n")}
\`\`\`
`;
      } else if (state.error.code.length < 2000) {
        // 如果代码不长，显示完整代码
        codeContext = `
完整代码：
\`\`\`
${state.error.code}
\`\`\`
`;
      }
    }

    const userPrompt = new HumanMessage(`
基于以下错误分析，请提供具体的修复建议：

错误分析：
${state.analysis}

错误详情：
- 类型: ${state.error.type}
- 信息: ${state.error.message}
- 文件: ${state.error.file || "未知"}

${codeContext}

请提供精确的修复建议，格式如下：

1. 修复步骤:
   1. [具体步骤1]
   2. [具体步骤2]
   3. [具体步骤3]

2. 需要修改的代码位置: [文件名] 的第 [X] 行

3. 修改后的代码示例:
   \`\`\`[语言]
   [只显示需要修改的那几行代码，保持原有缩进]
   \`\`\`

4. 预防建议: [一句话说明如何避免类似错误]

注意：
- 代码示例必须基于实际的源代码，保持正确的语法和缩进
- 只显示需要修改的关键代码行，不要显示整个文件
- 确保修改后的代码可以直接使用
`);

    const response = await this.llm.invoke([...state.messages, userPrompt]);
    const suggestion = response.content.toString();

    return {
      suggestion,
      messages: [...state.messages, userPrompt, response],
    };
  }

  // 自动修复节点已注释（功能不够稳定）
  // private async fixNode(
  //   state: DiagnosticState
  // ): Promise<Partial<DiagnosticState>> {
  //   console.log("🔧 [LangGraph] 正在生成修复代码...");

  //   if (!state.error.code || !state.error.file) {
  //     return { fixedCode: "", filePath: "" };
  //   }

  //   try {
  //     const systemPrompt = new SystemMessage(
  //       `你是代码修复助手。返回修复后的完整文件内容，不要解释。`
  //     );

  //     const userPrompt = new HumanMessage(`
  // 文件（${state.error.code.split("\n").length} 行）：
  // ${state.error.code}

  // 错误：${state.error.message}

  // 输出修复后的完整文件：
  // `);

  //     console.log("📤 [调试] 发送修复请求...");
  //     console.log(
  //       "📤 [调试] 原始文件行数:",
  //       state.error.code.split("\n").length
  //     );

  //     const response = await this.llm.invoke([systemPrompt, userPrompt]);
  //     let fixedCode = response.content.toString().trim();

  //     console.log("📥 [调试] AI 返回内容长度:", fixedCode.length);
  //     console.log("📥 [调试] 原始代码长度:", state.error.code.length);
  //     console.log("📥 [调试] 返回内容行数:", fixedCode.split("\n").length);

  //     if (fixedCode.length === 0) {
  //       console.error("❌ [调试] AI 返回空内容，可能是 API 调用失败");
  //       return { fixedCode: "", filePath: "" };
  //     }

  //     fixedCode = fixedCode
  //       .replace(/^```[\w]*\n?/gm, "")
  //       .replace(/\n?```$/gm, "")
  //       .trim();

  //     console.log("📥 [调试] 清理后内容长度:", fixedCode.length);

  //     const finalLengthRatio = fixedCode.length / state.error.code.length;
  //     console.log(
  //       `✅ [调试] 最终代码长度比例: ${(finalLengthRatio * 100).toFixed(0)}%`
  //     );

  //     return {
  //       fixedCode,
  //       filePath: state.error.file,
  //       messages: [...state.messages, userPrompt, response],
  //     };
  //   } catch (error: any) {
  //     console.error("❌ [调试] fixNode 执行失败:", error.message);
  //     return { fixedCode: "", filePath: "" };
  //   }
  // }

  // private async validateNode(
  //   state: DiagnosticState
  // ): Promise<Partial<DiagnosticState>> {
  //   console.log("✅ [LangGraph] 正在验证修复...");
  //   return state;
  // }

  // private shouldFix(state: DiagnosticState): string {
  //   if (state.autoFix && state.error.file && state.error.code) {
  //     return "fix";
  //   }
  //   return "end";
  // }

  // private shouldRetry(state: DiagnosticState): string {
  //   if (state.retryCount < this.maxRetries && !state.fixedCode) {
  //     return "retry";
  //   }
  //   return "end";
  // }

  async run(error: any, autoFix: boolean = false): Promise<DiagnosticState> {
    const initialState: DiagnosticState = {
      error,
      analysis: "",
      suggestion: "",
      fixedCode: "",
      filePath: "",
      autoFix,
      retryCount: 0,
      messages: [],
    };

    try {
      console.log("🚀 [LangGraph] 启动诊断工作流...\n");
      const result = await this.graph.invoke(initialState);
      console.log("✨ [LangGraph] 诊断工作流完成\n");
      return result;
    } catch (error: any) {
      console.error("❌ [LangGraph] 工作流执行失败:", error.message);
      throw error;
    }
  }
}
