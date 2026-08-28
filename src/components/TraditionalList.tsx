"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { traditionalItems } from "@/data/traditionalItems";
import PhotoLightbox from "@/components/PhotoLightbox";
import EditDishForm from "./EditDishForm";
import styles from "./TraditionalList.module.css";

type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_urls: string[] | null;
};

// Traditionalタブ(旧Craft)の中身。沖縄の三線のように「地域を象徴する伝統的な物」を
// 紹介する場なので、Google Places(工房検索)ではなく、
// 1. ユーザーが New post(category="traditional")で投稿した実物の紹介
// 2. Wikipedia/Wikimedia Commonsで実在を確認できた、ラカインの伝統的な衣装・工芸・芸能
// の両方を並べて表示する。
export default function TraditionalList() {
  const { t, pick } = useLocale();
  const { supabase, user } = useAuth();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ postId: string; index: number } | null>(null);

  useEffect(() => {
    supabase
      .from("user_posts")
      .select("id, user_id, title, description, image_urls")
      .eq("category", "traditional")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data ?? []));
  }, [supabase]);

  const handleDelete = async (post: Post) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeletingId(post.id);
    const { error } = await supabase.from("user_posts").delete().eq("id", post.id);
    setDeletingId(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    setPosts((prev) => (prev ? prev.filter((p) => p.id !== post.id) : prev));
  };

  const lightboxPost = lightbox ? posts?.find((p) => p.id === lightbox.postId) : undefined;

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>{t("traditionalPageTitle")}</div>

      <div className={styles.grid}>
        {/* 1. ユーザー投稿(実際にラカインで見た/持っている物の紹介) */}
        {posts?.map((post) => {
          if (editingId === post.id) {
            return (
              <div key={post.id} className={styles.card}>
                <EditDishForm
                  dish={post}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    setPosts((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev));
                    setEditingId(null);
                  }}
                />
              </div>
            );
          }

          return (
            <div key={post.id} className={styles.card}>
              {post.image_urls && post.image_urls.length > 0 ? (
                <div
                  className={styles.photoHero}
                  onClick={() => setLightbox({ postId: post.id, index: 0 })}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image_urls[0]} alt={post.title} className={styles.photoHeroImage} />
                  {post.image_urls.length > 1 && (
                    <span className={styles.photoCount}>📷 {post.image_urls.length}</span>
                  )}
                </div>
              ) : (
                <div className={styles.photoPlaceholder} aria-hidden="true">
                  🧵
                </div>
              )}
              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <div className={styles.title}>{post.title}</div>
                  {user?.id === post.user_id && (
                    <div className={styles.ownerActions}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => setEditingId(post.id)}
                      >
                        {t("editPost")}
                      </button>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                      >
                        {t("deletePost")}
                      </button>
                    </div>
                  )}
                </div>
                {post.description && <p className={styles.description}>{post.description}</p>}
              </div>
            </div>
          );
        })}

        {/* 2. Wikipedia/Commonsで実在確認済みの、ラカインの伝統的な物 */}
        {traditionalItems.map((item) => {
          const name = pick(item.name);
          const description = pick(item.description);
          return (
            <div key={item.id} className={styles.card}>
              {item.photoUrl ? (
                <div className={styles.photoHero}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photoUrl} alt={name.value} className={styles.photoHeroImage} />
                </div>
              ) : (
                // 確認済みの実写真が無いものは、誤った写真を出すより正直な表示を優先し、
                // 他カードと並んでも寂しく見えないプレースホルダーにする。
                <div className={styles.photoPlaceholder} aria-hidden="true">
                  🧵
                </div>
              )}
              <div className={styles.body}>
                <div className={styles.title}>{name.value}</div>
                <p className={styles.description}>{description.value}</p>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.wikiLink}
                  >
                    {t("wikipediaSource")}
                  </a>
                )}
                <p className={styles.sourceNote}>{item.sourceNote}</p>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && lightboxPost?.image_urls && (
        <PhotoLightbox
          photos={lightboxPost.image_urls}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(index) => setLightbox({ postId: lightbox.postId, index })}
        />
      )}
    </div>
  );
}
