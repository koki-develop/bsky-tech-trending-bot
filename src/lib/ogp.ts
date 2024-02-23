import ogs from "open-graph-scraper";
import { logger } from "./log";

export const fetchOGP = async (url: string) => {
  logger.info("Fetching OGP...", { url });
  const { result } = await ogs({ url });

  logger.info("Fetched OGP", result);
  return result;
};
