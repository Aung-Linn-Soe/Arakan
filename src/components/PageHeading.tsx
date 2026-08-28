"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { Category } from "@/types/spot";
import styles from "./PageHeading.module.css";

type Props = {
  category: Category;
};

// モックアップ準拠のシンプルな見出し: 小さな州名ラベル + 太字の現在カテゴリー名。
// 以前のHero/SignatureHighlightsに代わる、検索バーの上に置く軽量な導入部。
export default function PageHeading({ category }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrap}>
      <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
      <h1 className={styles.title}>{t(categoryLabelKey[category])}</h1>
    </div>
  );
}
