"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import styles from "./LoginForm.module.css";

type Mode = "login" | "signup";

export default function LoginForm() {
  const { t } = useLocale();
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = mode === "login" ? await signIn(email, password) : await signUp(email, password);

    setSubmitting(false);
    if (authError) {
      setError(authError);
      return;
    }
    router.push("/");
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.heading}>{mode === "login" ? t("login") : t("signup")}</div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? t("authProcessing") : mode === "login" ? t("login") : t("signup")}
      </button>

      <div className={styles.switchRow}>
        <button
          type="button"
          className={styles.switchLink}
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
        >
          {mode === "login" ? t("switchToSignup") : t("switchToLogin")}
        </button>
      </div>
    </form>
  );
}
