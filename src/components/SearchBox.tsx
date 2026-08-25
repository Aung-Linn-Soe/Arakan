"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { useGeocodeSearch, GeocodeResult } from "@/lib/useGeocodeSearch";
import styles from "./SearchBox.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace?: (place: GeocodeResult) => void;
};

// 検索バー。今まで通り掲載中のスポットを名前で絞り込みつつ、
// OpenStreetMapの地名検索(Nominatim)で、掲載データに無い町・村もサジェストする。
export default function SearchBox({ value, onChange, onSelectPlace }: Props) {
  const { t, locale } = useLocale();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const geocodeState = useGeocodeSearch(value, locale);
  const suggestions = geocodeState.status === "ready" ? geocodeState.results : [];

  return (
    <div className={styles.wrap}>
      <input
        type="search"
        className={styles.input}
        placeholder={t("searchPlaceholder")}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        // クリックで選ぶ前にblurが先に発火して候補が消えてしまわないよう少し遅らせる
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        aria-label={t("searchPlaceholder")}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((place, i) => (
            <li key={`${place.lat}-${place.lng}-${i}`}>
              <button
                type="button"
                className={styles.suggestionItem}
                // mousedownの時点でpreventDefaultすることで、入力欄のblur(→候補を閉じる処理)
                // が先に発火してクリックが取りこぼされるのを防ぐ。
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectPlace?.(place);
                  setShowSuggestions(false);
                }}
              >
                📍 {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
