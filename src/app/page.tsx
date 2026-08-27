"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { spots } from "@/data/spots";
import { useLocale } from "@/i18n/LocaleContext";
import { useFilteredSpots } from "@/lib/useFilteredSpots";
import { useGooglePlaces } from "@/lib/useGooglePlaces";
import { dedupeGooglePlaces } from "@/lib/dedupeGooglePlaces";
import { GeocodeResult } from "@/lib/useGeocodeSearch";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import GooglePlacesSection from "@/components/GooglePlacesSection";
import SelectedPlaceDetail from "@/components/SelectedPlaceDetail";
import DishList from "@/components/DishList";
import styles from "./page.module.css";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "70vh",
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

  // Foodタブは「ラカインで有名な料理は何か」を紹介する場(沖縄の海ブドウのような
  // 名物料理紹介)なので、Google Places(お店検索)ではなく投稿された料理紹介
  // (Rakhine dishes、旧/dishesページの内容)を表示する。そのためFoodタブでは
  // Google Places側のfetch自体を行わない(課金対象のAPIリクエストを増やさないため)。
  const isFoodCategory = category === "food";

  // fetchはここで1回だけ行い、カード一覧(GooglePlacesSection)と
  // 地図のピン(MapView)の両方で同じ結果を使う(呼び出しを増やすと課金対象のAPI
  // リクエストが増えてしまうため)。
  const googleState = useGooglePlaces(
    category,
    query,
    ENABLE_GOOGLE_PLACES && !isFoodCategory,
    locale,
  );

  // カード or 地図のピンで選ばれたGoogle Placesのスポット(どちらからでも選べるよう共通のstateにする)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 検索バーで地名検索(Nominatim)を選んだ結果。掲載データとは別に地図上に表示する。
  const [searchResult, setSearchResult] = useState<GeocodeResult | null>(null);
  const selectedPlace =
    googleState.status === "ready"
      ? googleState.results.find((p) => p.id === selectedPlaceId)
      : undefined;

  // 地図にピンを出すのは、①検索結果がちょうど1件に絞られたとき、②リストで
  // 選んだ1件、のいずれか。横のリストは(検索が空でも)常に該当件数を表示するが、
  // 地図は同じ場所に何件も重なって見づらくなるのを避けるため、それ以外は出さない。
  const googlePlacesForMap = useMemo(() => {
    if (googleState.status !== "ready") return [];
    const toShow =
      googleState.results.length === 1
        ? googleState.results
        : selectedPlace
          ? [selectedPlace]
          : [];
    return dedupeGooglePlaces(filtered, toShow);
  }, [googleState, filtered, selectedPlace]);

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} onSelectPlace={setSearchResult} />
      <CategoryFilter value={category} onChange={setCategory} />

      {/* Foodタブは位置情報に基づくものではなく料理紹介なので、地図は不要。 */}
      {isFoodCategory ? (
        <div className={styles.foodSection}>
          <DishList />
        </div>
      ) : (
        <>
          <div className={styles.mapSection}>
            <div className={styles.mapCol}>
              <MapView
                spots={filtered}
                googlePlaces={googlePlacesForMap}
                focusPlace={selectedPlace}
                onSelectGooglePlace={setSelectedPlaceId}
                searchResult={searchResult}
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
        </>
      )}
    </div>
  );
}
