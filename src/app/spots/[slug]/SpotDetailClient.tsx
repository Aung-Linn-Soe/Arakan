"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar } from "@/lib/categoryMeta";
import RatingStars from "@/components/RatingStars";
import SpotPhoto from "@/components/SpotPhoto";
import { useWikipediaPhoto } from "@/lib/useWikipediaPhoto";
import { Spot } from "@/types/spot";
import styles from "./SpotDetailClient.module.css";

function freshnessLabel(lastUpdated: string, locale: string): string {
  const days = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 90) {
    return locale === "ja" ? "情報は新しめです" : locale === "my" ? "အချက်အလက် အသစ်" : "Recently verified";
  }
  if (days < 365) {
    return locale === "ja"
      ? "更新から時間が経っています。現地で再確認を"
      : locale === "my"
        ? "အချိန်အနည်းငယ် ကြာနေပါသည်၊ ဒေသန္တရတွင် ပြန်စစ်ပါ"
        : "Somewhat dated — double-check locally";
  }
  return locale === "ja"
    ? "情報が古い可能性があります。必ず現地で確認してください"
    : locale === "my"
      ? "အချက်အလက် ဟောင်းနိုင်သည်၊ ဒေသန္တရတွင် မှန်ကန်မှု စစ်ပါ"
      : "May be outdated — verify locally before visiting";
}

export default function SpotDetailClient({ spot }: { spot: Spot }) {
  const { locale, t, pick } = useLocale();
  const name = pick(spot.name);
  const description = pick(spot.description);

  // spot.photosが未登録でも、Wikipediaにこのスポット固有の記事があれば
  // その写真を優先して表示する(無ければ従来通りプレースホルダー)。
  const wikiPhoto = useWikipediaPhoto(spot.wikipediaTitle);
  const photos = spot.photos.length > 0 ? spot.photos : wikiPhoto ? [wikiPhoto] : spot.photos;

  return (
    <div className={styles.wrap}>
      <Link href="/" className={styles.backLink}>
        ← {t("backToList")}
      </Link>

      <div className={styles.photo}>
        <SpotPhoto category={spot.category} photos={photos} alt={name.value} />
      </div>

      <div className={styles.header}>
        <div className={styles.categoryRow}>
          <span className={styles.dot} style={{ background: categoryColorVar[spot.category] }} />
          {t(categoryLabelKey[spot.category])}
        </div>
        <h1 className={styles.name}>{name.value}</h1>
        <div className={styles.metaRow}>
          <span>{spot.district}</span>
          <RatingStars rating={spot.rating} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t("descriptionHeading")}</div>
        <p className={styles.description}>{description.value}</p>
      </div>

      <div className={styles.card}>
        {spot.openingHours && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("openingHours")}</span>
            <span className={styles.rowValue}>{spot.openingHours.join(", ")}</span>
          </div>
        )}
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("lastUpdated")}</span>
          <span className={styles.rowValue}>{spot.lastUpdated}</span>
        </div>
        {spot.sourceNote && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("source")}</span>
            <span className={styles.rowValue}>{spot.sourceNote}</span>
          </div>
        )}
      </div>

      <p className={styles.freshness}>{freshnessLabel(spot.lastUpdated, locale)}</p>

      <Link href="/" className={styles.mapLink}>
        {t("viewOnMap")}
      </Link>
    </div>
  );
}
