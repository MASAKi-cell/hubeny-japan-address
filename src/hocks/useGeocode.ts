import useSWR from "swr";
import { fetcher } from "../api/fetch";
import { API_ENDPOINT } from "../config/apiendpoint";

export type Geocode = { lat: number; lon: number };

export const useGeocode = (address: string): Promise<Geocode | null> => {
  const { data, error } = useSWR<Geocode, Error>(
    API_ENDPOINT.addressSearch(address),
    fetcher,
    {
      onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
        if (retryCount >= 5) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  if (error) {
    return Promise.reject(null);
  }

  if (typeof data?.lat !== "number" || typeof data?.lon !== "number") {
    return Promise.reject(null);
  }

  return { lat: data.lat, lon: data.lon };
};
