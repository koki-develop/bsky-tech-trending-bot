import { BskyAgent } from "@atproto/api";

export const login = async (username: string, password: string) => {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: username, password });
  return agent;
};
