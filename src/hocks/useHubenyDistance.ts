type Ellipsoid = typeof GRS | typeof WGS;

const GRS = "GRS80";
const WGS = "WGS84";
const ELLIPSOIDS: Record<Ellipsoid, { a: number; f: number }> = {
  // 長半径 a [m], 扁平率 f
  GRS80: { a: 6378137.0, f: 1 / 298.257222101 },
  WGS84: { a: 6378137.0, f: 1 / 298.257223563 },
};

/**
 * Hubeny公式による距離計算
 * @param lat1 経度
 * @param lon1 緯度
 * @param lat2 経度
 * @param lon2 緯度
 * @param ellipsoid 楕円体のタイプ
 * @returns
 */
export const useHubenyDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  ellipsoid: Ellipsoid = WGS
): number => {
  if (
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    throw new Error("Invalid coordinates");
  }

  // 同一点の高速判定
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const { a, f } = ELLIPSOIDS[ellipsoid];
  const e2 = 2 * f - f * f;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);
  const dφ = φ2 - φ1;
  const dλ = λ2 - λ1;
  const φm = (φ1 + φ2) / 2;

  const sin = Math.sin(φm);
  const cos = Math.cos(φm);
  const W = 1 - e2 * sin * sin;
  const M = (a * (1 - e2)) / Math.pow(W, 1.5);
  const N = a / Math.sqrt(W);
  return Math.hypot(M * dφ, N * cos * dλ);
};
