import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGeocode } from "@/hocks/useGeocode";
import { useAddressDistance } from "@/hocks/useAddressDistance";
import { fetcher } from "@/apis/fetch";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import { ERROR_MESSAGE } from "@/configs/message";

// SWRをモック
vi.mock("swr", () => ({
  default: vi.fn(),
}));

// 他のモジュールをモック
vi.mock("@/apis/fetch");
vi.mock("@/hocks/useHubenyDistance");

const mockFetcher = vi.mocked(fetcher);
const mockUseHubenyDistance = vi.mocked(useHubenyDistance);

// SWRのモック関数
const mockSWR = vi.fn();

describe("React Hooks", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // SWRのモックを設定
    const { default: useSWR } = await import("swr");
    vi.mocked(useSWR).mockImplementation(mockSWR);
  });

  describe("useGeocode", () => {
    it("正常な住所でジオコーディング結果を返す", () => {
      const address = "東京都千代田区丸の内1-9-1";
      const geocode = { lat: 35.6762, lon: 139.6503 };

      mockSWR.mockReturnValue({
        data: geocode,
        error: null,
      });

      const result = useGeocode(address);

      expect(mockSWR).toHaveBeenCalledWith(
        ["gsi-geocode", address],
        expect.any(Function),
        expect.any(Object)
      );
      expect(result).toEqual(geocode);
    });

    it("空の住所でnullを返す", () => {
      mockSWR.mockReturnValue({
        data: null,
        error: null,
      });

      const result = useGeocode("");

      expect(mockSWR).toHaveBeenCalledWith(null, null, expect.any(Object));
      expect(result).toBeNull();
    });

    it("空白のみの住所でnullを返す", () => {
      mockSWR.mockReturnValue({
        data: null,
        error: null,
      });

      const result = useGeocode("   ");

      expect(mockSWR).toHaveBeenCalledWith(null, null, expect.any(Object));
      expect(result).toBeNull();
    });

    it("エラーが発生した場合はエラーを投げる", () => {
      const address = "無効な住所";
      const error = new Error("Address not found");

      mockSWR.mockReturnValue({
        data: null,
        error: error,
      });

      expect(() => useGeocode(address)).toThrow(
        ERROR_MESSAGE.ADDRESS_NOT_FOUND
      );
    });

    it("データが無効な場合はエラーを投げる", () => {
      const address = "東京都千代田区丸の内1-9-1";
      const invalidData = { lat: "invalid", lon: 139.6503 };

      mockSWR.mockReturnValue({
        data: invalidData,
        error: null,
      });

      expect(() => useGeocode(address)).toThrow(
        ERROR_MESSAGE.ADDRESS_NOT_FOUND
      );
    });

    it("データがnullの場合はエラーを投げる", () => {
      const address = "東京都千代田区丸の内1-9-1";

      mockSWR.mockReturnValue({
        data: null,
        error: null,
      });

      expect(() => useGeocode(address)).toThrow(
        ERROR_MESSAGE.ADDRESS_NOT_FOUND
      );
    });

    it("住所の前後の空白をトリムする", () => {
      const address = "  東京都千代田区丸の内1-9-1  ";
      const trimmedAddress = "東京都千代田区丸の内1-9-1";
      const geocode = { lat: 35.6762, lon: 139.6503 };

      mockSWR.mockReturnValue({
        data: geocode,
        error: null,
      });

      useGeocode(address);

      expect(mockSWR).toHaveBeenCalledWith(
        ["gsi-geocode", trimmedAddress],
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe("useAddressDistance", () => {
    it("2つの住所の距離を正しく計算する", () => {
      const fromAddress = "東京都千代田区丸の内1-9-1";
      const toAddress = "大阪府大阪市北区梅田1-1-3";
      const ellipsoid = "WGS84" as const;

      const fromGeocode = { lat: 35.6762, lon: 139.6503 };
      const toGeocode = { lat: 34.7024, lon: 135.4959 };
      const expectedDistance = 400000;

      // useGeocodeを2回呼び出すため、2つのモック設定
      mockSWR
        .mockReturnValueOnce({
          data: fromGeocode,
          error: null,
        })
        .mockReturnValueOnce({
          data: toGeocode,
          error: null,
        });

      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = useAddressDistance(fromAddress, toAddress, ellipsoid);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        fromGeocode.lat,
        fromGeocode.lon,
        toGeocode.lat,
        toGeocode.lon,
        ellipsoid
      );
      expect(result).toBe(expectedDistance);
    });

    it("楕円体を指定しない場合のデフォルト動作", () => {
      const fromAddress = "東京都千代田区丸の内1-9-1";
      const toAddress = "大阪府大阪市北区梅田1-1-3";

      const fromGeocode = { lat: 35.6762, lon: 139.6503 };
      const toGeocode = { lat: 34.7024, lon: 135.4959 };
      const expectedDistance = 400000;

      mockSWR
        .mockReturnValueOnce({
          data: fromGeocode,
          error: null,
        })
        .mockReturnValueOnce({
          data: toGeocode,
          error: null,
        });

      mockUseHubenyDistance.mockReturnValue(expectedDistance);

      const result = useAddressDistance(fromAddress, toAddress);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        fromGeocode.lat,
        fromGeocode.lon,
        toGeocode.lat,
        toGeocode.lon,
        undefined
      );
      expect(result).toBe(expectedDistance);
    });

    it("from住所が無効な場合はnullを返す", () => {
      const fromAddress = "無効な住所";
      const toAddress = "大阪府大阪市北区梅田1-1-3";

      mockSWR
        .mockReturnValueOnce({
          data: null,
          error: null,
        })
        .mockReturnValueOnce({
          data: { lat: 34.7024, lon: 135.4959 },
          error: null,
        });

      const result = useAddressDistance(fromAddress, toAddress);

      expect(result).toBeNull();
    });

    it("to住所が無効な場合はnullを返す", () => {
      const fromAddress = "東京都千代田区丸の内1-9-1";
      const toAddress = "無効な住所";

      mockSWR
        .mockReturnValueOnce({
          data: { lat: 35.6762, lon: 139.6503 },
          error: null,
        })
        .mockReturnValueOnce({
          data: null,
          error: null,
        });

      const result = useAddressDistance(fromAddress, toAddress);

      expect(result).toBeNull();
    });

    it("両方の住所が無効な場合はnullを返す", () => {
      const fromAddress = "無効な住所1";
      const toAddress = "無効な住所2";

      mockSWR
        .mockReturnValueOnce({
          data: null,
          error: null,
        })
        .mockReturnValueOnce({
          data: null,
          error: null,
        });

      const result = useAddressDistance(fromAddress, toAddress);

      expect(result).toBeNull();
    });

    it("同じ住所の場合は距離が0になる", () => {
      const address = "東京都千代田区丸の内1-9-1";
      const geocode = { lat: 35.6762, lon: 139.6503 };

      mockSWR
        .mockReturnValueOnce({
          data: geocode,
          error: null,
        })
        .mockReturnValueOnce({
          data: geocode,
          error: null,
        });

      mockUseHubenyDistance.mockReturnValue(0);

      const result = useAddressDistance(address, address);

      expect(mockUseHubenyDistance).toHaveBeenCalledWith(
        geocode.lat,
        geocode.lon,
        geocode.lat,
        geocode.lon,
        undefined
      );
      expect(result).toBe(0);
    });
  });
});
