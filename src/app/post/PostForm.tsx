"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { MAX_IMAGES } from "@/lib/postConstants";
import { errorMessage } from "@/lib/errorMessage";
import styles from "./PostForm.module.css";

// react-leafletはブラウザAPIに依存するため、サーバー側でのレンダリングを無効化する。
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

// ユーザー投稿の対象カテゴリー。"dish"(料理紹介)・"traditional"(伝統文化紹介)は
// SpotのCategory型には無い、user_posts専用のカテゴリーで、お店ではなく
// 料理/伝統的な物そのものを紹介する投稿(位置は任意)。
// 旧"craft"(工房・お店投稿)は廃止済み — Traditionalタブは工房検索ではなく
// 伝統的な物の紹介に一本化したため(DBのuser_posts_category_check制約も更新済み)。
type PostCategory = "food" | "dish" | "traditional";
const POST_CATEGORIES: PostCategory[] = ["food", "dish", "traditional"];
// 位置(地図のピン)が必須なカテゴリー。dish/traditionalは物そのものの紹介なので任意。
const LOCATION_REQUIRED: Record<PostCategory, boolean> = {
  food: true,
  dish: false,
  traditional: false,
};

function categoryLabel(t: (key: string) => string, category: PostCategory): string {
  if (category === "dish") return t("postCategoryDish");
  if (category === "traditional") return t("postCategoryTraditional");
  return t(categoryLabelKey[category]);
}

export default function PostForm() {
  const { t } = useLocale();
  const { user, loading, supabase } = useAuth();

  const [category, setCategory] = useState<PostCategory>("food");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 選んだファイルのプレビュー用URL。ファイルが変わるたびに古いURLは破棄してメモリリークを防ぐ。
  const previewUrls = useMemo(() => imageFiles.map((f) => URL.createObjectURL(f)), [imageFiles]);
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  if (loading) return null;

  if (!user) {
    return (
      <div className={styles.wrap}>
        <p className={styles.loginRequired}>
          {t("loginRequiredForPost")}
          <br />
          <Link href="/login" className={styles.loginLink}>
            {t("login")}
          </Link>
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (LOCATION_REQUIRED[category] && !location) {
      setError(t("postLocationRequired"));
      return;
    }

    setSubmitting(true);

    try {
      // 元のファイル名(日本語・スペース等)をそのまま使うと、Storageのキーとして
      // 無効になる場合があるため、拡張子だけ残して安全な名前に変える。
      const imageUrls: string[] = [];
      for (const [i, file] of imageFiles.entries()) {
        const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
        const ext = extMatch ? extMatch[0] : "";
        const path = `${user.id}/${Date.now()}-${i}${ext}`;
        const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file);
        if (uploadError) throw uploadError;
        imageUrls.push(supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl);
      }

      const { error: insertError } = await supabase.from("user_posts").insert({
        user_id: user.id,
        category,
        title,
        description: description || null,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls,
      });
      if (insertError) throw insertError;

      setSuccess(true);
      setTitle("");
      setDescription("");
      setImageFiles([]);
      setLocation(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.heading}>{t("postPageTitle")}</div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{t("postSuccess")}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="category">
          {t("postCategoryLabel")}
        </label>
        <select
          id="category"
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
        >
          {POST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(t, c)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          {t("postTitleLabel")}
        </label>
        <input
          id="title"
          type="text"
          required
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          {t("postDescriptionLabel")}
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="image">
          {t("postImageLabel")} ({imageFiles.length}/{MAX_IMAGES})
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          multiple
          className={styles.input}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setImageFiles(files.slice(0, MAX_IMAGES));
          }}
        />
        <p className={styles.hint}>{t("maxPhotosHint")}</p>

        {previewUrls.length > 0 && (
          <div className={styles.previewGrid}>
            {previewUrls.map((url, i) => (
              <div key={url} className={styles.previewItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.previewRemove}
                  onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {LOCATION_REQUIRED[category] && (
        <div className={styles.field}>
          <span className={styles.label}>{t("postLocationLabel")}</span>
          <LocationPicker value={location} onChange={setLocation} />
        </div>
      )}

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? t("postSubmitting") : t("submitPost")}
      </button>
    </form>
  );
}
