import sharp from "sharp";

export const fetchImage = async (url: string) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const image = await sharp(Buffer.from(buffer))
    .resize({ width: 800, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  return new Uint8Array(image);
};
