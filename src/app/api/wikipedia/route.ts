import { NextRequest, NextResponse } from "next/server";
import { findWikipediaSummary } from "@/lib/wikipedia";

// Wikipediaは無料・無制限だが、同じ問い合わせを何度も送るのは避けるため
// Google Places同様に1日キャッシュする。
const REVALIDATE_SECONDS = 60 * 60 * 24;

// この順で言語版を試す(UI言語 → 見つからなければ英語版)。
// ラカイン語版Wikipediaは無いため、my(ビルマ語)選択時も my → en の順で試す。
function langFallbackOrder(uiLang: string): string[] {
  if (uiLang === "en") return ["en"];
  return [uiLang, "en"];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const uiLang = searchParams.get("lang") ?? "en";
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const location = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  if (!q) {
    return NextResponse.json({ error: "q パラメータが必要です" }, { status: 400 });
  }

  for (const lang of langFallbackOrder(uiLang)) {
    try {
      const summary = await findWikipediaSummary(q, lang, location);
      if (summary) {
        return NextResponse.json(
          { summary: { ...summary, lang } },
          { headers: { "Cache-Control": `public, max-age=${REVALIDATE_SECONDS}` } },
        );
      }
    } catch {
      // この言語版で失敗したら次の言語版を試す
      continue;
    }
  }

  return NextResponse.json({ summary: null });
}
