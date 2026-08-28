"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import RatingStars from "@/components/RatingStars";
import { WikipediaSummary } from "@/lib/wikipedia";
import { GooglePlaceResult } from "@/types/googlePlace";
import { CATEGORIES, Category } from "@/types/spot";
import styles from "./PlaceDetailClient.module.css";

type Props = {
  id: string;
  category?: string;
};

type PlaceState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; place: GooglePlaceResult };

type WikiState =
  | { status: "loading" }
  | { status: "ready"; summary: WikipediaSummary | null };

// ホーム画面のGoogle検索結果カードから遷移する、その場所専用の詳細ページ。
// キュレーション済みスポット(/spots/[slug])と違い、事前に持っているデータが無いため
// マウント時にPlace IDでAPIを叩いて取得する(/spots/[slug]は静的に確認済みだが、
// こちらはGoogleのライブデータそのもの)。
export default function PlaceDetailClient({ id, category: categoryParam }: Props) {
  const { locale, t } = useLocale();
  const category: Category =
    categoryParam && (CATEGORIES as string[]).includes(categoryParam) ? (categoryParam as Category) : "temple";

  const [state, setState] = useState<PlaceState>({ status: "loading" });
  const [wiki, setWiki] = useState<WikiState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });

    const params = new URLSearchParams({ lang: locale, category });
    fetch(`/api/places/${encodeURIComponent(id)}?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: { result: GooglePlaceResult }) => setState({ status: "ready", place: data.result }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [id, category, locale]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWiki({ status: "loading" });

    const params = new URLSearchParams({
      q: state.place.name,
      lang: locale,
      lat: String(state.place.lat),
      lng: String(state.place.lng),
    });
    fetch(`/api/wikipedia?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setWiki({ status: "ready", summary: data.summary ?? null }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setWiki({ status: "ready", summary: null });
      });

    return () => controller.abort();
    // stateはready遷移の検知だけに使い、依存はplaceの中身にする(参照が変わっても
    // 値が同じなら再フェッチしない)。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status === "ready" ? state.place.id : null, locale]);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeading}>
        <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
        <h1 className={styles.pageTitle}>{t("spotDetailHeading")}</h1>
      </div>

      <Link href="/" className={styles.backLink}>
        ← {t("backToList")}
      </Link>

      {state.status === "loading" && <p className={styles.status}>{t("googleLoading")}</p>}
      {state.status === "error" && <p className={styles.status}>⚠ {t("googleError")}</p>}

      {state.status === "ready" && (
        <PlaceDetailBody place={state.place} category={category} wiki={wiki} />
      )}
    </div>
  );
}

function PlaceDetailBody({
  place,
  category,
  wiki,
}: {
  place: GooglePlaceResult;
  category: Category;
  wiki: WikiState;
}) {
  const { t } = useLocale();
  const color = categoryColorVar[category];
  const description =
    wiki.status === "ready" && wiki.summary?.extract ? wiki.summary.extract : place.summary;

  return (
    <>
      <div className={styles.photo}>
        {place.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={place.photoUrl} alt={place.name} className={styles.photoImage} />
        ) : (
          <div className={styles.photoPlaceholder} style={{ background: color }}>
            <span aria-hidden="true">{categoryIcon[category]}</span>
            <p className={styles.noPhotoNote}>{t("noPhotoNote")}</p>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <h2 className={styles.name}>{place.name}</h2>
        {place.formattedAddress && <p className={styles.address}>{place.formattedAddress}</p>}
        <div className={styles.metaRow}>
          <span className={styles.tag} style={{ color, borderColor: color }}>
            {t(categoryLabelKey[category])}
          </span>
          <RatingStars rating={place.rating} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t("descriptionHeading")}</div>
        {wiki.status === "loading" && !place.summary ? (
          <p className={styles.description}>{t("wikipediaLoading")}</p>
        ) : description ? (
          <>
            <p className={styles.description}>{description}</p>
            {wiki.status === "ready" && wiki.summary && (
              <a href={wiki.summary.url} target="_blank" rel="noopener noreferrer" className={styles.wikiSource}>
                {t("wikipediaSource")}
              </a>
            )}
          </>
        ) : (
          <p className={styles.description}>{t("descriptionUnavailable")}</p>
        )}
      </div>

      {place.openingHours && (
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("openingHours")}</span>
            <span className={styles.rowValue}>{place.openingHours.join(", ")}</span>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.attribution}>{t("googleAttribution")}</span>
        {place.mapsUri && (
          <a href={place.mapsUri} target="_blank" rel="noopener noreferrer" className={styles.mapsLink}>
            {t("openInGoogleMaps")}
          </a>
        )}
      </div>
    </>
  );
}
