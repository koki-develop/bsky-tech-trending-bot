import fs from "fs";
import { AppBskyEmbedExternal } from "@atproto/api";
import { OgObject } from "open-graph-scraper/dist/lib/types";
import { feeds } from "../../feeds";
import { login, post, uploadImage } from "../lib/bsky";
import { existsItem, saveItem } from "../lib/db";
import { env } from "../lib/env";
import { fetchImage, resizeImage } from "../lib/image";
import { logger } from "../lib/log";
import { fetchOGP } from "../lib/ogp";
import { fetchRSS } from "../lib/rss";
import { sleep } from "../lib/util";

(async () => {
  const agent = await login(env.BLUESKY_USERNAME, env.BLUESKY_PASSWORD);
  const summaryLines: string[] = [
    "# New Posts",
    "",
    "| Title | Link |",
    "| --- | --- |",
  ];

  for (const feedUrl of feeds) {
    const feed = await fetchRSS(feedUrl);

    feed.items.reverse(); // oldest first
    for (const item of feed.items) {
      await sleep(1000);

      if (item.link == null) {
        logger.warn("No link", item);
        continue;
      }
      logger.info("Processing", { link: item.link });

      const exists = await existsItem(item.link);
      if (exists) {
        logger.info("Already posted", { link: item.link });
        continue;
      }

      const ogp = await fetchOGP(item.link).catch((err) => {
        logger.warn("Failed to fetch OGP", err);
        return {} as OgObject;
      });
      const title = ogp.ogTitle ?? item.title;
      if (title == null) {
        logger.warn("No title", item);
        continue;
      }

      const params: { text: string; embed?: AppBskyEmbedExternal.Main } = {
        text: `${title}\n${item.link}`,
      };

      const embed: AppBskyEmbedExternal.Main = {
        $type: "app.bsky.embed.external",
        external: {
          title,
          description: ogp.ogDescription ?? "",
          uri: item.link,
        },
      };

      const imageUrl = ogp.ogImage?.at(0)?.url;
      if (imageUrl != null) {
        await fetchImage(imageUrl)
          .then(async (image) => {
            const resized = await resizeImage(image, 800);
            const blob = await uploadImage(
              agent,
              new Uint8Array(resized),
              "image/jpeg",
            );
            embed.external.thumb = blob;
          })
          .catch((err) => {
            logger.warn("Failed to fetch image", err);
          });
      }
      params.embed = embed;

      await post(agent, params.text, params.embed);
      await saveItem(item.link);

      summaryLines.push(`| ${title} | ${item.link} |`);
    }
  }

  fs.writeFileSync("summary.md", summaryLines.join("\n"));
})();
