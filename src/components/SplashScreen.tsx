"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import { markSplashSeen } from "@/lib/firstVisit";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./SplashScreen.module.css";

type Props = {
  onDismiss: () => void;
};

// 初回訪問時にだけ表示するスプラッシュ画面。「アカウントなしで閲覧する」は
// そのままホームへ、「アカウントを開く」はログインページへ遷移する
// (このサイトは投稿以外ログイン不要なので、ゲスト閲覧が主導線)。
export default function SplashScreen({ onDismiss }: Props) {
  const { t } = useLocale();
  const router = useRouter();

  const dismiss = () => {
    markSplashSeen();
    onDismiss();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.blobPeach} aria-hidden="true" />
      <div className={styles.blobGreen} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
        <h1 className={styles.title}>{t("appName")}</h1>
        {t("appNameEn") !== t("appName") && <p className={styles.subtitle}>{t("appNameEn")}</p>}
        <p className={styles.tagline}>{t("splashTagline")}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={dismiss}>
            {t("browseAsGuest")}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              dismiss();
              router.push("/login");
            }}
          >
            {t("signInToPost")}
          </button>
        </div>

        <div className={styles.langRow}>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
