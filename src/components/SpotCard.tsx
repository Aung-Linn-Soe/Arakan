import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar } from "@/lib/categoryMeta";
import { Spot } from "@/types/spot";
import RatingStars from "./RatingStars";
import styles from "./SpotCard.module.css";

export default function SpotCard({ spot }: { spot: Spot }) {
  const { t, pick } = useLocale();
  const name = pick(spot.name);
  const description = pick(spot.description);

  return (
    <Link href={`/spots/${spot.slug}`} className={styles.card}>
      <div className={styles.topRow}>
        <span
          className={styles.categoryBadge}
          style={{ background: categoryColorVar[spot.category] }}
        >
          <span className={styles.dot} />
          {t(categoryLabelKey[spot.category])}
        </span>
        <RatingStars rating={spot.rating} />
      </div>
      <div className={styles.name}>
        {name.value}
        {name.fallback && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              padding: "1px 4px",
            }}
          >
            EN
          </span>
        )}
      </div>
      <div className={styles.district}>{spot.district}</div>
      <p className={styles.description}>{description.value}</p>
    </Link>
  );
}
