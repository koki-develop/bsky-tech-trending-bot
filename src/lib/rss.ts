import Parser from "rss-parser";

const parser = new Parser();

export const fetchRSS = async (url: string) => {
  const feed = await parser.parseURL(url);
  return feed;
};
