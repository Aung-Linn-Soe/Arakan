"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { categoryIcon } from "@/lib/categoryMeta";
import { GooglePlacesState } from "@/lib/useGooglePlaces";
import { Category } from "@/types/spot";
import styles from "./GooglePlacesSection.module.css";

type Props = {
  category: Category | "all";
  state: GooglePlacesState;
};

// カテゴリー選択時のGoogle Places検索結果をカードで表示するセクション。
// fetch自体はページ側で1回だけ行い(地図のピンとも共有するため)、
// このコンポーネントは結果を受け取って表示するだけの見た目担当。
export default function GooglePlacesSection({ category, state }: Props) {
  const { t } = useLocale();

  if (category === "all" || state.status === "idle") return null;

  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.headingTitle}>{t("googleResultsHeading")}</span>
        <span className={styles.attribution}>{t("googleAttribution")}</span>
      </div>

      {state.status === "loading" && <p className={styles.status}>{t("googleLoading")}</p>}

      {state.status === "error" && <p className={styles.status}>⚠ {t("googleError")}: {state.message}</p>}

      {state.status === "ready" && state.results.length === 0 && (
        <p className={styles.status}>{t("googleNoResults")}</p>
      )}

      {state.status === "ready" &&
        state.results.map((place) => (
          <div key={place.id} className={styles.card}>
            <div className={styles.photoWrap}>
              {place.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={place.photoUrl} alt={place.name} className={styles.photo} />
              ) : (
                <div className={styles.photoFallback}>{categoryIcon[category]}</div>
              )}
            </div>
            <div className={styles.body}>
              <div className={styles.name}>{place.name}</div>
              <div className={styles.metaRow}>
                {place.rating != null && (
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                    ★ {place.rating.toFixed(1)}
                    {place.userRatingCount != null ? ` (${place.userRatingCount})` : ""}
                  </span>
                )}
              </div>
              {place.formattedAddress && (
                <p className={styles.address}>{place.summary || place.formattedAddress}</p>
              )}
              {place.mapsUri && (
                <a
                  href={place.mapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapsLink}
                >
                  {t("openInGoogleMaps")} →
                </a>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
