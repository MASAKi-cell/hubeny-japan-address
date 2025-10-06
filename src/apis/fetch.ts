import axios from "axios";
import type { Geocode, GeoType } from "@/types/type";
import { API_ENDPOINT } from "@/configs/apiendpoint";
import { ERROR_MESSAGE } from "@/configs/message";
import { getCache, setCache } from "@/helpers/cache";

// Default TTL for address->geocode cache (1 day)
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

export const fetcher = async (address: string): Promise<Geocode> => {
  try {
    const key = `geocode:${address.trim()}`;
    const cached = getCache(key);
    if (cached) return cached;

    const res = await axios.get<GeoType[]>(
      API_ENDPOINT.addressSearch(address),
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "japan-address-distance/1.0",
        },
      }
    );

    const [lon, lat] = res.data[0]?.geometry?.coordinates ?? [];

    if (!res.data || typeof lat !== "number" || typeof lon !== "number") {
      throw new Error(ERROR_MESSAGE.UNSUPPORTED_REGION);
    }

    const geo: Geocode = { lat, lon };

    // geocodeをキャッシュ
    setCache(key, geo, GEO_TTL_MS);
    return geo;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `${error.response?.status} ${error.response?.statusText}`
      );
    }
    throw error;
  }
};
