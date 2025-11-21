import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const tableName = "2511-TellLate-ws-connection"

export const handler = async (event) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const connectionId = event.requestContext.connectionId;
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        connectionId: connectionId
      }
    });
    const response = await docClient.send(command)

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };
  }
};
