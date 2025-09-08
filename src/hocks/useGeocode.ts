import useSWR from "swr";
import { fetcher } from "@/apis/fetch";
import type { Geocode } from "@/types/type";
import { ERROR_MESSAGE } from "@/configs/message";

export const useGeocode = (address: string): Geocode | null => {
  const key = address?.trim()
    ? (["gsi-geocode", address.trim()] as const)
    : null;

  const { data, error } = useSWR<Geocode, Error>(
    key,
    key ? () => fetcher(address) : null,
    {
      onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
        if (retryCount >= 5) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  if (error) {
    throw new Error(ERROR_MESSAGE.ADDRESS_NOT_FOUND);
  }

  if (!data || typeof data.lat !== "number" || typeof data.lon !== "number") {
    throw new Error(ERROR_MESSAGE.ADDRESS_NOT_FOUND);
  }

  return { lat: data.lat, lon: data.lon };
};
