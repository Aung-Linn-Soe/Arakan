import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar } from "@/lib/categoryMeta";
import { spotHref } from "@/lib/spotHref";
import { Spot } from "@/types/spot";
import styles from "./SpotListRow.module.css";

type Props = {
  spot: Spot;
};

// 「一覧」タブ用の行。地図タブの選択カード(SpotCard)とは違い、タップしたら
// その場でプレビューするのではなく、直接詳細ページへ遷移する単純な一覧行
// (右端の">"がその導線を示す)。
export default function SpotListRow({ spot }: Props) {
  const { pick } = useLocale();
  const name = pick(spot.name);
  const color = categoryColorVar[spot.category];

  return (
    <Link href={spotHref(spot)} className={styles.row}>
      <div className={styles.avatar} style={{ background: color }} aria-hidden="true">
        {spot.name.my.charAt(0)}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{name.value}</div>
        <div className={styles.subLine}>
          {name.value === spot.name.en ? spot.district : `${spot.name.en} · ${spot.district}`}
          {spot.rating != null && ` · ★ ${spot.rating.toFixed(1)}`}
        </div>
      </div>
      <span className={styles.chevron} aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
