"use client";

import { useMemo, useState } from "react";
import { spots } from "@/data/spots";
import { useLocale } from "@/i18n/LocaleContext";
import RakhineIllustrationMap from "@/components/RakhineIllustrationMap";
import SpotCard from "./SpotCard";
import SpotListRow from "./SpotListRow";
import styles from "./MapPageClient.module.css";

type View = "map" | "list";

// ボトムナビの「地図」タブ用、フル機能の地図ページ。ホーム画面のコンパクトな
// プレビューから遷移してくる先で、以前ホームで表示していたラベル付き・
// クリック可能な地図をそのまま独立ページとして持つ。まずはキュレーション済み
// スポット(temple/coast)のみを対象にし、Google Places連携は含めない
// (コスト・スコープを抑えるため)。
// 「地図/一覧」の切り替えのみ持ち、地図の下のカード・一覧行はどちらも
// タップしたら直接詳細ページ(/spots/[slug])へ遷移する(中間プレビューは持たない)。
export default function MapPageClient() {
  const { t } = useLocale();
  const [view, setView] = useState<View>("map");

  const mapSpots = useMemo(
    () => spots.filter((s) => s.category === "temple" || s.category === "coast"),
    [],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
      <h1 className={styles.heading}>{t("navMap")}</h1>

      <div className={styles.viewToggle} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "map"}
          className={`${styles.toggleButton} ${view === "map" ? styles.toggleActive : ""}`}
          onClick={() => setView("map")}
        >
          {t("navMap")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={`${styles.toggleButton} ${view === "list" ? styles.toggleActive : ""}`}
          onClick={() => setView("list")}
        >
          {t("navList")}
        </button>
      </div>

      {view === "map" ? (
        <>
          <RakhineIllustrationMap spots={mapSpots} />
          <p className={styles.mapCaption}>{t("mapCaption")}</p>

          {/* 地図タブ: カードをタップしたら直接詳細ページへ遷移する。 */}
          <div className={styles.cardGrid}>
            {mapSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </>
      ) : (
        // 一覧タブ: 単純なリストで、タップしたらそのまま詳細ページへ遷移する。
        <div className={styles.listCol}>
          {mapSpots.map((spot) => (
            <SpotListRow key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
