import { describe, it, expect } from "vitest";
import { useHubenyDistance } from "@/hocks/useHubenyDistance";
import { ERROR_MESSAGE } from "@/configs/message";
import { WGS, GRS } from "@/configs";

describe("useHubenyDistance", () => {
  it("同じ座標の場合は距離が0", () => {
    const lat = 35.6762;
    const lon = 139.6503;
    const result = useHubenyDistance(lat, lon, lat, lon);
    expect(result).toBe(0);
  });

  it("東京駅と大阪駅の距離が正しい", () => {
    const tokyoLat = 35.6812;
    const tokyoLon = 139.7671;
    const osakaLat = 34.7024;
    const osakaLon = 135.4959;
    const result = useHubenyDistance(tokyoLat, tokyoLon, osakaLat, osakaLon);

    // 東京駅と大阪駅の距離は約400km
    expect(result).toBeGreaterThan(390000); // 390km以上
    expect(result).toBeLessThan(410000); // 410km以下
  });

  it("GRS80楕円体を使用して距離を計算", () => {
    const lat1 = 35.6762;
    const lon1 = 139.6503;
    const lat2 = 35.6763;
    const lon2 = 139.6504;

    const result = useHubenyDistance(lat1, lon1, lat2, lon2, GRS);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("WGS84楕円体を使用して距離を計算", () => {
    const lat1 = 35.6762;
    const lon1 = 139.6503;
    const lat2 = 35.6763;
    const lon2 = 139.6504;

    const result = useHubenyDistance(lat1, lon1, lat2, lon2, WGS);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("無効な座標（NaN）でエラー", () => {
    expect(() => {
      useHubenyDistance(NaN, 139.6503, 35.6763, 139.6504);
    }).toThrow(ERROR_MESSAGE.INVALID_COORDINATES);

    expect(() => {
      useHubenyDistance(35.6762, NaN, 35.6763, 139.6504);
    }).toThrow(ERROR_MESSAGE.INVALID_COORDINATES);

    expect(() => {
      useHubenyDistance(35.6762, 139.6503, NaN, 139.6504);
    }).toThrow(ERROR_MESSAGE.INVALID_COORDINATES);

    expect(() => {
      useHubenyDistance(35.6762, 139.6503, 35.6763, NaN);
    }).toThrow(ERROR_MESSAGE.INVALID_COORDINATES);
  });
});
