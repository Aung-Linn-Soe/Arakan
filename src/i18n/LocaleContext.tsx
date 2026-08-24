"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Locale, LocalizedText } from "@/types/spot";
import { t as translate } from "./dictionary";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  /** LocalizedText からロケールに応じた文字列を取り出す。未翻訳は英語にフォールバックする。 */
  pick: (text: LocalizedText) => { value: string; fallback: boolean };
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "rakhine-explorer-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("my");

  useEffect(() => {
    // ハイドレーション不整合を避けるため、初期状態は既定値("my")でSSRし、
    // マウント後にlocalStorageの保存値を反映する(外部システム同期のための正当なeffect)。
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "my" || stored === "en" || stored === "ja") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const pick = useCallback(
    (text: LocalizedText): { value: string; fallback: boolean } => {
      const direct = text[locale];
      if (direct) return { value: direct, fallback: false };
      return { value: text.en, fallback: true };
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
      pick,
    }),
    [locale, setLocale, pick],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
