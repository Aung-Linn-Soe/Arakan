import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { Category } from "@/types/spot";
import styles from "./SpotPhoto.module.css";

type Props = {
  category: Category;
  photos: string[];
  alt: string;
};

// 写真が未登録のカテゴリーはアイコン付きのプレースホルダーを表示する。
// 実写真URLの配信元が確定したら next.config.ts の images.remotePatterns を設定し、
// ここを next/image に切り替える。
export default function SpotPhoto({ category, photos, alt }: Props) {
  const photo = photos[0];

  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={alt} className={styles.photo} />;
  }

  return (
    <div
      className={styles.placeholder}
      style={{ background: categoryColorVar[category], color: "var(--color-primary-contrast)" }}
      role="img"
      aria-label={alt}
    >
      {categoryIcon[category]}
    </div>
  );
}
