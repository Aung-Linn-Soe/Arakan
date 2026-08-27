import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, Category } from "@/types/spot";
import { GooglePlacesTextSearchResponse, GooglePlaceResult } from "@/types/googlePlace";
import { categorySearchQuery, RAKHINE_BOUNDS } from "@/lib/googlePlacesQuery";
import { guessRakhineDistrictHint, resolveWikipediaPhoto } from "@/lib/wikipediaPhoto";
import { stripPlusCode } from "@/lib/formatAddress";

// Google Places APIの再取得までのキャッシュ期間(秒)。
// コスト抑制と、Google利用規約が求める定期的な再取得の両立のため24時間に設定。
const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET(request: NextRequest) {
  const apiKeyEnv = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKeyEnv) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_PLACES_API_KEY が設定されていません。.env.local.example を参考に .env.local を作成してください。",
      },
      { status: 501 },
    );
  }

  // ネストした関数(fetchLocalizedName)からも参照するため、undefinedではないことが
  // 確定した値を別の変数に入れておく(TypeScriptはネスト関数の中まで絞り込みを
  // 引き継がないため)。
  const apiKey: string = apiKeyEnv;

  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category") as Category | null;
  const q = searchParams.get("q")?.trim();
  const langParam = searchParams.get("lang");
  const displayLanguageCode = langParam === "my" || langParam === "ja" ? langParam : undefined;
  // Google Places Text Searchへの検索自体は常に英語(languageCode: "en")で行う。
  // 検索文自体が英語(categorySearchQuery)であるため、my/jaを指定すると
  // Google側の検索精度が大きく落ちることを確認済み(例: coastカテゴリーで
  // 有名なNgapali Beachが結果から消え、代わりに無関係な空港や寺院が混入した)。
  // UIの表示言語(displayLanguageCode)は、後段で場所ごとに表示名だけを
  // 個別に取得し直すのに使う(検索のヒット件数・精度には影響させない)。
  const languageCode = "en";

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
  // 検索は常に英語(languageCode: "en")なので通常は"Rakhine"表記になるが、
  // 念のため他言語表記(過去のキャッシュ等)も含めて判定できるようにしておく。
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
  // 施設タイプ(例: Coast & Natureの検索結果に寺院・ホテル・博物館が混ざる)が
  // 紛れ込むことがある。カテゴリーごとに明らかに不適切なタイプだけを除外する。
  const EXCLUDED_TYPES_BY_CATEGORY: Partial<Record<Category, string[]>> = {
    coast: [
      "place_of_worship",
      "hindu_temple",
      "buddhist_temple",
      "church",
      "mosque",
      "synagogue",
      // "beaches and waterfalls"で検索しても、近くの宿泊施設や博物館が
      // 「関連性が高い」として混ざってくるため明示的に除外する。
      "lodging",
      "hotel",
      "resort_hotel",
      "guest_house",
      "museum",
    ],
  };
  const excludedTypes = EXCLUDED_TYPES_BY_CATEGORY[categoryParam] ?? [];
  const isExcludedType = (
    place: NonNullable<GooglePlacesTextSearchResponse["places"]>[number],
  ) => (place.types ?? []).some((type) => excludedTypes.includes(type));

  // coastカテゴリーは「ビーチ・滝」だけに絞る(ホテル等の除外だけでは、
  // タイプが"tourist_attraction"などとしか付いていないビーチ以外の観光地も
  // 残ってしまうため、名前またはタイプに beach/waterfall が無いものは落とす)。
  const isBeachOrWaterfall = (
    place: NonNullable<GooglePlacesTextSearchResponse["places"]>[number],
  ) => {
    const name = place.displayName?.text ?? "";
    return (place.types ?? []).includes("beach") || /beach|waterfall/i.test(name);
  };

  // "Buddhist temple"のような、固有名の無い(カテゴリー名そのままの)最小限の登録は
  // 写真も無いことが多く、そもそも「有名なスポット」として案内するのに適さない。
  // ただし同じ名前でも写真が取れた場合は表示価値があるので、除外するかどうかは
  // 写真解決後(下のresults生成後)に最終判定する。
  const GENERIC_NAME_PATTERN = /^(buddhist |hindu )?(temple|pagoda|mosque|church|museum)$/i;
  const isGenericName = (name: string) => GENERIC_NAME_PATTERN.test(name.trim());

  const baseResults: GooglePlaceResult[] = (data.places ?? [])
    .filter(
      (place) =>
        isInRakhineState(place) &&
        !isExcludedType(place) &&
        (categoryParam !== "coast" || isBeachOrWaterfall(place)),
    )
    .map((place) => ({
      id: place.id,
      category: categoryParam,
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
    }))
    // Text Searchは「関連性」で返すだけなので、名前で検索してもクエリと無関係な
    // 同カテゴリーの場所(周辺の別の寺院など)が混ざって返ってくることがある。
    // 検索語が入っている場合は、名前か住所に検索語を含むものだけに確実に絞り込む。
    .filter((place) => {
      if (!q) return true;
      const target = `${place.name} ${place.formattedAddress ?? ""}`.toLowerCase();
      return target.includes(q.toLowerCase());
    });

  // UIがミャンマー語/日本語のときは、場所ごとに表示名だけをその言語で取得し直す
  // (検索自体は常に英語で行い、精度を落とさないため)。写真が取れない場合と同様、
  // 失敗しても静かに英語名のままフォールバックする。
  async function fetchLocalizedName(placeId: string): Promise<string | undefined> {
    if (!displayLanguageCode) return undefined;
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?languageCode=${displayLanguageCode}`,
        {
          headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "displayName" },
          next: { revalidate: REVALIDATE_SECONDS },
        },
      );
      if (!res.ok) return undefined;
      const detail: { displayName?: { text?: string } } = await res.json();
      return detail.displayName?.text;
    } catch {
      return undefined;
    }
  }

  // 1段階目: Google自身の写真(place.photos)があればそれを最優先で使う。
  // 2段階目: 無ければWikipediaの記事写真で補う(スポットごとに個別の写真を出すため)。
  // どちらも取れない場所はundefinedのままカテゴリー別プレースホルダーになる。
  const resultsWithPhoto = await Promise.all(
    baseResults.map(async (place) => {
      const localizedName = await fetchLocalizedName(place.id);
      const withLocalizedName = localizedName ? { ...place, name: localizedName } : place;

      if (withLocalizedName.photoUrl) return withLocalizedName;
      const wikiPhoto = await resolveWikipediaPhoto({
        name: place.name, // Wikipedia照合は英語名で行う(表記ゆれ対応表・完全一致とも英語想定のため)
        googlePlaceId: place.id,
        districtHint: guessRakhineDistrictHint(place.formattedAddress),
      });
      return wikiPhoto ? { ...withLocalizedName, photoUrl: wikiPhoto } : withLocalizedName;
    }),
  );

  // 固有名の無い(カテゴリー名そのままの)登録は、写真も結局取れなかった場合のみ
  // 案内から外す(写真があれば見せる価値があるので残す)。
  const results = resultsWithPhoto.filter((place) => place.photoUrl || !isGenericName(place.name));

  return NextResponse.json({ results });
}
