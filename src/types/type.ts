export type Geocode = { lat: number; lon: number };

export type Ellipsoid = "GRS80" | "WGS84";
export type Entry<T> = { value: T; expiresAt: number };

export type GeoType = {
  geometry: { coordinates: number[]; type: string };
  type: string;
  properties: {
    addressCode: string;
    title: string;
  };
};
