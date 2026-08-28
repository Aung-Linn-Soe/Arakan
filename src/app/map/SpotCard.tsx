"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useWikipediaPhoto } from "@/lib/useWikipediaPhoto";
import { spotHref } from "@/lib/spotHref";
import SpotPhoto from "@/components/SpotPhoto";
import { Spot } from "@/types/spot";
import styles from "./SpotCard.module.css";

type Props = {
  spot: Spot;
};

// 地図タブの下に並べる、写真付きのスポットカード。タップしたらその場でプレビュー
// せず、直接詳細ページ(/spots/[slug])へ遷移する(一覧タブのSpotListRowと
// 同じ「直接遷移」の設計に統一)。写真はspot.photos、無ければ確認済みの
// Wikipedia記事写真で補い、それも無ければカテゴリー別プレースホルダーになる。
export default function SpotCard({ spot }: Props) {
  const { pick } = useLocale();
  const name = pick(spot.name);

  const wikiPhoto = useWikipediaPhoto(spot.wikipediaTitle);
  const photos = spot.photos.length > 0 ? spot.photos : wikiPhoto ? [wikiPhoto] : spot.photos;

  return (
    <Link href={spotHref(spot)} className={styles.card}>
      <div className={styles.photo}>
        <SpotPhoto category={spot.category} photos={photos} alt={name.value} />
      </div>
      <div className={styles.name}>{name.value}</div>
      <div className={styles.subLine}>
        {name.value === spot.name.en ? spot.district : `${spot.name.en} · ${spot.district}`}
      </div>
    </Link>
  );
}
