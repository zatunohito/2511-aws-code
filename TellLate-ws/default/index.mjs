// This is WebSocket Application.
// This belong $default route.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = "2511-TellLate-ws-connection"

export const handler = async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const endpoint = `https://${domain}/${stage}`;

  try {
    const body = JSON.parse(event.body);
    const title = body.title;
    const content = body.content;
    const snippetScore = body.snippetScore;
    const apiGwClient = new ApiGatewayManagementApiClient({
      endpoint
    });

    const scanCommand = new ScanCommand({
      TableName: tableName
    });

    const scanResult = await docClient.send(scanCommand);

    const postPromises = scanResult.Items.map(async ({ connectionId: connectionId }) => {
      try {
        await apiGwClient.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({
              title,
              content,
              snippetScore
            })
          })
        )
  } catch (error) {
      console.log(error);
    }
  })
  } catch (error) {
    console.log(error);
  }
};
