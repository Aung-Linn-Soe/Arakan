import { NextRequest, NextResponse } from "next/server";
import { GooglePlaceResult } from "@/types/googlePlace";
import { CATEGORIES, Category } from "@/types/spot";
import { guessRakhineDistrictHint, resolveWikipediaPhoto } from "@/lib/wikipediaPhoto";
import { stripPlusCode } from "@/lib/formatAddress";

// Google Places API (New) の再取得までのキャッシュ期間(秒)。
// /api/spotsの一覧検索と同じ方針(コスト抑制と定期再取得の両立)。
const REVALIDATE_SECONDS = 60 * 60 * 24;

type GooglePlaceDetailsResponse = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{ name: string }>;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  editorialSummary?: { text: string };
  googleMapsUri?: string;
};

// ホーム画面のGoogle検索結果カードから、Place ID指定で1件だけ詳細を取得するAPI。
// /api/spots(一覧検索)と違い、単一IDの取得なので検索精度の問題が無く、
// languageCodeを1回のリクエストで直接指定できる(一覧側のような
// 「検索は英語固定→表示名だけ個別に再取得」という2段階の工夫は不要)。
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKeyEnv = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKeyEnv) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY が設定されていません。.env.local.example を参考に .env.local を作成してください。" },
      { status: 501 },
    );
  }
  const apiKey: string = apiKeyEnv;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category") as Category | null;
  // カテゴリーはGoogle Places側には無い、このアプリ独自の分類(どのタブから来たか)
  // なので、リンク元(GooglePlacesSection)から渡してもらう。未指定/不正値はtempleにフォールバック。
  const category: Category = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : "temple";
  const langParam = searchParams.get("lang");
  const languageCode = langParam === "my" || langParam === "ja" ? langParam : "en";

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${languageCode}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,location,rating,userRatingCount,photos,regularOpeningHours,editorialSummary,googleMapsUri",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
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

  const place: GooglePlaceDetailsResponse = await upstream.json();

  const result: GooglePlaceResult = {
    id: place.id,
    category,
    name: place.displayName?.text ?? "",
    formattedAddress: place.formattedAddress ? stripPlusCode(place.formattedAddress) : undefined,
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
  };

  // /api/spotsと同じフォールバック: Google自身の写真が無ければWikipediaで補う。
  if (!result.photoUrl) {
    const wikiPhoto = await resolveWikipediaPhoto({
      name: result.name,
      googlePlaceId: result.id,
      districtHint: guessRakhineDistrictHint(result.formattedAddress),
    });
    if (wikiPhoto) result.photoUrl = wikiPhoto;
  }

  return NextResponse.json({ result });
}
