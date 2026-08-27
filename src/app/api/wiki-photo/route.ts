import { NextRequest, NextResponse } from "next/server";
import { fetchWikipediaPhotoByTitle } from "@/lib/wikipediaPhoto";

// src/data/spots.ts のキュレーション済みスポット(spot.wikipediaTitle)用に、
// Wikipedia記事のサムネイル画像URLを返すエンドポイント。
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  if (!title) {
    return NextResponse.json({ error: "title パラメータが必要です" }, { status: 400 });
  }

  const photoUrl = await fetchWikipediaPhotoByTitle(title);
  return NextResponse.json({ photoUrl: photoUrl ?? null });
}
