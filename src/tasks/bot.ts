import { AppBskyEmbedExternal, AppBskyFeedPost, RichText } from "@atproto/api";
import winston from "winston";
import { feeds } from "../../feeds";
import { login, uploadImage } from "../lib/bsky";
import { existsItem, saveItem } from "../lib/db";
import { env } from "../lib/env";
import { fetchImage, resizeImage } from "../lib/image";
import { fetchOGP } from "../lib/ogp";
import { fetchRSS } from "../lib/rss";
import { sleep } from "../lib/util";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [new winston.transports.Console()],
});

(async () => {
  logger.info("Logging in...");
  const agent = await login(env.BLUESKY_USERNAME, env.BLUESKY_PASSWORD);
  logger.info("Logged in");

  for (const feedUrl of feeds) {
    logger.info(`Fetching ${feedUrl}`);
    const feed = await fetchRSS(feedUrl);
    logger.info(`Fetched ${feedUrl}`);

    for (const item of feed.items) {
      await sleep(1000);

      if (item.link == null) {
        logger.warn("No link", item);
        continue;
      }
      logger.info(`Processing ${item.link}`);

      const exists = await existsItem(item.link);
      if (exists) {
        logger.info("Already posted", item.link);
        continue;
      }

      logger.info("Fetching OGP...");
      const ogp = await fetchOGP(item.link);
      logger.info("Fetched OGP", ogp);

      const title = ogp.ogTitle ?? item.title;
      if (title == null) {
        logger.warn("No title", item);
        continue;
      }

      const description = ogp.ogDescription ?? "";

      const richText = new RichText({ text: `${title}\n${item.link}` });
      await richText.detectFacets(agent);

      const record: Partial<AppBskyFeedPost.Record> &
        Omit<AppBskyFeedPost.Record, "createdAt"> = {
        text: richText.text,
        facets: richText.facets,
      };

      const imageUrl = ogp.ogImage?.at(0)?.url;
      if (imageUrl != null) {
        logger.info("Fetching image...", imageUrl);
        const image = await fetchImage(imageUrl);
        logger.info("Fetched image", imageUrl);

        logger.info("Resizing image...");
        const resized = await resizeImage(image, 800);
        logger.info("Resized image");

        logger.info("Uploading image...");
        const blob = await uploadImage(
          agent,
          new Uint8Array(resized),
          "image/jpeg",
        );
        logger.info("Uploaded image", imageUrl);

        const embed: AppBskyEmbedExternal.Main = {
          $type: "app.bsky.embed.external",
          external: {
            title,
            description,
            uri: item.link,
            thumb: blob,
          },
        };
        record.embed = embed;
      }

      logger.info("Posting...", record);
      await agent.post(record);
      logger.info("Posted", record);

      logger.info("Saving item...", item.link);
      await saveItem(item.link);
      logger.info("Saved item", item.link);
    }
  }
})();
