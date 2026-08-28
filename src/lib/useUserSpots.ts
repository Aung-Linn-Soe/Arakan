"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/i18n/AuthContext";
import { Category } from "@/types/spot";

export type UserSpotPost = {
  id: string;
  user_id: string;
  category: "temple" | "coast";
  title: string;
  description: string | null;
  location_text: string | null;
  image_urls: string[] | null;
  created_at: string;
};

// Wikipediaにもキュレーション済みデータ(spots.ts)にも無い寺院・ビーチを、
// ユーザー自身が/postから投稿できるようにする機能。位置は緯度経度ではなく
// テキスト(location_text、例: 「မြောက်ဦး၊ ရခိုင်ပြည်နယ်」)で持つため、
// ホーム/mapのイラスト地図には出さず、一覧・詳細ページにテキストで表示する
// (src/components/CommunitySpotList.tsx参照)。
export function useUserSpots(category: Category) {
  const { supabase } = useAuth();
  const [posts, setPosts] = useState<UserSpotPost[] | null>(null);
  const applicable = category === "temple" || category === "coast";

  const refresh = useCallback(() => {
    if (!applicable) return;
    supabase
      .from("user_posts")
      .select("id, user_id, category, title, description, location_text, image_urls, created_at")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data as UserSpotPost[] | null) ?? []));
  }, [supabase, category, applicable]);

  useEffect(() => {
    if (applicable) refresh();
  }, [refresh, applicable]);

  // temple/coast以外のタブでは常に空配列を返す(そもそもfetchしない)。
  return { posts: applicable ? (posts ?? []) : [], refresh };
}
