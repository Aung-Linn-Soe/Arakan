"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { Locale } from "@/types/spot";
import styles from "./Header.module.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "my", label: "MY" },
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
];

export default function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">
          R
        </div>
        <span className={styles.title}>{t("appName")}</span>
      </div>
      <div className={styles.langSwitch} role="group" aria-label={t("languageLabel")}>
        {LOCALES.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            className={`${styles.langButton} ${locale === code ? styles.active : ""}`}
            aria-pressed={locale === code}
            onClick={() => setLocale(code)}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
