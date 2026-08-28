"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { rakhineOutlineRings } from "@/lib/rakhineBoundary";
import { createProjector, ringToPath } from "@/lib/mapProjection";
import { measureTextWidth } from "@/lib/measureText";
import { Spot } from "@/types/spot";
import { GooglePlaceResult } from "@/types/googlePlace";
import styles from "./RakhineIllustrationMap.module.css";

const VIEW_W = 560;
const VIEW_H = 900;
// ラベルの実測に使うフォント設定。RakhineIllustrationMap.module.cssの.label、
// globals.cssの--font-sansと揃えること(canvas measureTextはCSS変数を解決できないため
// フォント名を直接指定する)。
const LABEL_FONT = '700 13px "Myanmar Text", "Noto Sans Myanmar", "Padauk", system-ui, sans-serif';

type Props = {
  spots: Spot[];
  googlePlaces?: GooglePlaceResult[];
  focusPlace?: { id: string; lat: number; lng: number };
  onSelectGooglePlace?: (id: string) => void;
  // /mapページの下にあるスポット選択カードと連動させ、選んだスポットのドットを
  // 強調表示するためのslug(Google Placesのfocus/highlighted機構をSpotにも流用)。
  focusSpotSlug?: string | null;
  searchResult?: { lat: number; lng: number; label: string } | null;
  // ホーム画面/詳細ページ用の縮小プレビュー表示。ラベル・クリック操作を持たない
  // 静的な見た目にする。
  compact?: boolean;
  // compact時のみ有効。指定すると地図全体をこのURLへの1枚の大きなリンクにする
  // (ホームの「タップでフル地図(/map)へ」という導線用)。省略するとリンクにせず、
  // ただの静的プレビューになる(詳細ページの「位置」セクションなど、遷移不要な場合用)。
  compactLinkHref?: string;
};

