type Entry = { value: string; expiresAt: number };

export const cache = new Map<string, Entry>();

export const getCache = (key: string) => {
  const hit = cache.get(key);
  if (!hit) return;

  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return;
  }
  return hit.value;
};

export const setCache = (key: string, value: string, ttlMs: number) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};
