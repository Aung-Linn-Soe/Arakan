"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { categoryColorVar } from "@/lib/categoryMeta";
import { uploadImage } from "@/lib/uploadImage";
import { Category } from "@/types/spot";
import styles from "./SpotPhotoUpload.module.css";

type Props = {
  slug: string;
  category: Category;
  letter: string;
  onUploaded: () => void;
};

// Wikipedia等でも写真が見つからなかったスポットの詳細ページに表示する、
// ユーザーからの写真投稿を促すボックス(実在する史跡・ビーチのうち、
// 確認済みの実写真がまだ無いものを埋めていくための機能)。
export default function SpotPhotoUpload({ slug, category, letter, onUploaded }: Props) {
  const { t } = useLocale();
  const { user, supabase } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const color = categoryColorVar[category];

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setError(null);
    try {
      const imageUrl = await uploadImage(supabase, user.id, file, `spot-${slug}-`);

      const { error: insertError } = await supabase
        .from("spot_photos")
        .insert({ spot_slug: slug, user_id: user.id, image_url: imageUrl });
      if (insertError) throw insertError;

      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("spotPhotoUploadError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.avatar} style={{ background: color, color: "var(--color-primary-contrast)" }} aria-hidden="true">
        {letter}
      </div>
      <p className={styles.message}>{t("spotPhotoUploadPrompt")}</p>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {user ? (
        <label className={styles.button}>
          {uploading ? t("postSubmitting") : t("spotPhotoUploadButton")}
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <Link href="/login" className={styles.button}>
          {t("login")}
        </Link>
      )}
    </div>
  );
}
