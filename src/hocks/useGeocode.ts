import useSWR from "swr";
import { fetcher } from "../api/fetch";
import { API_ENDPOINT } from "../config/apiendpoint";

export type Geocode = { lat: number; lon: number };

export const useGeocode = (address: string): Geocode | null => {
  const key = address?.trim()
    ? (["gsi-geocode", address.trim()] as const)
    : null;
  const { data, error } = useSWR<Geocode, Error>(
    key,
    fetcher(API_ENDPOINT.addressSearch(address)),
    {
      onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
        if (retryCount >= 5) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  if (error) {
    throw new Error("Address not found");
  }

  if (typeof data?.lat !== "number" || typeof data?.lon !== "number") {
    throw new Error("Address not found");
  }

  return { lat: data.lat, lon: data.lon };
};
