"use client";

import { useEffect, useState } from "react";

// 同じタイトルへの重複fetchをページ内で避けるための簡易メモリキャッシュ
// (一覧・詳細で同じスポットが複数回マウントされても再取得しない)。
const cache = new Map<string, string | null>();

// spot.wikipediaTitle が設定されているスポットについて、Wikipedia記事のサムネイル
// 画像URLを取得する。title未指定/取得失敗時はundefinedを返し、呼び出し側は
// 既存のカテゴリー別プレースホルダー表示にフォールバックする。
export function useWikipediaPhoto(title?: string): string | undefined {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(() =>
    title && cache.has(title) ? (cache.get(title) ?? undefined) : undefined,
  );

  useEffect(() => {
    if (!title) {
      setPhotoUrl(undefined);
      return;
    }
    if (cache.has(title)) {
      setPhotoUrl(cache.get(title) ?? undefined);
      return;
    }

    let cancelled = false;
    fetch(`/api/wiki-photo?title=${encodeURIComponent(title)}`)
      .then((res) => res.json())
      .then((data: { photoUrl: string | null }) => {
        cache.set(title, data.photoUrl);
        if (!cancelled) setPhotoUrl(data.photoUrl ?? undefined);
      })
      .catch(() => {
        if (!cancelled) setPhotoUrl(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [title]);

  return photoUrl;
}
