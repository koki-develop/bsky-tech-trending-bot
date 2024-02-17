import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "./log";

const db = new DynamoDBClient({ region: "us-east-1" });

const tables = {
  items: "bsky-tech-trending-bot-items",
} as const;

export const saveItem = async (url: string) => {
  logger.info("Saving item...", url);
  const date = new Date();
  date.setDate(date.getUTCDate() + 7);
  const ttl = Math.floor(date.getTime() / 1000);

  await db.send(
    new PutItemCommand({
      TableName: tables.items,
      Item: {
        url: { S: url },
        ttl: { N: ttl.toString() },
      },
    }),
  );
  logger.info("Saved item", url);
};

export const existsItem = async (url: string) => {
  const response = await db.send(
    new GetItemCommand({
      TableName: tables.items,
      Key: {
        url: { S: url },
      },
    }),
  );

  return response.Item != null;
};
