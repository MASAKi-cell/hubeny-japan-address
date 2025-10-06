import { fetcher } from "@/apis/fetch";
import type { Geocode } from "@/types/type";
import { ERROR_MESSAGE } from "@/configs/message";

export const useGeocode = async (address: string): Promise<Geocode | null> => {
  const data = await fetcher(address);

  if (!data || typeof data.lat !== "number" || typeof data.lon !== "number") {
    throw new Error(ERROR_MESSAGE.UNSUPPORTED_REGION);
  }

  return { lat: data.lat, lon: data.lon };
};
