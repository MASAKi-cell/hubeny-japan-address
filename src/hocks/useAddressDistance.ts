import { useGeocode } from "@/hocks/useGeocode";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import type { Ellipsoid } from "@/types/type";

/**
 * React hook: compute distance between two addresses.
 * - Geocodes each address via GSI with SWR caching.
 * - Applies Hubeny distance when both geocodes resolve.
 */
export const useAddressDistance = (
  fromAddress: string,
  toAddress: string,
  ellipsoid?: Ellipsoid
): number | null => {
  const from = useGeocode(fromAddress);
  const to = useGeocode(toAddress);

  if (!from || !to) return null;
  return useHubenyDistance(from.lat, from.lon, to.lat, to.lon, ellipsoid);
};