// 沖縄観光サイトのような、州の形をフラットなイラストで描き、有名スポットだけを
// 赤丸+ラベルで示すスタイルの地図。実際の道路・地形タイルは使わず、
// src/data/rakhineBoundary.geo.json(無料・オープンデータ)から作った州の輪郭線だけを描く。
export default function RakhineIllustrationMap({
  spots,
  googlePlaces = [],
  focusPlace,
  onSelectGooglePlace,
  focusSpotSlug,
  searchResult,
  compact = false,
  compactLinkHref,
}: Props) {
  const { t, pick } = useLocale();

  const project = useMemo(() => createProjector(rakhineOutlineRings, VIEW_W, VIEW_H), []);

  const landPaths = useMemo(
    () => rakhineOutlineRings.map((ring) => ringToPath(ring.map(([lat, lng]) => project(lat, lng)))),
    [project],
  );

  // ラベルは全部表示すると(特にミャウーUのように近接した史跡が多いカテゴリーで)
  // 重なって読めなくなるため、評価が高い順に処理し、既に置いたラベルの矩形と
  // 重なるものはラベルだけ省略する(丸印は必ず出す)。
  type Marker = {
    key: string;
    x: number;
    y: number;
    label: string;
    color: string;
    icon?: string;
    rating?: number;
    onClick?: () => void;
    href?: string;
    highlighted?: boolean;
  };

  const markers = useMemo<Marker[]>(() => {
    const spotMarkers: Marker[] = spots.map((spot) => {
      const [x, y] = project(spot.location.lat, spot.location.lng);
      return {
        key: `s-${spot.id}`,
        x,
        y,
        label: pick(spot.name).value,
        color: categoryColorVar[spot.category],
        icon: categoryIcon[spot.category],
        rating: spot.rating,
        href: `/spots/${spot.slug}`,
        highlighted: focusSpotSlug === spot.slug,
      };
    });

    const placeMarkers: Marker[] = googlePlaces.map((place) => {
      const [x, y] = project(place.lat, place.lng);
      return {
        key: `g-${place.id}`,
        x,
        y,
        label: place.name,
        color: "#4285f4",
        rating: place.rating,
        onClick: () => onSelectGooglePlace?.(place.id),
        highlighted: focusPlace?.id === place.id,
      };
    });

    return [...spotMarkers, ...placeMarkers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [spots, googlePlaces, project, pick, onSelectGooglePlace, focusPlace, focusSpotSlug]);

  // 置いたラベルの矩形(おおよそ)を記録して、重なるラベルは非表示にする簡易衝突回避。
  // 幅はcanvasで実測する(文字数×定数の推定だとラテン文字前提でビルマ語の幅とずれるため)。
  const placedLabelBoxes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  function labelFits(x: number, y: number, label: string): boolean {
    const width = 6 + measureTextWidth(label, LABEL_FONT);
    const box = { x1: x + 6, y1: y - 7, x2: x + 6 + width, y2: y + 7 };
    const overlaps = placedLabelBoxes.some(
      (b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1,
    );
    if (!overlaps) placedLabelBoxes.push(box);
    return !overlaps;
  }

  const searchMarker = searchResult ? project(searchResult.lat, searchResult.lng) : null;

  const svg = (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.svg} role="img" aria-label={t("appName")}>
        <defs>
          {/* 海側の背景を単色ではなく、砂浜→海の色にグラデーションさせて
              「イラスト地図」らしい奥行きを出す(仕様書§5のタイル無し方針は維持)。 */}
          <linearGradient id="seaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-raised)" />
            <stop offset="100%" stopColor="var(--color-sea)" stopOpacity="0.35" />
          </linearGradient>
          <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#seaGradient)" />

        {landPaths.map((d, i) => (
          <path key={i} d={d} className={styles.land} filter="url(#landShadow)" />
        ))}

        {searchMarker && (
          <g transform={`translate(${searchMarker[0]}, ${searchMarker[1]})`}>
            <circle r={6} className={styles.searchDot} />
            <text x={10} y={4} className={styles.searchLabel}>
              {searchResult?.label}
            </text>
          </g>
        )}

        {markers.map((m) => {
          const radius = 4 + Math.min(4, Math.max(0, (m.rating ?? 3.5) - 3) * 2.2);
          // compact(ホームのプレビュー)ではドットのみで、ラベルは出さない
          // (labelFits自体呼ばない=衝突判定のコストも省く)。
          const showLabel = !compact && labelFits(m.x, m.y, m.label);
          const content = (
            <g
              transform={`translate(${m.x}, ${m.y})`}
              onClick={compact ? undefined : m.onClick}
              className={!compact && m.onClick ? styles.clickable : undefined}
            >
              <title>{m.label}</title>
              {m.highlighted && <circle r={radius + 5} className={styles.highlightRing} />}
              <circle r={radius} fill={m.color} className={styles.dot} />
              {/* カテゴリーごとの簡易アイコンをドットの中に置き、単色の丸だけより
                  「ラカインのアイコン(仏塔・波など)」を感じられるようにする。
                  半径が小さすぎるとアイコンが潰れるので、一定サイズ以上でのみ表示。 */}
              {!compact && m.icon && radius >= 5 && (
                <text className={styles.icon}>{m.icon}</text>
              )}
              {showLabel && (
                <text x={radius + 4} y={4} className={styles.label} style={{ fill: m.color }}>
                  {m.label}
                </text>
              )}
            </g>
          );
          // compactではマーカー個別のリンクは張らない(地図全体を/mapへの
          // 1枚のリンクにするため。<a>のネストを避ける)。
          return m.href && !compact ? (
            <Link key={m.key} href={m.href} className={styles.markerLink}>
              {content}
            </Link>
          ) : (
            <g key={m.key}>{content}</g>
          );
        })}
      </svg>
    </div>
  );

  if (compact && compactLinkHref) {
    return (
      <Link href={compactLinkHref} className={styles.compactLink} aria-label={t("navMap")}>
        {svg}
      </Link>
    );
  }

  return svg;
}
