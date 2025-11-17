import { BedrockRuntimeClient, InvokeModelCommand, ConversationRole, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"

const client = new BedrockRuntimeClient({ region: "us-east-1" })
const modelId = "amazon.nova-pro-v1:0"

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const index_number = body.indexvalue;
  const index = body.index;

  // ⚠️ ポイント: JSONテンプレート内の変数をエスケープし、
  // maxTokensを増やすことで、モデルが完全なJSONを出力できるようにする
  const inputText = `
🎯 Objective:
Evaluate the quality of a given text snippet based on four distinct criteria (Depth, Expertise, Conciseness, and Logic). The final score is a weighted value derived from the average quality score multiplied by the snippet's character count.

---
📝 Input Data Structure:
- The text snippet to evaluate is: ${index}
- Its character count is: ${index_number}
---

🔍 Evaluation Criteria (Score Range: 0.0 to 1.0):
Assess the snippet against the following four criteria, assigning a score where 1.0 is the highest quality.

1. Learning Depth (D): How detailed, profound, and non-superficial is the information?
   - High Score: Provides new insights or covers fundamental concepts in a thorough way.
   
2. Expertise Level (E): Is the content relevant and useful for a professional engineer, reflecting specialized knowledge?
   - High Score: Uses precise terminology, discusses specific algorithms, design patterns, or advanced technical features.
   
3. Conciseness (R): Is the content efficient and free from unnecessary verbosity or repetition?
   - High Score: Information density is high; key points are delivered directly.
   
4. Clarity & Logic (L): Is the text logically structured, easy to read, and coherent?
   - High Score: Good flow, proper use of transitions, clear sentence structure, and effective paragraphing.

---
💻 Required Output Format:
The output MUST be a complete JSON object, strictly following the schema below. Fill in the 'D_score', 'E_score', 'R_score', 'L_score', 'Q_avg', 'S_weighted' placeholders, and provide a detailed justification for each score (max 100 chars each).

\`\`\`json
{
  "snippet_index": "${index}", 
  "character_count": ${index_number},
  "scores": {
    "learning_depth": D_score,  
    "expertise_level": E_score, 
    "conciseness": R_score,     
    "clarity_logic": L_score    
  },
  "calculation_steps": {
    "average_quality_score": "AVG(D_score, E_score, R_score, L_score)",
    "weighted_score": "average_quality_score * character_count"
  },
  "final_results": {
    "average_quality_score": Q_avg,
    "final_weighted_score": S_weighted
  },
  "justification": {
    "learning_depth": "Brief explanation for D_score (max 100 chars)",
    "expertise_level": "Brief explanation for E_score (max 100 chars)",
    "conciseness": "Brief explanation for R_score (max 100 chars)",
    "clarity_logic": "Brief explanation for L_score (max 100 chars)"
  }
}
\`\`\`

---
🚀 Execution Instruction:
Evaluate the provided snippet using the criteria above and generate the complete JSON object ONLY as the final output. Do not add any extra text, comments, or explanations outside of the JSON structure.
`;

  const message = {
    content: [{ text: inputText }],
    role: ConversationRole.USER
  };
  const request = {
    modelId,
    messages: [message],
    config: {
      // ⚠️ 修正: JSON出力に必要なトークン数を確保するため、100から1024に増加
      maxTokens: 1024,
      temperature: 0.5,
    }
  }


  try {
    const response = await client.send(new ConverseCommand(request));
    const modelOutputText = response.output?.message?.content?.[0]?.text;

    // BedrockのレスポンスがJSON文字列であることを期待して、そのまま返す
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      // モデルの出力はすでにJSON文字列であるべきなので、そのままbodyに入れる
      body: modelOutputText
    }
  } catch (err) {
    console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${err.message}`);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: `Bedrock invocation failed: ${err.message}` })
    }
  }
}