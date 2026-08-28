"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { Locale } from "@/types/spot";
import styles from "./LanguageSwitcher.module.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "my", label: "မြန်မာ" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

// Header.tsxの言語切替と、SplashScreen(初回訪問時)の言語切替の両方から
// 使う共通コンポーネント。見た目はスプラッシュ画面のモックアップ
// (မြန်မာ/English/日本語の3ピル)に合わせた自国語表記。
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={styles.wrap} role="group" aria-label={t("languageLabel")}>
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`${styles.button} ${locale === code ? styles.active : ""}`}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
