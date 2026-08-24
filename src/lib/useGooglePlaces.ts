"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/spot";
import { GooglePlaceResult } from "@/types/googlePlace";

export type GooglePlacesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; results: GooglePlaceResult[] };

// enabled=false のときは一切fetchしない(NEXT_PUBLIC_ENABLE_GOOGLE_PLACES が
// falseの間は課金対象のAPI呼び出しを絶対に発生させないためのガード)。
// ページ側で1回だけ呼び出し、地図とカード一覧の両方に結果を渡して使うこと
// (呼び出し箇所を増やすとその分Google Places APIへのリクエストが増えてしまう)。
export function useGooglePlaces(
  category: Category,
  query: string,
  enabled: boolean,
): GooglePlacesState {
  const [state, setState] = useState<GooglePlacesState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      // 無効化時に前回のfetch結果を破棄する(外部リクエストとの同期)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });

    const params = new URLSearchParams({ category });
    if (query.trim()) params.set("q", query.trim());

    fetch(`/api/spots?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
        setState({ status: "ready", results: data.results ?? [] });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [category, query, enabled]);

  return state;
}
