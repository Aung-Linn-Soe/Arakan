"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar } from "@/lib/categoryMeta";
import RatingStars from "@/components/RatingStars";
import SpotPhoto from "@/components/SpotPhoto";
import RakhineIllustrationMap from "@/components/RakhineIllustrationMap";
import { useWikipediaPhoto } from "@/lib/useWikipediaPhoto";
import { useSpotPhotos } from "@/lib/useSpotPhotos";
import { spotHref } from "@/lib/spotHref";
import SpotPhotoUpload from "./SpotPhotoUpload";
import { spots } from "@/data/spots";
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
  const color = categoryColorVar[spot.category];

  // spot.photosが未登録でも、Wikipediaにこのスポット固有の記事があれば
  // その写真を優先して表示する。Wikipediaにも無ければ、ユーザーが投稿した
  // 実写真(spot_photos)にフォールバックし、それも無ければプレースホルダーになる。
  const wikiPhoto = useWikipediaPhoto(spot.wikipediaTitle);
  const { photos: userPhotos, refresh: refreshUserPhotos } = useSpotPhotos(spot.slug);
  const userPhotoUrl = userPhotos?.[0]?.image_url;
  const photos =
    spot.photos.length > 0
      ? spot.photos
      : wikiPhoto
        ? [wikiPhoto]
        : userPhotoUrl
          ? [userPhotoUrl]
          : spot.photos;
  const hasPhoto = photos.length > 0;

  // 「近くのスポット」は、まず同じカテゴリーのスポットから選ぶ
  // (同じ地区(例: Mrauk-U)のものを優先する)。
  const nearby = spots
    .filter((s) => s.id !== spot.id && s.category === spot.category)
    .sort((a, b) => (a.district === spot.district ? -1 : 0) - (b.district === spot.district ? -1 : 0))
    .slice(0, 4);

  // 位置セクションの地図は、/mapタブと同じtemple/coastの全スポットを背景に出し、
  // このスポットだけ強調する(食・工芸カテゴリーなど地図に出ないものは自分自身を追加)。
  const mapContextSpots = spots.filter(
    (s) => s.category === "temple" || s.category === "coast" || s.id === spot.id,
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeading}>
        <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
        <h1 className={styles.pageTitle}>{t("spotDetailHeading")}</h1>
      </div>

      <Link href="/" className={styles.backLink}>
        ← {t("backToList")}
      </Link>

      <div className={styles.photo}>
        <SpotPhoto category={spot.category} photos={photos} alt={name.value} />
        {/* 実写真が無い場合は、誤った写真を出すより正直に「写真無し」を伝える
            (仕様書§7の方針: プレースホルダー表示を優先)。 */}
        {!hasPhoto && <p className={styles.noPhotoNote}>{t("noPhotoNote")}</p>}
      </div>

      {/* Wikipedia等でも写真が見つからなかった場合、ログインユーザーが実写真を
          追加できるようにする(投稿されたらuseSpotPhotosを再取得して即反映)。 */}
      {!hasPhoto && (
        <SpotPhotoUpload
          slug={spot.slug}
          category={spot.category}
          letter={spot.name.my.charAt(0)}
          onUploaded={refreshUserPhotos}
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.name}>{name.value}</h2>
        {name.value !== spot.name.en && <p className={styles.nameEn}>{spot.name.en}</p>}
        <div className={styles.metaRow}>
          <span className={styles.tag} style={{ color, borderColor: color }}>
            {t(categoryLabelKey[spot.category])}
          </span>
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

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t("locationHeading")}</div>
        <p className={styles.coords}>
          {spot.district} · {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
        </p>
        <div className={styles.miniMap}>
          {/* 州全体の中でこのスポットがどこにあるかが分かるよう、地図タブと同じ
              temple/coastの全スポットを背景に出しつつ、このスポットだけ強調する
              (仕様書§5の「拡大縮小なし・州全体を一望」の方針は維持)。 */}
          <RakhineIllustrationMap spots={mapContextSpots} focusSpotSlug={spot.slug} compact />
        </div>
      </div>

      {nearby.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t("nearbySpotsHeading")}</div>
          <div className={styles.nearbyRow}>
            {nearby.map((n) => {
              const nColor = categoryColorVar[n.category];
              const nName = pick(n.name);
              return (
                <Link key={n.id} href={spotHref(n)} className={styles.nearbyTile}>
                  <div className={styles.nearbyAvatar} style={{ background: nColor }} aria-hidden="true">
                    {n.name.my.charAt(0)}
                  </div>
                  <div className={styles.nearbyName}>{nName.value}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
