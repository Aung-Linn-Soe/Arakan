"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { Locale } from "@/types/spot";
import styles from "./Header.module.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "my", label: "MY" },
  { code: "en", label: "EN" },
  { code: "ja", label: "JA" },
];

export default function Header() {
  const { locale, setLocale, t } = useLocale();
  const { user, loading, signOut } = useAuth();

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
      <div className={styles.authArea}>
        <Link href="/dishes" className={styles.authLink}>
          {t("dishesPageTitle")}
        </Link>
        {!loading && (
          <>
            {user ? (
              <>
                <Link href="/post" className={styles.authLink}>
                  {t("newPost")}
                </Link>
                <button type="button" className={styles.authLink} onClick={() => signOut()}>
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.authLink}>
                {t("login")}
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
