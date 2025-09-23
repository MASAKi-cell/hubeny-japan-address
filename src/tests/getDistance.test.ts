import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDistance } from "@/core/getDistance";
import { fetcher } from "@/apis/fetch";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import { ERROR_MESSAGE } from "@/configs/message";
import type { Coordinates } from "@/core/getDistance";
import { WGS, GRS } from "@/configs";

// モックの設定
vi.mock("@/apis/fetch");
vi.mock("@/hocks/useHubenyDistance");

const mockFetcher = vi.mocked(fetcher);
const mockUseHubenyDistance = vi.mocked(useHubenyDistance);

describe("getDistance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("座標同士の距離計算", () => {
    it("2つの座標オブジェクトで距離を計算する", () => {
      const from: Coordinates = { lat: 35.6762, lon: 139.6503 };
      const to: Coordinates = { lat: 34.7024, lon: 135.4959 };
      const expectedDistance = 400000; // 400km

      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = getDistance(from, to);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        from.lat,
        from.lon,
        to.lat,
        to.lon,
        undefined
      );
      expect(result).resolves.toBe(expectedDistance);
    });

    it("楕円体を指定して座標同士の距離を計算する", () => {
      const from: Coordinates = { lat: 35.6762, lon: 139.6503 };
      const to: Coordinates = { lat: 34.7024, lon: 135.4959 };
      const ellipsoid = GRS;
      const expectedDistance = 400000;

      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = getDistance(from, to, ellipsoid);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        from.lat,
        from.lon,
        to.lat,
        to.lon,
        ellipsoid
      );
      expect(result).resolves.toBe(expectedDistance);
    });

    it("同じ座標の場合は距離が0になる", () => {
      const coords: Coordinates = { lat: 35.6762, lon: 139.6503 };
      mockUseHubenyDistance.mockReturnValue(0);

      const result = getDistance(coords, coords);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        coords.lat,
        coords.lon,
        coords.lat,
        coords.lon,
        undefined
      );
      expect(result).resolves.toBe(0);
    });
  });

  describe("住所同士の距離計算", () => {
    it("2つの住所文字列で距離を計算する", async () => {
      const fromAddress = "東京都千代田区丸の内1-9-1";
      const toAddress = "大阪府大阪市北区梅田1-1-3";

      const fromGeocode = { lat: 35.6762, lon: 139.6503 };
      const toGeocode = { lat: 34.7024, lon: 135.4959 };
      const expectedDistance = 400000;

      mockFetcher
        .mockResolvedValueOnce(fromGeocode)
        .mockResolvedValueOnce(toGeocode);
      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = await getDistance(fromAddress, toAddress);

      expect(mockFetcher).toHaveBeenCalledWith(fromAddress);
      expect(mockFetcher).toHaveBeenCalledWith(toAddress);
      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        fromGeocode.lat,
        fromGeocode.lon,
        toGeocode.lat,
        toGeocode.lon,
        undefined
      );
      expect(result).toBe(expectedDistance);
    });

    it("楕円体を指定して住所同士の距離を計算する", async () => {
      const fromAddress = "東京都千代田区丸の内1-9-1";
      const toAddress = "大阪府大阪市北区梅田1-1-3";
      const ellipsoid = WGS;

      const fromGeocode = { lat: 35.6762, lon: 139.6503 };
      const toGeocode = { lat: 34.7024, lon: 135.4959 };
      const expectedDistance = 400000;

      mockFetcher
        .mockResolvedValueOnce(fromGeocode)
        .mockResolvedValueOnce(toGeocode);
      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = await getDistance(fromAddress, toAddress, ellipsoid);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        fromGeocode.lat,
        fromGeocode.lon,
        toGeocode.lat,
        toGeocode.lon,
        ellipsoid
      );
      expect(result).toBe(expectedDistance);
    });

    it("fetcherがエラーを投げた場合はエラーを再投げする", async () => {
      const fromAddress = "無効な住所";
      const toAddress = "大阪府大阪市北区梅田1-1-3";
      const error = new Error("404 Not Found");

      mockFetcher.mockRejectedValueOnce(error);

      await expect(getDistance(fromAddress, toAddress)).rejects.toThrow(error);
    });
  });

  describe("無効な引数の処理", () => {
    it("座標と住所の混合でエラーを投げる", async () => {
      const coords: Coordinates = { lat: 35.6762, lon: 139.6503 };
      const address = "東京都千代田区丸の内1-9-1";

      await expect(getDistance(coords, address)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });

    it("住所と座標の混合でエラーを投げる", async () => {
      const address = "東京都千代田区丸の内1-9-1";
      const coords: Coordinates = { lat: 35.6762, lon: 139.6503 };

      await expect(getDistance(address, coords)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });

    it("無効な座標オブジェクトでエラーを投げる", async () => {
      const invalidCoords = { lat: "invalid", lon: 139.6503 } as any;
      const validCoords: Coordinates = { lat: 35.6762, lon: 139.6503 };

      await expect(getDistance(invalidCoords, validCoords)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });

    it("nullやundefinedでエラーを投げる", async () => {
      await expect(getDistance(null as any, "address")).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );

      await expect(getDistance("address", undefined as any)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });
  });

  describe("座標オブジェクトの検証", () => {
    it("latとlonが数値の座標オブジェクトを正しく認識する", () => {
      const validCoords: Coordinates = { lat: 35.6762, lon: 139.6503 };
      mockUseHubenyDistance.mockReturnValue(1000);

      const result = getDistance(validCoords, validCoords);

      expect(result).resolves.toBe(1000);
    });

    it("latが文字列の場合は無効として扱う", async () => {
      const invalidCoords = { lat: "35.6762", lon: 139.6503 } as any;
      const validCoords: Coordinates = { lat: 35.6762, lon: 139.6503 };

      await expect(getDistance(invalidCoords, validCoords)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });

    it("lonが文字列の場合は無効として扱う", async () => {
      const invalidCoords = { lat: 35.6762, lon: "139.6503" } as any;
      const validCoords: Coordinates = { lat: 35.6762, lon: 139.6503 };

      await expect(getDistance(invalidCoords, validCoords)).rejects.toThrow(
        ERROR_MESSAGE.INVALID_ARGUMENTS
      );
    });
  });
});
