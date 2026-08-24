"use client";

import { useLocale } from "@/i18n/LocaleContext";
import styles from "./SearchBox.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBox({ value, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className={styles.wrap}>
      <input
        type="search"
        className={styles.input}
        placeholder={t("searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t("searchPlaceholder")}
      />
    </div>
  );
}
