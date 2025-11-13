import { BedrockRuntimeClient, InvokeModelCommand, ConversationRole, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"

const client = new BedrockRuntimeClient({ region: "us-east-1"})
const modelId = "amazon.nova-pro-v1:0"

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const index_number = body.indexvalue;
  const index = body.index;
  // inputTextまだまだ修正する必要あり
  const inputText = `use data:\n index_value: ${index_number}\n index: ${index}\n`
  const message = {
      content: [{ text: inputText }],
      role: ConversationRole.USER
    };
  const request = {
     modelId,
     messages: [message],
     InferenceConfig: {
       maxTokens: 100,
       temperature: 0.5,
     }
   }
}