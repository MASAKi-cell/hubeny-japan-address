# japan-address-distance

日本の住所間の距離を計算する npm ライブラリです。国土地理院 API で住所を緯度経度に変換し、Hubeny の公式で高精度な距離を算出します。
住所同士だけでなく、既知の緯度経度ペアからの距離計算にも対応しています。

<br><br>

## 特徴

- 日本国内の住所表記に特化したジオコーディング
- Hubeny の公式による数 m 単位の高精度な距離算出
- 緯度経度ペアからの直接計算に対応（API 呼び出し不要）
- WGS84 / GRS80 の楕円体を選択可能

<br><br>

## インストール

```bash
npm install japan-address-distance
```

<br><br>

## クイックスタート

### `getDistance(from, to, ellipsoid?)`

- `from`, `to`: 住所文字列、または `{ lat: number; lon: number }` を受け取ります。
- `ellipsoid`: 任意の楕円体指定。`"WGS84"`（デフォルト）と `"GRS80"` から選択できます。
- 戻り値はメートル単位の距離です。住所を指定した場合は内部で国土地理院 API を呼び出します。

```ts
import { getDistance } from "japan-address-distance";

// 緯度経度から直接距離を計算する例
const tokyoStation = { lat: 35.681236, lon: 139.767125 };
const osakaStation = { lat: 34.702485, lon: 135.495951 };

const meters = await getDistance(tokyoStation, osakaStation, "GRS80");
console.log(meters); // => 500000 前後
```

### `useHubenyDistance(lat1, lon1, lat2, lon2, ellipsoid?)`

既知の緯度経度ペア間の距離だけを Hubeny 公式で計算します。

- `lat1`, `lon1`, `lat2`, `lon2`: 各地点の緯度・経度（角度は度数法）。
- `ellipsoid`: 任意の楕円体指定。省略時は `"WGS84"`。
- 戻り値はメートル単位。

```ts
import { useHubenyDistance } from "japan-address-distance";

const distance = useHubenyDistance(
  35.658034, // 東京タワーの緯度
  139.751599, // 東京タワーの経度
  35.710063, // 東京スカイツリーの緯度
  139.8107, // 東京スカイツリーの経度
  "WGS84"
);

console.log(distance.toFixed(0)); // => 8000 前後
```

<br><br>

### 楕円体の指定

楕円体を切り替えることで距離計算の結果を国内測地系（GRS80）とグローバル測地系（WGS84）で使い分けできます。省略時は `"WGS84"` が利用されます。

<br><br>

## ライセンス

MIT License
