import type { Geocode } from "@/types/type";
import { API_ENDPOINT } from "@/config/apiendpoint";

export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "japan-address-distance/1.0",
      Referer: location.origin,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};
