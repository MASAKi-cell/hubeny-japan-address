# japan-address-distance

日本の住所間の距離を計算する npm ライブラリです。  
国土地理院 API を用いて住所を緯度経度に変換し、Hubeny の公式で距離を計算します。

## 特徴

- 日本国内に特化（海外は対象外）
- Hubeny の公式により数 m〜十数 m 精度の距離算出
- 国土地理院 API を利用（無料・高精度）

## 使い方

```ts
import { getDistance } from "japan-address-distance";

const distance = await getDistance(
  "東京都千代田区丸の内1-1",
  "大阪府大阪市北区梅田1-1"
);

console.log(Math.round(distance / 1000) + " km"); // => 400 km 前後
```
