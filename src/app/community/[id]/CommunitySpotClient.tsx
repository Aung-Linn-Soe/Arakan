"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import { categoryLabelKey } from "@/i18n/dictionary";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { errorMessage } from "@/lib/errorMessage";
import EditDishForm from "@/components/EditDishForm";
import { Category } from "@/types/spot";
import styles from "./CommunitySpotClient.module.css";

type Props = {
  id: string;
};

type Post = {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  description: string | null;
  location_text: string | null;
  image_urls: string[] | null;
};

type State = { status: "loading" } | { status: "notfound" } | { status: "ready"; post: Post };

// ユーザーが投稿した寺院・ビーチ(Wikipedia/キュレーション済みデータに無いもの)の
// 詳細ページ。/spots/[slug]のようなビルド時静的ページではなく、user_postsの行を
// マウント時にPlace IDならぬPost IDで取得する(src/app/places/[id]/PlaceDetailClient.tsx
// と同じ形)。
export default function CommunitySpotClient({ id }: Props) {
  const { t } = useLocale();
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("user_posts")
      .select("id, user_id, category, title, description, location_text, image_urls")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setState(data ? { status: "ready", post: data as Post } : { status: "notfound" });
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, id]);

  if (state.status === "loading") return <p className={styles.status}>{t("googleLoading")}</p>;
  if (state.status === "notfound") return <p className={styles.status}>{t("noResults")}</p>;

  const post = state.post;
  const color = categoryColorVar[post.category];
  const isOwner = user?.id === post.user_id;

  const handleDelete = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    const { error } = await supabase.from("user_posts").delete().eq("id", post.id);
    setDeleting(false);
    if (error) {
      window.alert(errorMessage(error));
      return;
    }
    router.push("/");
  };

  if (editing) {
    return (
      <div className={styles.wrap}>
        <EditDishForm
          dish={{ id: post.id, user_id: post.user_id, title: post.title, description: post.description, image_urls: post.image_urls }}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setState({ status: "ready", post: { ...post, title: updated.title, description: updated.description, image_urls: updated.image_urls } });
            setEditing(false);
          }}
        />
      </div>
    );
  }

  const hasPhoto = !!post.image_urls && post.image_urls.length > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeading}>
        <div className={styles.stateLabel}>{t("splashStateLabel")}</div>
        <h1 className={styles.pageTitle}>{t("spotDetailHeading")}</h1>
      </div>

      <Link href="/" className={styles.backLink}>
        ← {t("backToList")}
      </Link>

      <div className={styles.photo}>
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_urls![0]} alt={post.title} className={styles.photoImage} />
        ) : (
          <div className={styles.photoPlaceholder} style={{ background: color }}>
            <span aria-hidden="true">{categoryIcon[post.category]}</span>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.name}>{post.title}</h2>
          {isOwner && (
            <div className={styles.ownerActions}>
              <button type="button" className={styles.editButton} onClick={() => setEditing(true)}>
                {t("editPost")}
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={deleting}
              >
                {t("deletePost")}
              </button>
            </div>
          )}
        </div>
        <div className={styles.metaRow}>
          <span className={styles.tag} style={{ color, borderColor: color }}>
            {t(categoryLabelKey[post.category])}
          </span>
          {/* コミュニティ投稿(ユーザー提供)であることを明示する情報源タイル。 */}
          <span className={styles.sourceTag}>{t("communitySourceLabel")}</span>
        </div>
      </div>

      {post.description && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t("descriptionHeading")}</div>
          <p className={styles.description}>{post.description}</p>
        </div>
      )}

      {post.location_text && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t("locationHeading")}</div>
          <p className={styles.coords}>{post.location_text}</p>
        </div>
      )}
    </div>
  );
}
