import { Spot } from "@/types/spot";

// ユーザーが投稿した寺院/ビーチ(src/lib/useUserSpots.ts)は、spots.tsのような
// ビルド時静的ページ(/spots/[slug])を持たず、専用の動的詳細ページ(/community/[id])を
// 参照する。useUserSpotsが作るSpotはslugを"community-<user_postsのid>"にしているので、
// その接頭辞で振り分ける。
const COMMUNITY_SLUG_PREFIX = "community-";

export function isCommunitySpot(spot: Spot): boolean {
  return spot.slug.startsWith(COMMUNITY_SLUG_PREFIX);
}

export function communitySpotId(spot: Spot): string {
  return spot.slug.slice(COMMUNITY_SLUG_PREFIX.length);
}

export function makeCommunitySlug(id: string): string {
  return `${COMMUNITY_SLUG_PREFIX}${id}`;
}

export function spotHref(spot: Spot): string {
  return isCommunitySpot(spot) ? `/community/${communitySpotId(spot)}` : `/spots/${spot.slug}`;
}
