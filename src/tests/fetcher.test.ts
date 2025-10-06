import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetcher } from "@/apis/fetch";
import { getCache, setCache, clearCache } from "@/helpers/cache";
import type { GeoType } from "@/types/type";
import { ERROR_MESSAGE } from "@/configs/message";

// axiosをモック
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("fetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe("正常なレスポンスの処理", () => {
    it("住所を正しくジオコーディングする", async () => {
      const address = "東京都千代田区丸の内1-9-1";
      const mockResponse: GeoType[] = [
        {
          geometry: {
            coordinates: [139.6503, 35.6762], // [lon, lat]の順序
            type: "Point",
          },
          type: "Feature",
          properties: {
            addressCode: "13101",
            title: "東京都千代田区丸の内1-9-1",
          },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await fetcher(address);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(
          address
        )}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "japan-address-distance/1.0",
          },
        }
      );
      expect(result).toEqual({ lat: 35.6762, lon: 139.6503 });
    });

    it("レスポンスが空配列の場合はエラーを投げる", async () => {
      const address = "存在しない住所";
      mockedAxios.get.mockResolvedValueOnce({
        data: [],
      });

      await expect(fetcher(address)).rejects.toThrow(
        ERROR_MESSAGE.UNSUPPORTED_REGION
      );
    });

    it("coordinatesが存在しない場合はエラーを投げる", async () => {
      const address = "無効な住所";
      const mockResponse: GeoType[] = [
        {
          geometry: {
            coordinates: [],
            type: "Point",
          },
          type: "Feature",
          properties: {
            addressCode: "13101",
            title: "無効な住所",
          },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      await expect(fetcher(address)).rejects.toThrow(
        ERROR_MESSAGE.UNSUPPORTED_REGION
      );
    });
  });

  describe("キャッシュ機能", () => {
    it("成功したレスポンスをキャッシュする", async () => {
      const address = "東京都千代田区丸の内1-9-1";
      const mockResponse: GeoType[] = [
        {
          geometry: {
            coordinates: [139.6503, 35.6762],
            type: "Point",
          },
          type: "Feature",
          properties: {
            addressCode: "13101",
            title: "東京都千代田区丸の内1-9-1",
          },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      // 最初の呼び出し
      const result1 = await fetcher(address);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // 2回目の呼び出し（キャッシュから取得）
      const result2 = await fetcher(address);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // まだ1回のまま
      expect(result1).toEqual(result2);
    });

    it("キャッシュされた値を返す", async () => {
      const address = "東京都千代田区丸の内1-9-1";
      const cachedValue = { lat: 35.6762, lon: 139.6503 };

      // 手動でキャッシュに値を設定
      setCache(`geocode:${address}`, cachedValue, 1000);

      const result = await fetcher(address);

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });
  });

  describe("エラーハンドリング", () => {
    it("axiosエラーの場合、ステータスコードとメッセージを含むエラーを投げる", async () => {
      const address = "エラーを起こす住所";
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          statusText: "Not Found",
        },
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(fetcher(address)).rejects.toThrow("404 Not Found");
    });

    it("axios以外のエラーの場合、元のエラーを投げる", async () => {
      const address = "エラーを起こす住所";
      const error = new Error("Network error");

      mockedAxios.isAxiosError.mockReturnValue(false);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(fetcher(address)).rejects.toThrow(error);
    });
  });

  describe("無効な座標の処理", () => {
    it("latが数値でない場合はキャッシュしない", async () => {
      const address = "無効な住所";
      const mockResponse: GeoType[] = [
        {
          geometry: {
            coordinates: [undefined, 35.6762], // lonが無効
            type: "Point",
          },
          type: "Feature",
          properties: {
            addressCode: "13101",
            title: "無効な住所",
          },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      await expect(fetcher(address)).rejects.toThrow(
        ERROR_MESSAGE.UNSUPPORTED_REGION
      );

      const cached = getCache(`geocode:${address}`);
      expect(cached).toBeUndefined();
    });

    it("lonが数値でない場合はキャッシュしない", async () => {
      const address = "無効な住所";
      const mockResponse: GeoType[] = [
        {
          geometry: {
            coordinates: [139.6503, undefined], // latが無効
            type: "Point",
          },
          type: "Feature",
          properties: {
            addressCode: "13101",
            title: "無効な住所",
          },
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      await expect(fetcher(address)).rejects.toThrow(
        ERROR_MESSAGE.UNSUPPORTED_REGION
      );

      const cached = getCache(`geocode:${address}`);
      expect(cached).toBeUndefined();
    });
  });
});
