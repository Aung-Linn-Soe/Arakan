"use client";

import { useEffect } from "react";

// 地図タイル・閲覧済みページのオフラインキャッシュ用Service Workerを登録する。
// 開発中はキャッシュがホットリロードを妨げるため、本番ビルドでのみ登録する。
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err: unknown) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);

  return null;
}
