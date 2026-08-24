import { NextRequest, NextResponse } from "next/server";

const REVALIDATE_SECONDS = 60 * 60 * 24;

// Google Places Photo API へのプロキシ。
// APIキーをクライアントに渡さないよう、サーバー側でのみ付与して中継する。
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY が未設定です" }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name パラメータが必要です" }, { status: 400 });
  }

  const upstream = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=480&key=${apiKey}`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "写真の取得に失敗しました" }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
