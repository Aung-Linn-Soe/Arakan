"use client";

import { useLocale } from "@/i18n/LocaleContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useLocale();
  return <footer className={styles.footer}>{t("disclaimer")}</footer>;
}
