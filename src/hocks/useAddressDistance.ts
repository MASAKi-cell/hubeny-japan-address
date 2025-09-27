import { useGeocode } from "@/hocks/useGeocode";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import type { Ellipsoid } from "@/types/type";

/**
 * compute distance between two addresses.
 * - Geocodes each address via GSI with SWR caching.
 * - Applies Hubeny distance when both geocodes resolve.
 */
export const useAddressDistance = async (
  fromAddress: string,
  toAddress: string,
  ellipsoid?: Ellipsoid
): Promise<number | null> => {
  const from = await useGeocode(fromAddress);
  const to = await useGeocode(toAddress);

  if (!from || !to) return null;
  return useHubenyDistance(from.lat, from.lon, to.lat, to.lon, ellipsoid);
};
