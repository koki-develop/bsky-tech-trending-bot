import Parser from "rss-parser";
import { logger } from "./log";

const parser = new Parser();

export const fetchRSS = async (url: string) => {
  logger.info(`Fetching ${url}`);
  const feed = await parser.parseURL(url);

  logger.info(`Fetched ${url}`);
  return feed;
};
