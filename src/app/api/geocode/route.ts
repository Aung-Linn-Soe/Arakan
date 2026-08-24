import { NextRequest, NextResponse } from "next/server";
import { RAKHINE_BOUNDS } from "@/lib/googlePlacesQuery";

// OpenStreetMap Nominatim(無料の地名検索)への軽量プロキシ。
// - Nominatimの利用規約でUser-Agentの明示が必須なため、サーバー側から呼ぶ
// - 結果はラカイン州のバウンディングボックス内に絞り込む(bounded=1)
// - キャッシュして同じ検索の再送を減らす(Nominatimは高頻度アクセスを禁止しているため)
const REVALIDATE_SECONDS = 60 * 60 * 24;

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const VIEWBOX = [
  RAKHINE_BOUNDS.low.lng,
  RAKHINE_BOUNDS.high.lat,
  RAKHINE_BOUNDS.high.lng,
  RAKHINE_BOUNDS.low.lat,
].join(",");

async function searchNominatim(q: string, lang: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    q,
    limit: "6",
    countrycodes: "mm",
    viewbox: VIEWBOX,
    bounded: "1",
    "accept-language": lang,
  });

  const upstream = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      // Nominatimの利用ポリシーで、アプリを特定できるUser-Agentが必須。
      "User-Agent": "RakhineExplorer/0.1 (dev; contact via project repository)",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!upstream.ok) return [];
  return upstream.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const lang = searchParams.get("lang") ?? "en";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  let data: NominatimResult[];
  try {
    data = await searchNominatim(q, lang);
    // Nominatimは単語の区切り(スペース)に厳密で、"sitt twe"のように余分な
    // スペースが入っていると"Sittwe"のような地名を見つけられない。
    // 0件だった場合は、スペースを詰めた表記でもう一度試す。
    if (data.length === 0 && /\s/.test(q)) {
      data = await searchNominatim(q.replace(/\s+/g, ""), lang);
    }
  } catch (err) {
    return NextResponse.json(
      { error: "地名検索への通信に失敗しました", detail: String(err) },
      { status: 502 },
    );
  }

  const results = data.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    label: r.display_name,
  }));

  return NextResponse.json({ results });
}
