import { Category } from "./spot";

// Google Places API (New) の "places:searchText" レスポンスのうち、
// このアプリで使うフィールドのみを型定義したもの(公式SDKは使わず fetch で直接呼ぶ)。
export type GooglePlacesTextSearchResponse = {
  places?: Array<{
    id: string;
    displayName?: { text: string; languageCode?: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
    photos?: Array<{ name: string }>;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    editorialSummary?: { text: string };
    googleMapsUri?: string;
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
    types?: string[];
  }>;
};

// フロントエンドに返す、整形済みの検索結果
export type GooglePlaceResult = {
  id: string;
  category: Category; // どのカテゴリータブで検索されたか(地図のピン色分けに使う)
  name: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  photoUrl?: string;
  openingHours?: string[];
  summary?: string;
  mapsUri?: string;
};
