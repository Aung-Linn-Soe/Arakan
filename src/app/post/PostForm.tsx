"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { MAX_IMAGES } from "@/lib/postConstants";
import { errorMessage } from "@/lib/errorMessage";
import { uploadImages } from "@/lib/uploadImage";
import styles from "./PostForm.module.css";

// ユーザー投稿の対象カテゴリー。"dish"(料理紹介)・"traditional"(伝統文化紹介)は
// SpotのCategory型には無い、user_posts専用のカテゴリーで、料理/伝統的な物そのものを
// 紹介する投稿(位置は任意)。"temple"(寺院)・"coast"(ビーチ)は、Wikipediaにも
// キュレーション済みデータ(spots.ts)にも無い実在の寺院・ビーチをユーザーが
// 投稿できるようにするもので、位置(地名)が必須(src/lib/useUserSpots.ts参照)。
// 位置は地図ではなく「မြောက်ဦး၊ ရခိုင်ပြည်နယ်」のような地名のテキスト入力にし、
// 写真と同じ詳細ステップにまとめてある(そのため、これらの投稿はホーム/mapの
// イラスト地図には出ない。一覧・詳細ページにテキストで表示される)。
// 旧"food"(お店投稿)は廃止済み(DBのuser_posts_category_check制約も更新が必要。
// supabase/migrations/user_posts_temple_coast.sql参照)。
type PostCategory = "dish" | "traditional" | "temple" | "coast";
const POST_CATEGORIES: PostCategory[] = ["dish", "traditional", "temple", "coast"];
const LOCATION_REQUIRED: Record<PostCategory, boolean> = {
  dish: false,
  traditional: false,
  temple: true,
  coast: true,
};

function categoryLabel(t: (key: string) => string, category: PostCategory): string {
  if (category === "dish") return t("postCategoryDish");
  if (category === "traditional") return t("postCategoryTraditional");
  if (category === "temple") return t("postCategoryTemple");
  return t("postCategoryCoast");
}

// 内部ステップ: 1=種類選択 2=詳細(タイトル・説明・写真・位置はここにまとめる) 3=完了。
type Step = 1 | 2 | 3;
const PROGRESS_SEGMENTS = 2;

export default function PostForm() {
  const { t } = useLocale();
  const { user, loading, supabase } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<PostCategory>("dish");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [locationText, setLocationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsLocation = LOCATION_REQUIRED[category];

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

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError(t("postTitleLabel"));
      return;
    }
    if (needsLocation && !locationText.trim()) {
      setError(t("postLocationRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = await uploadImages(supabase, user.id, imageFiles);

      const { error: insertError } = await supabase.from("user_posts").insert({
        user_id: user.id,
        category,
        title,
        description: description || null,
        location_text: locationText.trim() || null,
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls,
      });
      if (insertError) throw insertError;

      setStep(3);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.wizardHeading}>
        <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
        <h1 className={styles.wizardTitle}>{t("postPageTitle")}</h1>
      </div>

      {step < 3 && (
        <div className={styles.progressBar} aria-hidden="true">
          {Array.from({ length: PROGRESS_SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={`${styles.progressSeg} ${i < step ? styles.progressActive : ""}`}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className={styles.stepBody}>
          <h2 className={styles.stepHeading}>{t("postWizardStep1Heading")}</h2>
          <p className={styles.stepSubtitle}>{t("postWizardStep1Subtitle")}</p>

          <div className={styles.optionList} role="radiogroup">
            {POST_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                className={`${styles.option} ${category === c ? styles.optionActive : ""}`}
                onClick={() => setCategory(c)}
              >
                <span className={styles.radioDot} aria-hidden="true" />
                <span>
                  <div className={styles.optionLabel}>{categoryLabel(t, c)}</div>
                  <div className={styles.optionNote}>
                    {t(LOCATION_REQUIRED[c] ? "locationRequiredNote" : "locationOptionalNote")}
                  </div>
                </span>
              </button>
            ))}
          </div>

          <div className={styles.stepActions}>
            <Link href="/" className={styles.backButton}>
              {t("postWizardBack")}
            </Link>
            <button type="button" className={styles.nextButton} onClick={() => setStep(2)}>
              {t("postWizardNext")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepBody}>
          <h2 className={styles.stepHeading}>{t("spotDetailHeading")}</h2>

          {error && <p className={styles.error}>{error}</p>}

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
            <span className={styles.label}>{t("postImageLabel")}</span>
            <label className={styles.photoDropzone}>
              <span className={styles.photoDropzonePlus} aria-hidden="true">
                +
              </span>
              <span>{t("postImageTapHint")}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setImageFiles((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
                  e.target.value = "";
                }}
              />
            </label>
            <p className={styles.hint}>
              {t("maxPhotosHint")} ({imageFiles.length}/{MAX_IMAGES})
            </p>

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

          {/* 位置(地名テキスト)は、location必須のカテゴリーだけ写真の下に続けて聞く
              (地図ピッカーではなく、詳細と同じステップにまとめて入力の手間を減らす)。 */}
          {needsLocation && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="locationText">
                {t("postLocationLabel")}
              </label>
              <input
                id="locationText"
                type="text"
                className={styles.input}
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
            </div>
          )}

          <div className={styles.stepActions}>
            <button type="button" className={styles.backButton} onClick={handleBack}>
              {t("postWizardBack")}
            </button>
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t("postSubmitting") : t("postWizardPublish")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepBody}>
          <div className={styles.doneIcon} aria-hidden="true">
            ✓
          </div>
          <h2 className={styles.doneHeading}>{t("postWizardPostedHeading")}</h2>
          <p className={styles.doneSubtitle}>{t("postWizardPostedSubtitle")}</p>
          <Link href="/account" className={styles.doneButton}>
            {t("myPostsHeading")} →
          </Link>
        </div>
      )}
    </div>
  );
}
