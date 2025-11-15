import { BedrockRuntimeClient, InvokeModelCommand, ConversationRole, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"

const client = new BedrockRuntimeClient({ region: "us-east-1"})
const modelId = "amazon.nova-pro-v1:0"

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const index_number = body.indexvalue;
  const index = body.index;
  // inputTextまだまだ修正する必要あり
  const inputText = `use data:\n index_value(Amount of text): ${index_number}\n index(Content): ${index}\n Please check the index and rate the following items (25 points each).\n- Depth of study (higher scores for more detailed and in-depth study)\n- Expertise (higher scores for more technical engineering content)\n- Redundancy (low scores for unnecessarily long sentences used to fill word count)\n- Logic (high scores for easy-to-read sentences)\nConsidering a standard score of 30 points\nThe total score should be output as "TotalScoreIs {totalpoint}.".`
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


   try {
    const response = await client.send(new ConverseCommand(request));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error.message}`);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(err)
    }
  }
}