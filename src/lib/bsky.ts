import { BskyAgent } from "@atproto/api";
import { logger } from "./log";

export const login = async (username: string, password: string) => {
  logger.info("Logging in...");
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: username, password });

  logger.info("Logged in");
  return agent;
};

export const uploadImage = async (
  agent: BskyAgent,
  image: Uint8Array,
  encoding: string,
) => {
  logger.info("Uploading image...");
  const { data } = await agent.uploadBlob(image, { encoding });

  logger.info("Uploaded image");
  return data.blob;
};
