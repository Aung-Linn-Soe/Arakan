"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/i18n/AuthContext";

export type SpotPhotoRow = {
  id: string;
  spot_slug: string;
  user_id: string;
  image_url: string;
  created_at: string;
};

// spot_photosテーブル(ユーザーがキュレーション済みスポットに追加した実写真、
// supabase/migrations/spot_photos.sql参照)を扱うフック。Wikipedia等で写真が
// 見つからなかったスポットの詳細ページで、ログインユーザーが写真を追加できるように
// するための機能。最新の投稿を優先して1枚だけ使う想定(古い投稿ほど下に埋もれる)。
export function useSpotPhotos(slug: string) {
  const { supabase } = useAuth();
  const [photos, setPhotos] = useState<SpotPhotoRow[] | null>(null);

  const refresh = useCallback(() => {
    supabase
      .from("spot_photos")
      .select("id, spot_slug, user_id, image_url, created_at")
      .eq("spot_slug", slug)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPhotos((data as SpotPhotoRow[] | null) ?? []));
  }, [supabase, slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photos, refresh };
}
