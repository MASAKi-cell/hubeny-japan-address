import { describe, it, expect, beforeEach } from "vitest";
import {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  hasCache,
} from "@/helpers/cache";
import type { Geocode } from "@/types/type";

describe("Cache functions", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("setCache and getCache", () => {
    it("値をキャッシュに保存し、取得できる", () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 1000; // 1秒

      setCache(key, value, ttl);
      const result = getCache(key);

      expect(result).toEqual(value);
    });

    it("存在しないキーでundefinedを返す", () => {
      const result = getCache("non-existent-key");
      expect(result).toBeUndefined();
    });

    it("TTLが期限切れの場合はundefinedを返す", async () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 100; // 100ms

      setCache(key, value, ttl);

      // 100ms待機
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = getCache(key);
      expect(result).toBeUndefined();
    });

    it("TTLが有効な場合は値を返す", async () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 1000; // 1秒

      setCache(key, value, ttl);

      // 50ms待機（TTL内）
      await new Promise((resolve) => setTimeout(resolve, 50));

      const result = getCache(key);
      expect(result).toEqual(value);
    });
  });

  describe("hasCache", () => {
    it("存在するキーでtrueを返す", () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 1000;

      setCache(key, value, ttl);
      const result = hasCache(key);

      expect(result).toBe(true);
    });

    it("存在しないキーでfalseを返す", () => {
      const result = hasCache("non-existent-key");
      expect(result).toBe(false);
    });

    it("TTLが期限切れの場合はfalseを返す", async () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 100; // 100ms

      setCache(key, value, ttl);

      // 100ms待機
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = hasCache(key);
      expect(result).toBe(false);
    });
  });

  describe("deleteCache", () => {
    it("指定されたキーを削除する", () => {
      const key = "test-key";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 1000;

      setCache(key, value, ttl);
      expect(getCache(key)).toEqual(value);

      deleteCache(key);
      expect(getCache(key)).toBeUndefined();
    });

    it("存在しないキーを削除してもエラーにならない", () => {
      expect(() => {
        deleteCache("non-existent-key");
      }).not.toThrow();
    });
  });

  describe("clearCache", () => {
    it("すべてのキャッシュをクリアする", () => {
      const key1 = "test-key-1";
      const key2 = "test-key-2";
      const value: Geocode = { lat: 35.6762, lon: 139.6503 };
      const ttl = 1000;

      setCache(key1, value, ttl);
      setCache(key2, value, ttl);

      expect(getCache(key1)).toEqual(value);
      expect(getCache(key2)).toEqual(value);

      clearCache();

      expect(getCache(key1)).toBeUndefined();
      expect(getCache(key2)).toBeUndefined();
    });
  });

  describe("複数のキーと値の管理", () => {
    it("複数のキーと値を正しく管理する", () => {
      const key1 = "tokyo";
      const key2 = "osaka";
      const tokyo: Geocode = { lat: 35.6762, lon: 139.6503 };
      const osaka: Geocode = { lat: 34.7024, lon: 135.4959 };
      const ttl = 1000;

      setCache(key1, tokyo, ttl);
      setCache(key2, osaka, ttl);

      expect(getCache(key1)).toEqual(tokyo);
      expect(getCache(key2)).toEqual(osaka);
      expect(hasCache(key1)).toBe(true);
      expect(hasCache(key2)).toBe(true);
    });

    it("同じキーで上書きできる", () => {
      const key = "test-key";
      const value1: Geocode = { lat: 35.6762, lon: 139.6503 };
      const value2: Geocode = { lat: 34.7024, lon: 135.4959 };
      const ttl = 1000;

      setCache(key, value1, ttl);
      expect(getCache(key)).toEqual(value1);

      setCache(key, value2, ttl);
      expect(getCache(key)).toEqual(value2);
    });
  });
});
