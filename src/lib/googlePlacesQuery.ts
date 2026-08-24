import { Category } from "@/types/spot";

// カテゴリー押下時にGoogle Places API (Text Search)へ投げる検索クエリ。
// 「Rakhine State, Myanmar」を明示して地域を絞り込む。
export const categorySearchQuery: Record<Category, string> = {
  temple: "famous Buddhist temples and pagodas in Rakhine State, Myanmar",
  coast: "famous beaches, waterfalls and natural landscapes in Rakhine State, Myanmar",
  food: "well-known local restaurants and food spots in Rakhine State, Myanmar",
  craft: "traditional handicraft workshops in Rakhine State, Myanmar",
};

// ラカイン州のおおよその範囲(バウンディングボックス)。
// locationBias(円形・優先のみ)ではBagan/Mandalay/Yangonなど州外の有名スポットも
// 紛れ込んでしまったため、locationRestriction(矩形・厳密な絞り込み)に切り替える。
export const RAKHINE_BOUNDS = {
  low: { lat: 17.5, lng: 92.0 },
  high: { lat: 21.2, lng: 94.6 },
};

// react-leafletの MapContainer / LocationPicker で共通して使う、
// Leafletの[lat,lng]タプル形式に変換した値。
export const RAKHINE_LATLNG_BOUNDS: [[number, number], [number, number]] = [
  [RAKHINE_BOUNDS.low.lat, RAKHINE_BOUNDS.low.lng],
  [RAKHINE_BOUNDS.high.lat, RAKHINE_BOUNDS.high.lng],
];

// パン(ドラッグ移動)できる範囲も、ラカイン州から大きく離れられないよう
// 少し余裕を持たせた範囲に制限する。
export const RAKHINE_MAX_PAN_BOUNDS: [[number, number], [number, number]] = [
  [RAKHINE_BOUNDS.low.lat - 1.5, RAKHINE_BOUNDS.low.lng - 1.5],
  [RAKHINE_BOUNDS.high.lat + 1.5, RAKHINE_BOUNDS.high.lng + 1.5],
];
