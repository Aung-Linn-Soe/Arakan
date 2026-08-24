import { Category } from "@/types/spot";

// カテゴリー押下時にGoogle Places API (Text Search)へ投げる検索クエリ。
// 「Rakhine State, Myanmar」を明示して地域を絞り込む。
export const categorySearchQuery: Record<Category, string> = {
  temple: "famous Buddhist temples and pagodas in Rakhine State, Myanmar",
  coast: "famous beaches and coastal spots in Rakhine State, Myanmar",
  food: "well-known local restaurants and food spots in Rakhine State, Myanmar",
  craft: "traditional handicraft workshops in Rakhine State, Myanmar",
};

// ラカイン州のおおよその中心(検索の位置バイアス用)
export const RAKHINE_CENTER = { lat: 19.9, lng: 93.4 };
export const RAKHINE_SEARCH_RADIUS_M = 150_000;
