"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { errorMessage } from "@/lib/errorMessage";
import EditDishForm from "@/components/EditDishForm";
import styles from "./AccountClient.module.css";

type PostCategory = "dish" | "traditional" | "temple" | "coast";

type Post = {
  id: string;
  user_id: string;
  category: PostCategory;
  title: string;
  description: string | null;
  location_text: string | null;
  image_urls: string[] | null;
  created_at: string;
};

function categoryLabel(t: (key: string) => string, category: PostCategory): string {
  if (category === "dish") return t("postCategoryDish");
  if (category === "traditional") return t("postCategoryTraditional");
  return t(categoryLabelKey[category]);
}

// 「マイ投稿」ページ(元デザインのisMine相当)。ログインユーザー自身の投稿
// (dish/traditional/temple/coast全カテゴリー)を一覧表示し、編集・削除できる。
// RLSポリシーにより実際に操作できるのも本人の投稿のみ(仕様書§4.4)。
export default function AccountClient() {
  const { t } = useLocale();
  const { user, loading, supabase, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_posts")
      .select("id, user_id, category, title, description, location_text, image_urls, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data as Post[] | null) ?? []));
  }, [supabase, user]);

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

  const handleDelete = async (post: Post) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeletingId(post.id);
    const { error } = await supabase.from("user_posts").delete().eq("id", post.id);
    setDeletingId(null);
    if (error) {
      window.alert(errorMessage(error));
      return;
    }
    setPosts((prev) => (prev ? prev.filter((p) => p.id !== post.id) : prev));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.profileRow}>
        <div className={styles.avatar} aria-hidden="true">
          {(user.email ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileBody}>
          <div className={styles.profileName}>{user.email}</div>
        </div>
        <button type="button" className={styles.logoutButton} onClick={() => signOut()}>
          {t("logout")}
        </button>
      </div>

      <div className={styles.sectionTitle}>{t("myPostsHeading")}</div>

      {posts === null ? null : posts.length === 0 ? (
        <p className={styles.empty}>{t("myPostsEmpty")}</p>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => {
            if (editingId === post.id) {
              return (
                <div key={post.id} className={styles.card}>
                  <EditDishForm
                    dish={{
                      id: post.id,
                      user_id: post.user_id,
                      title: post.title,
                      description: post.description,
                      image_urls: post.image_urls,
                    }}
                    onCancel={() => setEditingId(null)}
                    onSaved={(updated) => {
                      setPosts((prev) =>
                        prev
                          ? prev.map((p) =>
                              p.id === updated.id
                                ? { ...p, title: updated.title, description: updated.description, image_urls: updated.image_urls }
                                : p,
                            )
                          : prev,
                      );
                      setEditingId(null);
                    }}
                  />
                </div>
              );
            }

            return (
              <div key={post.id} className={styles.card}>
                <div className={styles.cardTopRow}>
                  <span className={styles.tag}>{categoryLabel(t, post.category)}</span>
                  <span className={styles.date}>{post.created_at.slice(0, 10)}</span>
                </div>
                <div className={styles.title}>{post.title}</div>
                {post.description && <p className={styles.description}>{post.description}</p>}
                <div className={styles.place}>{post.location_text || t("noLocationNote")}</div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.actionButton} onClick={() => setEditingId(post.id)}>
                    {t("editPost")}
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => handleDelete(post)}
                    disabled={deletingId === post.id}
                  >
                    {t("deletePost")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.rlsNote}>{t("rlsNote")}</p>
    </div>
  );
}
