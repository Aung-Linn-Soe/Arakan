"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar } from "@/lib/categoryMeta";
import { CATEGORIES, Category } from "@/types/spot";
import styles from "./CategoryFilter.module.css";

type Props = {
  value: Category | "all";
  onChange: (value: Category | "all") => void;
};

export default function CategoryFilter({ value, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrap} role="tablist" aria-label={t("categoryAll")}>
      <button
        type="button"
        role="tab"
        aria-selected={value === "all"}
        className={`${styles.pill} ${value === "all" ? styles.active : ""}`}
        onClick={() => onChange("all")}
      >
        <span className={styles.dot} style={{ background: "currentColor" }} />
        {t("categoryAll")}
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={value === category}
          className={`${styles.pill} ${value === category ? styles.active : ""}`}
          onClick={() => onChange(category)}
        >
          <span
            className={styles.dot}
            style={{
              background:
                value === category ? "currentColor" : categoryColorVar[category],
            }}
          />
          {t(categoryLabelKey[category])}
        </button>
      ))}
    </div>
  );
}
