"use client";

import { useLocale } from "@/i18n/LocaleContext";
import styles from "./FoodHero.module.css";

// Foodタブ冒頭のヒーロー導入部。「これがラカインの食」という世界観を最初に
// 一目で伝える(沖縄観光サイトの海ブドウ紹介のような役割)。この下に番号付きの
// 名物料理カード(DishShowcase)、さらにその下に既存のユーザー投稿一覧(DishList)を
// 続ける構成。
export default function FoodHero() {
  const { t } = useLocale();

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>{t("foodHeroLabel")}</div>
      <h1 className={styles.title}>{t("foodHeroTitle")}</h1>
      <p className={styles.subtitle}>{t("foodHeroSubtitle")}</p>
    </div>
  );
}
