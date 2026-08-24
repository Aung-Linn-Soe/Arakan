"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { GooglePlaceResult } from "@/types/googlePlace";
import { WikipediaSummary } from "@/lib/wikipedia";
import styles from "./SelectedPlaceDetail.module.css";

type Props = {
  place: GooglePlaceResult;
};

type WikiState =
  | { status: "loading" }
  | { status: "ready"; summary: WikipediaSummary | null };

// カードや地図のピンで選ばれたGoogle Placesのスポットについて、
// 地図の下に説明(概要・営業時間など)を表示するパネル。
// GoogleのeditorialSummaryは一文だけで無いことも多いため、
// より詳しい説明はWikipediaから取得して補う(見つからなければGoogle側の説明にフォールバック)。
export default function SelectedPlaceDetail({ place }: Props) {
  const { t, locale } = useLocale();
  const [wiki, setWiki] = useState<WikiState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWiki({ status: "loading" });

    const params = new URLSearchParams({
      q: place.name,
      lang: locale,
      lat: String(place.lat),
      lng: String(place.lng),
    });
    fetch(`/api/wikipedia?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setWiki({ status: "ready", summary: data.summary ?? null }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setWiki({ status: "ready", summary: null });
      });

    return () => controller.abort();
  }, [place.id, place.name, place.lat, place.lng, locale]);

  const description = wiki.status === "ready" ? wiki.summary?.extract || place.summary : place.summary;

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <span className={styles.name}>{place.name}</span>
      </div>

      {place.formattedAddress && <div className={styles.metaRow}>{place.formattedAddress}</div>}

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t("descriptionHeading")}</span>
      </div>
      {wiki.status === "loading" && !place.summary ? (
        <p className={styles.description}>{t("wikipediaLoading")}</p>
      ) : description ? (
        <>
          <p className={styles.description}>{description}</p>
          {wiki.status === "ready" && wiki.summary && (
            <a
              href={wiki.summary.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.wikiSource}
            >
              {t("wikipediaSource")}
            </a>
          )}
        </>
      ) : (
        <p className={styles.description}>{t("descriptionUnavailable")}</p>
      )}

      {place.openingHours && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("openingHours")}</span>
          <span>{place.openingHours.join(", ")}</span>
        </div>
      )}

      {place.mapsUri && (
        <a href={place.mapsUri} target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
          {t("openInGoogleMaps")}
        </a>
      )}
    </div>
  );
}
