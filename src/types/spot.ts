// ラカイン州カタログアプリ — データモデル
// 仕様書 (rakhine_catalog_app_spec.md) セクション5に対応

export type Category = "temple" | "coast" | "food" | "craft";

export type Locale = "my" | "en" | "ja";

export type LocalizedText = {
  my: string; // ビルマ語 (既定言語)
  rk?: string; // ラカイン語 (任意)
  en: string;
  ja?: string;
};

export type Spot = {
  id: string;
  slug: string;
  category: Category;
  name: LocalizedText;
  district: string;
  location: {
    lat: number;
    lng: number;
  };
  description: LocalizedText;
  photos: string[]; // 画像URL(空配列の場合はカテゴリ別プレースホルダーを表示)
  rating?: number;
  openingHours?: string[];
  lastUpdated: string; // ISO 8601
  sourceNote?: string; // 情報の出典(現地取材/Google Places等)
};

export const CATEGORIES: Category[] = ["temple", "coast", "food", "craft"];
