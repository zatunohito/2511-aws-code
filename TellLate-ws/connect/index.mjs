import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = "2511-TellLate-ws-connection";

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId

  console.log("connectionId: ", connectionId)
  try {
    // write content to dynamoDB
    const command = {
      TableName: tableName,
      Item: {
        connectionId: connectionId,
        connectedAt: Date.new().toISOString()
      },
    }
    const response = await docClient.send(new PutCommand(command));

    return {
      statusCode: 200,
      body: JSON.stringiffy(response)
    }

  } catch(error) {
    console.log("error: ", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to Connect"})
    }
  };
}
