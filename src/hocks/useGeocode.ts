import { fetcher } from "@/apis/fetch";
import type { Geocode } from "@/types/type";

export const useGeocode = async (address: string): Promise<Geocode | null> => {
  const data = await fetcher(address);
  return { lat: data.lat, lon: data.lon };
};
