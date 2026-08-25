import { useEffect, useState } from "react";
import { Locale } from "@/types/spot";

export type GeocodeResult = { lat: number; lng: number; label: string };

type GeocodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; results: GeocodeResult[] }
  | { status: "error" };

// Nominatimは高頻度アクセスを禁止しているため、入力が止まってから
// 500ms待ってから検索する(デバウンス)。2文字未満では検索しない。
const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

export function useGeocodeSearch(query: string, locale: Locale): GeocodeState {
  const [state, setState] = useState<GeocodeState>({ status: "idle" });

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setState({ status: "loading" });
      const params = new URLSearchParams({ q: trimmed, lang: locale });
      fetch(`/api/geocode?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setState({ status: "ready", results: data.results ?? [] }))
        .catch(() => {
          if (controller.signal.aborted) return;
          setState({ status: "error" });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  return state;
}
