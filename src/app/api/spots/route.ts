import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, Category } from "@/types/spot";
import { GooglePlacesTextSearchResponse, GooglePlaceResult } from "@/types/googlePlace";
import { categorySearchQuery, RAKHINE_BOUNDS } from "@/lib/googlePlacesQuery";

// Google Places APIの再取得までのキャッシュ期間(秒)。
// コスト抑制と、Google利用規約が求める定期的な再取得の両立のため24時間に設定。
const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_PLACES_API_KEY が設定されていません。.env.local.example を参考に .env.local を作成してください。",
      },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category") as Category | null;
  const q = searchParams.get("q")?.trim();
  const langParam = searchParams.get("lang");
  // UIの表示言語(my/en/ja)をそのままGoogle Places側の応答言語にする。
  // 未対応の値が来た場合は英語にフォールバック。
  const languageCode = langParam === "my" || langParam === "ja" ? langParam : "en";

  if (!categoryParam || !CATEGORIES.includes(categoryParam)) {
    return NextResponse.json(
      { error: "category パラメータは temple / coast / food / craft のいずれかが必要です" },
      { status: 400 },
    );
  }

  const textQuery = q
    ? `${categorySearchQuery[categoryParam]} ${q}`
    : categorySearchQuery[categoryParam];

  let upstream: Response;
  try {
    upstream = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.editorialSummary,places.googleMapsUri,places.addressComponents,places.types",
      },
      body: JSON.stringify({
        textQuery,
        languageCode,
        locationRestriction: {
          rectangle: {
            low: { latitude: RAKHINE_BOUNDS.low.lat, longitude: RAKHINE_BOUNDS.low.lng },
            high: { latitude: RAKHINE_BOUNDS.high.lat, longitude: RAKHINE_BOUNDS.high.lng },
          },
        },
      }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Google Places API への通信に失敗しました", detail: String(err) },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    return NextResponse.json(
      { error: "Google Places API がエラーを返しました", detail },
      { status: upstream.status },
    );
  }

  const data: GooglePlacesTextSearchResponse = await upstream.json();

  // 州(admin area level 1)がRakhine Stateであるものだけに絞り込む。
  // locationRestrictionの矩形はRakhine州の複雑な形状を厳密には表せず、
  // 山脈を挟んだ隣接州(Magwayなど)まで含まれてしまうことがあるため、
  // Googleが返す行政区分データで最終的に判定する。
  // languageCodeによって州名の表記が変わる(英語: "Rakhine", ミャンマー語: "ရခိုင်...",
  // 日本語: "ラカイン" など)ため、どの表記でも判定できるようにする。
  const RAKHINE_NAME_PATTERNS = [/rakhine/i, /ရခိုင်/, /ラカイン/];
  const isInRakhineState = (
    place: NonNullable<GooglePlacesTextSearchResponse["places"]>[number],
  ) =>
    (place.addressComponents ?? []).some((c) => {
      if (!c.types?.includes("administrative_area_level_1")) return false;
      const text = c.longText ?? c.shortText ?? "";
      return RAKHINE_NAME_PATTERNS.some((pattern) => pattern.test(text));
    });

  // テキスト検索は「関連性が高い」場所を返すだけなので、カテゴリーと無関係な
  // 施設タイプ(例: Coast & Natureの検索結果に寺院が混ざる)が紛れ込むことがある。
  // カテゴリーごとに明らかに不適切なタイプだけを除外する。
  const EXCLUDED_TYPES_BY_CATEGORY: Partial<Record<Category, string[]>> = {
    coast: ["place_of_worship", "hindu_temple", "buddhist_temple", "church", "mosque", "synagogue"],
  };
  const excludedTypes = EXCLUDED_TYPES_BY_CATEGORY[categoryParam] ?? [];
  const isExcludedType = (
    place: NonNullable<GooglePlacesTextSearchResponse["places"]>[number],
  ) => (place.types ?? []).some((type) => excludedTypes.includes(type));

  const results: GooglePlaceResult[] = (data.places ?? [])
    .filter((place) => isInRakhineState(place) && !isExcludedType(place))
    .map((place) => ({
      id: place.id,
      category: categoryParam,
      name: place.displayName?.text ?? "",
      formattedAddress: place.formattedAddress,
      lat: place.location?.latitude ?? 0,
      lng: place.location?.longitude ?? 0,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      photoUrl: place.photos?.[0]
        ? `/api/places/photo?name=${encodeURIComponent(place.photos[0].name)}`
        : undefined,
      openingHours: place.regularOpeningHours?.weekdayDescriptions,
      summary: place.editorialSummary?.text,
      mapsUri: place.googleMapsUri,
    }))
    // Text Searchは「関連性」で返すだけなので、名前で検索してもクエリと無関係な
    // 同カテゴリーの場所(周辺の別の寺院など)が混ざって返ってくることがある。
    // 検索語が入っている場合は、名前か住所に検索語を含むものだけに確実に絞り込む。
    .filter((place) => {
      if (!q) return true;
      const target = `${place.name} ${place.formattedAddress ?? ""}`.toLowerCase();
      return target.includes(q.toLowerCase());
    });

  return NextResponse.json({ results });
}
