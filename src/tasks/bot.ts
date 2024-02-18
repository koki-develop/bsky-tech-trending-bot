import { AppBskyEmbedExternal } from "@atproto/api";
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

  for (const feedUrl of feeds) {
    const feed = await fetchRSS(feedUrl);

    feed.items.reverse(); // oldest first
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

      const ogp = await fetchOGP(item.link);
      const title = ogp.ogTitle ?? item.title;
      if (title == null) {
        logger.warn("No title", item);
        continue;
      }
      const description = ogp.ogDescription ?? "";

      const params: { text: string; embed?: AppBskyEmbedExternal.Main } = {
        text: `${title}\n${item.link}`,
      };

      const imageUrl = ogp.ogImage?.at(0)?.url;
      if (imageUrl != null) {
        const image = await fetchImage(imageUrl);
        const resized = await resizeImage(image, 800);
        const blob = await uploadImage(
          agent,
          new Uint8Array(resized),
          "image/jpeg",
        );

        const embed: AppBskyEmbedExternal.Main = {
          $type: "app.bsky.embed.external",
          external: {
            title,
            description,
            uri: item.link,
            thumb: blob,
          },
        };
        params.embed = embed;
      }

      await post(agent, params.text, params.embed);
      await saveItem(item.link);
    }
  }
})();
