import sharp from "sharp";
import { logger } from "./log";

export const fetchImage = async (url: string) => {
  logger.info("Fetching image...", { url });
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  logger.info("Fetched image", { url });
  return buffer;
};

export const resizeImage = async (image: ArrayBuffer, width: number) => {
  logger.info("Resizing image...");
  const resized = await sharp(Buffer.from(image))
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  logger.info("Resized image");
  return resized;
};
