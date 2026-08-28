"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./Header.module.css";

export default function Header() {
  const { t } = useLocale();
  const { user, loading, signOut } = useAuth();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">
          R
        </div>
        <span className={styles.title}>{t("appName")}</span>
      </Link>
      <LanguageSwitcher />
      <div className={styles.authArea}>
        {/* 「Rakhine dishes」の独立ページは廃止し、ホーム画面のFoodタブに統合した
            (料理そのものの紹介はそこで見られる)。 */}
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
