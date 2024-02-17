import { BskyAgent } from "@atproto/api";

export const login = async (username: string, password: string) => {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: username, password });
  return agent;
};

export const uploadImage = async (
  agent: BskyAgent,
  image: Uint8Array,
  encoding: string,
) => {
  const { data } = await agent.uploadBlob(image, { encoding });
  return data.blob;
};
