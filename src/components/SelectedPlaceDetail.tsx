"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { GooglePlaceResult } from "@/types/googlePlace";
import styles from "./SelectedPlaceDetail.module.css";

type Props = {
  place: GooglePlaceResult;
};

// カードや地図のピンで選ばれたGoogle Placesのスポットについて、
// 地図の下に説明(概要・営業時間など)を表示するパネル。
export default function SelectedPlaceDetail({ place }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <span className={styles.name}>{place.name}</span>
        {place.rating != null && (
          <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>
            ★ {place.rating.toFixed(1)}
            {place.userRatingCount != null ? ` (${place.userRatingCount})` : ""}
          </span>
        )}
      </div>

      {place.formattedAddress && <div className={styles.metaRow}>{place.formattedAddress}</div>}

      {place.summary && (
        <>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("descriptionHeading")}</span>
          </div>
          <p className={styles.description}>{place.summary}</p>
        </>
      )}

      {place.openingHours && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("openingHours")}</span>
          <span>{place.openingHours.join(", ")}</span>
        </div>
      )}

      {place.mapsUri && (
        <a href={place.mapsUri} target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
          {t("openInGoogleMaps")} →
        </a>
      )}
    </div>
  );
}
