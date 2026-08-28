"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { errorMessage } from "@/lib/errorMessage";
import { MAX_IMAGES } from "@/lib/postConstants";
import { uploadImages } from "@/lib/uploadImage";
import styles from "./EditDishForm.module.css";

type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_urls: string[] | null;
};

type Props = {
  dish: Post;
  onCancel: () => void;
  onSaved: (updated: Post) => void;
};

// 料理紹介の投稿を編集するフォーム。既存の写真は個別に削除でき、
// 空いている枚数分だけ新しい写真を追加できる(合計でMAX_IMAGESまで)。
export default function EditDishForm({ dish, onCancel, onSaved }: Props) {
  const { t } = useLocale();
  const { supabase, user } = useAuth();

  const [title, setTitle] = useState(dish.title);
  const [description, setDescription] = useState(dish.description ?? "");
  const [existingUrls, setExistingUrls] = useState(dish.image_urls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const remainingSlots = Math.max(0, MAX_IMAGES - existingUrls.length - newFiles.length);

  const newPreviewUrls = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => {
    return () => newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [newPreviewUrls]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const uploadedUrls = await uploadImages(supabase, user.id, newFiles);
      const finalUrls = [...existingUrls, ...uploadedUrls].slice(0, MAX_IMAGES);
      const { error: updateError } = await supabase
        .from("user_posts")
        .update({
          title,
          description: description || null,
          image_url: finalUrls[0] ?? null,
          image_urls: finalUrls,
        })
        .eq("id", dish.id);
      if (updateError) throw updateError;

      onSaved({ ...dish, title, description: description || null, image_urls: finalUrls });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`edit-title-${dish.id}`}>
          {t("postTitleLabel")}
        </label>
        <input
          id={`edit-title-${dish.id}`}
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`edit-description-${dish.id}`}>
          {t("postDescriptionLabel")}
        </label>
        <textarea
          id={`edit-description-${dish.id}`}
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>
          {t("postImageLabel")} ({existingUrls.length + newFiles.length}/{MAX_IMAGES})
        </span>

        {(existingUrls.length > 0 || newPreviewUrls.length > 0) && (
          <div className={styles.photoGrid}>
            {existingUrls.map((url, i) => (
              <div key={url} className={styles.photoItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className={styles.photoImage} />
                <button
                  type="button"
                  className={styles.photoRemove}
                  onClick={() => setExistingUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="remove"
                >
                  ×
                </button>
              </div>
            ))}
            {newPreviewUrls.map((url, i) => (
              <div key={url} className={styles.photoItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className={styles.photoImage} />
                <button
                  type="button"
                  className={styles.photoRemove}
                  onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {remainingSlots > 0 && (
          <input
            type="file"
            accept="image/*"
            multiple
            className={styles.input}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setNewFiles((prev) => [...prev, ...files].slice(0, prev.length + remainingSlots));
            }}
          />
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
          {saving ? t("postSubmitting") : t("submitPost")}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={saving}>
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
