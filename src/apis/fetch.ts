import axios from "axios";
import type { Geocode, GeoType } from "@/types/type";
import { API_ENDPOINT } from "@/configs/apiendpoint";

export const fetcher = async (address: string): Promise<Geocode> => {
  try {
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
    return { lat, lon };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `${error.response?.status} ${error.response?.statusText}`
      );
    }
    throw error;
  }
};
