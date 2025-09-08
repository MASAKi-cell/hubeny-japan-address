import { fetcher } from "@/api/fetch";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import type { Geocode, Ellipsoid } from "@/types/type";
import { ERROR_MESSAGE } from "@/config/message";

export type Coordinates = { lat: number; lon: number };

const isCoords = (v: unknown): v is Coordinates => {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as any).lat === "number" &&
    typeof (v as any).lon === "number"
  );
};

/**
 * Calculate distance between two points.
 * - If both args are coordinates, uses Hubeny directly (sync).
 * - If both args are addresses, geocodes via GSI then applies Hubeny (async).
 */
export const getDistance = async (
  from: string | Coordinates,
  to: string | Coordinates,
  ellipsoid?: Ellipsoid
): Promise<number> => {
  if (isCoords(from) && isCoords(to)) {
    // Hubeny calculation
    return useHubenyDistance(from.lat, from.lon, to.lat, to.lon, ellipsoid);
  }

  if (typeof from === "string" && typeof to === "string") {
    const [p1, p2] = await Promise.all([fetcher(from), fetcher(to)]);
    return useHubenyDistance(p1.lat, p1.lon, p2.lat, p2.lon, ellipsoid);
  }

  throw new Error(ERROR_MESSAGE.INVALID_ARGUMENTS);
};

export type { Geocode };
