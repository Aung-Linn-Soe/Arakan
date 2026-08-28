"use client";

import { useState } from "react";
import { spots } from "@/data/spots";
import { useLocale } from "@/i18n/LocaleContext";
import { useFilteredSpots } from "@/lib/useFilteredSpots";
import { useGooglePlaces } from "@/lib/useGooglePlaces";
import { useUserSpots } from "@/lib/useUserSpots";
import { GeocodeResult } from "@/lib/useGeocodeSearch";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import GooglePlacesSection from "@/components/GooglePlacesSection";
import CommunitySpotList from "@/components/CommunitySpotList";
import FoodHero from "@/components/FoodHero";
import DishList from "@/components/DishList";
import TraditionalList from "@/components/TraditionalList";
import RakhineIllustrationMap from "@/components/RakhineIllustrationMap";
import PageHeading from "@/components/PageHeading";
import styles from "./page.module.css";

// Google Places連携は既定でオフ。まずは無料のLeaflet + OpenStreetMapで運用し、
// 必要になったら .env.local で NEXT_PUBLIC_ENABLE_GOOGLE_PLACES=true に切り替える
// (仕様書セクション3の段階移行方針に対応)。
const ENABLE_GOOGLE_PLACES = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PLACES === "true";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { category, setCategory, query, setQuery, filtered } = useFilteredSpots(
    spots,
    locale,
  );

  // Foodタブは「ラカインで有名な料理は何か」を紹介する場(沖縄の海ブドウのような
  // 名物料理紹介)なので、Google Places(お店検索)ではなく投稿された料理紹介
  // (Rakhine dishes、旧/dishesページの内容)を表示する。
  const isFoodCategory = category === "food";
  // Traditionalタブ(旧Craft)も同様に、工房検索ではなく沖縄の三線のような
  // 「地域を象徴する伝統的な物」(衣装・工芸・芸能)を紹介する場にする。
  const isTraditionalCategory = category === "craft";
  // どちらもGoogle Placesでの場所検索を使わないタブなので、fetch自体を行わない
  // (課金対象のAPIリクエストを増やさないため)。
  const skipGooglePlaces = isFoodCategory || isTraditionalCategory;

  const googleState = useGooglePlaces(
    category,
    query,
    ENABLE_GOOGLE_PLACES && !skipGooglePlaces,
    locale,
  );

  // 検索バーで地名検索(Nominatim)を選んだ結果。
  const [searchResult, setSearchResult] = useState<GeocodeResult | null>(null);

  // Wikipedia/キュレーション済みデータに無い寺院・ビーチをユーザーが投稿できる機能。
  // 位置はテキストのみ(緯度経度なし)なので地図には出さず、下のテキスト一覧に表示する。
  const { posts: userSpotPosts } = useUserSpots(category);

  return (
    <div>
      {/* Foodタブは専用のFoodHeroを持つため、汎用の見出しは他タブでのみ出す。 */}
      {!isFoodCategory && <PageHeading category={category} />}
      <SearchBox value={query} onChange={setQuery} onSelectPlace={setSearchResult} />
      <CategoryFilter value={category} onChange={setCategory} />

      {/* Food/Traditionalタブは位置情報に基づく検索ではなく紹介コンテンツなので、地図は不要。 */}
      {isFoodCategory || isTraditionalCategory ? (
        <>
          {/* FoodHeroは画面幅いっぱいのバナーなので、.foodSectionの左右余白の
              外側(この位置)に置く。 */}
          {isFoodCategory && <FoodHero />}
          <div className={styles.foodSection}>
            {isFoodCategory ? <DishList /> : <TraditionalList />}
          </div>
        </>
      ) : (
        <div className={styles.contentSection}>
          {/* ホームでは低い高さの静的プレビューのみ表示し、タップで/mapのフル機能
              地図へ遷移する。フルサイズ・ラベル付き・クリック可能な地図はそちら側。 */}
          <RakhineIllustrationMap
            spots={filtered}
            searchResult={searchResult}
            compact
            compactLinkHref="/map"
          />

          {/* Google結果カードは、タップしたらその場でプレビューせず直接
              /places/[id]の専用詳細ページへ遷移する(/spots/[slug]と同じ設計)。 */}
          {ENABLE_GOOGLE_PLACES && <GooglePlacesSection category={category} state={googleState} />}

          {/* Wikipedia/キュレーション済みデータに無い寺院・ビーチのユーザー投稿
              (位置はテキストのみのため地図には出せない)。 */}
          <CommunitySpotList posts={userSpotPosts} />

          {filtered.length === 0 && userSpotPosts.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 24 }}>
              {t("noResults")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
