"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import styles from "./BottomNav.module.css";

// ホーム/地図/投稿/アカウントへの導線をまとめたボトムタブバー(モバイル幅のみ表示、
// CSS側でPC幅は非表示にする。PC幅は既存のHeaderのリンクで足りるため)。
// 既存ページ(/、/map、/post、/login)への単純なリンクで、新しい状態は持たない。
const TABS = [
  { href: "/", icon: "🏠", labelKey: "navHome" },
  { href: "/map", icon: "🗺️", labelKey: "navMap" },
  { href: "/post", icon: "➕", labelKey: "newPost" },
  { href: "/account", icon: "👤", labelKey: "navAccount" },
] as const;

export default function BottomNav() {
  const { t } = useLocale();
  const pathname = usePathname();

  return (
    <nav className={styles.wrap} aria-label={t("navHome")}>
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              {tab.icon}
            </span>
            <span className={styles.label}>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
