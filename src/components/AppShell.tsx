"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import { hasSeenSplash } from "@/lib/firstVisit";

// レイアウト全体(Header/本文/Footer/ボトムナビ)を包み、初回訪問時だけ
// SplashScreenをその場に差し替えて表示する。SSR/初回マウント直後は
// localStorageを読めないため、既定値は「訪問済み」(=通常のアプリ本体を表示)
// にしておく。こうすることで、大多数を占める再訪問者・SSR・クローラーは
// 常にアプリ本体をそのまま受け取れる(ページ全体が一瞬空白になることがない)。
// 本当に初回訪問だった場合だけ、マウント後の判定でスプラッシュに差し替える
// (その1回に限り、本体→スプラッシュの一瞬の入れ替わりが起こる)。
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (!hasSeenSplash()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSplash(true);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
  }

  return (
    <div id="app-shell">
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
