import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  BLUESKY_USERNAME: str(),
  BLUESKY_PASSWORD: str(),
});
