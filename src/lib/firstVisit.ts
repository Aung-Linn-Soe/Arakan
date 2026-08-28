// 初回訪問時のみスプラッシュ画面(SplashScreen)を出すためのフラグ。
// LocaleContext.tsxと同じSSRセーフなパターン: SSR/初回マウント時はlocalStorageに
// アクセスせず、呼び出し側がuseEffect内でこれらを呼ぶことを前提にする。
const STORAGE_KEY = "rakhine-explorer-splash-seen";

export function hasSeenSplash(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function markSplashSeen(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
}
