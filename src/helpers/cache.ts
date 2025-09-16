import type { Entry, Geocode } from "@/types/type";

// In-memory TTL cache. Values are lost on page reload / process restart.
const cache = new Map<string, Entry<Geocode>>();

export const getCache = (key: string): Geocode | undefined => {
  const hit = cache.get(key);
  if (!hit) return undefined;

  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
};

export const setCache = (key: string, value: Geocode, ttlMs: number): void => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const deleteCache = (key: string): void => {
  cache.delete(key);
};

export const clearCache = (): void => {
  cache.clear();
};

export const hasCache = (key: string): boolean => {
  const v = cache.get(key);
  if (!v) return false;
  if (Date.now() > v.expiresAt) {
    cache.delete(key);
    return false;
  }
  return true;
};
