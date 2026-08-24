"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/i18n/AuthContext";
import PhotoLightbox from "@/components/PhotoLightbox";
import EditDishForm from "./EditDishForm";
import styles from "./DishList.module.css";

type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_urls: string[] | null;
};

type ShopState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; shops: Post[] };

// 料理紹介の投稿(category = 'dish')の一覧。
// 各投稿の「お店を探す」ボタンで、同じ料理名を含むお店投稿(category = 'food')を検索する
// (厳密な紐付けではなく、まずはタイトル/説明のキーワード一致による簡易検索)。
export default function DishList() {
  const { t } = useLocale();
  const { supabase, user } = useAuth();

  const [dishes, setDishes] = useState<Post[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shopStateByDish, setShopStateByDish] = useState<Record<string, ShopState>>({});

  const [lightbox, setLightbox] = useState<{ dishId: string; index: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("user_posts")
      .select("id, user_id, title, description, image_urls")
      .eq("category", "dish")
      .order("created_at", { ascending: false })
      .then(({ data }) => setDishes(data ?? []));
  }, [supabase]);

  // RLSの delete ポリシー(auth.uid() = user_id)により、実際に削除できるのは
  // 本人の投稿だけ。ボタン自体も本人の投稿にしか出さないので二重に守られている。
  const handleDelete = async (dish: Post) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeletingId(dish.id);
    const { error } = await supabase.from("user_posts").delete().eq("id", dish.id);
    setDeletingId(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    setDishes((prev) => (prev ? prev.filter((d) => d.id !== dish.id) : prev));
  };

  const findShops = async (dish: Post) => {
    setShopStateByDish((prev) => ({ ...prev, [dish.id]: { status: "loading" } }));

    // .or() のフィルタ構文を壊す文字(, や ()) を取り除いてから検索する
    const keyword = dish.title.replace(/[,()]/g, "").trim();
    const { data } = await supabase
      .from("user_posts")
      .select("id, user_id, title, description, image_urls")
      .eq("category", "food")
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);

    setShopStateByDish((prev) => ({ ...prev, [dish.id]: { status: "ready", shops: data ?? [] } }));
  };

  if (dishes === null) return null;

  const lightboxDish = lightbox ? dishes.find((d) => d.id === lightbox.dishId) : undefined;

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>{t("dishesPageTitle")}</div>

      {dishes.length === 0 && <p className={styles.empty}>{t("dishesEmpty")}</p>}

      {dishes.map((dish) => {
        const shopState = shopStateByDish[dish.id] ?? { status: "idle" };

        if (editingId === dish.id) {
          return (
            <div key={dish.id} className={styles.card}>
              <EditDishForm
                dish={dish}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setDishes((prev) => (prev ? prev.map((d) => (d.id === updated.id ? updated : d)) : prev));
                  setEditingId(null);
                }}
              />
            </div>
          );
        }

        return (
          <div key={dish.id} className={styles.card}>
            {dish.image_urls && dish.image_urls.length > 0 && (
              <div
                className={styles.photoHero}
                onClick={() => setLightbox({ dishId: dish.id, index: 0 })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dish.image_urls[0]} alt={dish.title} className={styles.photoHeroImage} />
                {dish.image_urls.length > 1 && (
                  <span className={styles.photoCount}>📷 {dish.image_urls.length}</span>
                )}
              </div>
            )}
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <div className={styles.title}>{dish.title}</div>
                {user?.id === dish.user_id && (
                  <div className={styles.ownerActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => setEditingId(dish.id)}
                    >
                      {t("editPost")}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(dish)}
                      disabled={deletingId === dish.id}
                    >
                      {t("deletePost")}
                    </button>
                  </div>
                )}
              </div>
              {dish.description && <p className={styles.description}>{dish.description}</p>}

              {shopState.status !== "ready" && (
                <button
                  type="button"
                  className={styles.findButton}
                  onClick={() => findShops(dish)}
                  disabled={shopState.status === "loading"}
                >
                  📍 {t("findShopsButton")}
                </button>
              )}

              {shopState.status === "ready" && (
                <div className={styles.shopResults}>
                  <div className={styles.shopResultHeading}>{t("findShopsResultHeading")}</div>
                  {shopState.shops.length === 0 ? (
                    <p className={styles.noResults}>{t("findShopsNoResults")}</p>
                  ) : (
                    shopState.shops.map((shop) => (
                      <div key={shop.id} className={styles.shopCard}>
                        {shop.image_urls?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={shop.image_urls[0]} alt={shop.title} className={styles.shopPhoto} />
                        )}
                        <div>
                          <div className={styles.shopName}>{shop.title}</div>
                          {shop.description && (
                            <div className={styles.shopDescription}>{shop.description}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {lightbox && lightboxDish?.image_urls && (
        <PhotoLightbox
          photos={lightboxDish.image_urls}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(index) => setLightbox({ dishId: lightbox.dishId, index })}
        />
      )}
    </div>
  );
}
