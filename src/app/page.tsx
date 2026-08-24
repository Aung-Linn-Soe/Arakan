"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { spots } from "@/data/spots";
import { useLocale } from "@/i18n/LocaleContext";
import { useFilteredSpots } from "@/lib/useFilteredSpots";
import { useGooglePlaces } from "@/lib/useGooglePlaces";
import { dedupeGooglePlaces } from "@/lib/dedupeGooglePlaces";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import GooglePlacesSection from "@/components/GooglePlacesSection";
import SelectedPlaceDetail from "@/components/SelectedPlaceDetail";
import styles from "./page.module.css";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "42vh",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
        color: "var(--color-text-muted)",
      }}
    >
      …
    </div>
  ),
});

// Google Places連携は既定でオフ。まずは無料のLeaflet + OpenStreetMapで運用し、
// 必要になったら .env.local で NEXT_PUBLIC_ENABLE_GOOGLE_PLACES=true に切り替える
// (仕様書セクション3の段階移行方針に対応)。
const ENABLE_GOOGLE_PLACES = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PLACES === "true";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { category, setCategory, query, setQuery, filtered } = useFilteredSpots(
    spots,
    locale,
  );

  // fetchはここで1回だけ行い、カード一覧(GooglePlacesSection)と
  // 地図のピン(MapView)の両方で同じ結果を使う(呼び出しを増やすと課金対象のAPI
  // リクエストが増えてしまうため)。
  const googleState = useGooglePlaces(category, query, ENABLE_GOOGLE_PLACES);

  const googlePlacesForMap = useMemo(() => {
    if (googleState.status !== "ready") return [];
    return dedupeGooglePlaces(filtered, googleState.results);
  }, [googleState, filtered]);

  // カード or 地図のピンで選ばれたGoogle Placesのスポット(どちらからでも選べるよう共通のstateにする)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const selectedPlace =
    googleState.status === "ready"
      ? googleState.results.find((p) => p.id === selectedPlaceId)
      : undefined;

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} />
      <CategoryFilter value={category} onChange={setCategory} />

      <div className={styles.mapSection}>
        <div className={styles.mapCol}>
          <MapView
            spots={filtered}
            googlePlaces={googlePlacesForMap}
            focusPlace={selectedPlace}
            onSelectGooglePlace={setSelectedPlaceId}
          />
        </div>
        {ENABLE_GOOGLE_PLACES && (
          <div className={styles.listCol}>
            <GooglePlacesSection
              category={category}
              state={googleState}
              selectedId={selectedPlaceId}
              onSelect={setSelectedPlaceId}
            />
          </div>
        )}
      </div>

      {selectedPlace && <SelectedPlaceDetail place={selectedPlace} />}

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 24 }}>
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
