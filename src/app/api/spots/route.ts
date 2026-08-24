import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, Category } from "@/types/spot";
import { GooglePlacesTextSearchResponse, GooglePlaceResult } from "@/types/googlePlace";
import {
  categorySearchQuery,
  RAKHINE_CENTER,
  RAKHINE_SEARCH_RADIUS_M,
} from "@/lib/googlePlacesQuery";

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
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.regularOpeningHours,places.editorialSummary,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "en",
        locationBias: {
          circle: {
            center: { latitude: RAKHINE_CENTER.lat, longitude: RAKHINE_CENTER.lng },
            radius: RAKHINE_SEARCH_RADIUS_M,
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

  const results: GooglePlaceResult[] = (data.places ?? []).map((place) => ({
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
  }));

  return NextResponse.json({ results });
}
