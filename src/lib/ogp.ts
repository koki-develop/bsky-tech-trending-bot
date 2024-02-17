import ogs from "open-graph-scraper";

export const fetchOGP = async (url: string) => {
  const { result } = await ogs({ url });
  return result;
};
