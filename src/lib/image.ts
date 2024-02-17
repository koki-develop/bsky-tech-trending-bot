import sharp from "sharp";

export const fetchImage = async (url: string) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return buffer;
};

export const resizeImage = async (image: ArrayBuffer, width: number) => {
  const resized = await sharp(Buffer.from(image))
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  return resized;
};
