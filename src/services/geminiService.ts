import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 安全解析 AI 返回的 JSON 字符串，并处理可能的 Markdown 包裹
 */
function safeJsonParse(text: string) {
  const jsonPattern = /\{[\s\S]*\}/;
  const match = text.match(jsonPattern);
  
  if (!match) {
    throw new Error("AI 响应中未包含有效的 JSON 对象。");
  }

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    const cleaning = match[0]
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\s+/g, " ");
    try {
      return JSON.parse(cleaning);
    } catch (innerError) {
      throw new Error("无法解析 AI 返回的 JSON。");
    }
  }
}

export async function analyzeStaging(config: any, data: any) {
  const allParams = [...config.params.T, ...config.params.N, ...config.params.M];
  
  // 提前提取关键分期代码，辅助 AI 聚焦
  const codes = allParams.map(p => {
    const val = data[p.id];
    if (!val) return null;
    const match = String(val).match(/^[TNM][0-4a-c]+/i);
    return match ? match[0].toUpperCase() : null;
  }).filter(Boolean);

  const prompt = `你是一位精通最新 AJCC 第八版（AJCC 8th Edition）分期指南的胸外科专家。
请根据以下验证过的录入数据，为该患者生成一份专业的 ${config.title} 临床分期评估报告。

### 录入参数详情：
${allParams.map(p => {
  const val = data[p.id];
  return `* [${p.category}] ${p.text}: 【${val || '（该项数据暂缺）'}】`;
}).join('\n')}

### 核心分期参考代码：${codes.length > 0 ? codes.join('') : '无'}

### 诊断及报告指令（严禁违背）：
1. **尊重已录入的“阴性”数据**：
   * 如果录入中出现了 “M0” 或 “N0”，表示临床影像学已做相关检查且结论为阴性。
   * **绝对禁止**在报告中将其描述为 “Mx”、“Nx” 或 “信息缺失”。必须直接使用 M0/N0 计算分期。
2. **分期诊断报告结构**：
   * **[TNM 组合]**：给出完整的临床分期代码（如 T2N0M0）。
   * **[临床分期]**：给出对应的 AJCC 第八版官方分期（如 IA2, IIB, III 期等）。
   * **[判定依据]**：逐一总结 T、N、M 的选定理由。
   * **[诊疗建议]**：给出后续检查或治疗原则的专家建议，并请务必根据 AJCC 第八版相关的统计数据，提供该分期对应的 **5 年预后生存率 (5-year Survival Rate)** 作为参考。
3. **语言风格**：使用严谨、结构化的医学中文。不要使用 Markdown 代码块。

专家报告内容：`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "未能生成分析建议，请重试。";
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    return `抱歉，分析暂时不可用。${error.message || ''}。请检查 API 配置并务必咨询专业医生。`;
  }
}

export async function extractParamsFromReport(config: any, text?: string, images?: { data: string, mimeType: string }[]) {
  const parts: any[] = [];
  
  parts.push({ 
    text: `你是一位专业且细致的胸外科 AI 助手。你的核心任务是执行【医学报告 OCR 与分期参数自动映射】。
请基于用户提供的${images && images.length > 0 ? '报告截图和' : ''}文字，提取出最符合 ${config.title} 最新分期标准的参数。`
  });

  if (images && images.length > 0) {
    images.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
  }

  if (text) {
    parts.push({ text: `报告文字/备注内容：\n${text}` });
  }

  const flatParams = [...config.params.T, ...config.params.N, ...config.params.M];

  const protocol = `
### 分期提取指令：
1. **优先识别 ID 键**：请在 "extractedAnswers" 中返回以下对应的 id。
2. **选择题匹配标准**：
   - 对于 \`select\` 类型，报告中描述的临床分期（如 T1, N2, M1c 等）必须映射到下面提供的 \`options\` 数组中。
   - **值必须完全匹配或包含关键代码**：例如，如果报告符合 T4，你必须返回 \`options\` 中包含 "T4" 的完整字符串。
3. **数值提取**：
   - 对于 \`number\` 类型，仅提取数值，排除 "cm" 等单位。
4. **推理过程 (reasoning)**：在 reasoning 字段中写明你推导每个参数的依据。

### 可提取参数定义列表 (JSON)：
${JSON.stringify(flatParams.map(p => ({ id: p.id, type: p.type, category: p.category, text: p.text, options: p.options })), null, 2)}

**输出格式限制**：严格返回纯 JSON 对象。`;

  try {
    parts.push({ text: protocol });
    
    // 动态构建 Schema，确保符合 SDK 对象必须包含属性的规则
    const properties: any = {};
    flatParams.forEach(p => {
      properties[p.id] = {
        type: p.type === 'number' ? Type.NUMBER : Type.STRING,
        description: `Value for ${p.text}`
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedAnswers: {
              type: Type.OBJECT,
              properties: properties,
              description: "Mapping of parameter IDs to extracted values"
            },
            reasoning: {
              type: Type.STRING,
              description: "Detailed explanation of the extraction basis"
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score (0.0 - 1.0)"
            }
          },
          required: ["extractedAnswers", "reasoning", "confidence"]
        }
      }
    });

    const parsed = safeJsonParse(response.text || "{}");
    console.log("Extracted Data:", parsed);
    return parsed;
  } catch (error: any) {
    console.error("Extraction service error:", error);
    // 容错处理：如果 Schema 导致失败，尝试不带 Schema 的普通调用
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...parts, { text: "请严格返回 JSON 格式，包含 extractedAnswers (键值对), reasoning (字符串), confidence (数字) 三个字段。" }],
      });
      return safeJsonParse(fallbackResponse.text || "{}");
    } catch (fallbackError) {
      throw error;
    }
  }
}
