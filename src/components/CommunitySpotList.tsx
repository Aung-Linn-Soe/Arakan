"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar } from "@/lib/categoryMeta";
import { UserSpotPost } from "@/lib/useUserSpots";
import styles from "./CommunitySpotList.module.css";

type Props = {
  posts: UserSpotPost[];
};

// Wikipedia/キュレーション済みデータに無い寺院・ビーチのユーザー投稿一覧。
// 位置がテキスト(location_text)のみでイラスト地図には出せないため、
// temple/coastタブの地図の下に、テキスト主体の一覧として別途表示する。
export default function CommunitySpotList({ posts }: Props) {
  const { t } = useLocale();
  if (posts.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>{t("communitySourceLabel")}</div>
      <div className={styles.list}>
        {posts.map((post) => {
          const color = categoryColorVar[post.category];
          const hasPhoto = !!post.image_urls && post.image_urls.length > 0;
          return (
            <Link key={post.id} href={`/community/${post.id}`} className={styles.row}>
              {hasPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.image_urls![0]} alt={post.title} className={styles.photo} />
              ) : (
                <div className={styles.avatar} style={{ background: color }} aria-hidden="true">
                  {post.title.charAt(0)}
                </div>
              )}
              <div className={styles.body}>
                <div className={styles.title}>{post.title}</div>
                <div className={styles.location}>{post.location_text || t("noLocationNote")}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
