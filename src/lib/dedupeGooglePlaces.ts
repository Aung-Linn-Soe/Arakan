import { GooglePlaceResult } from "@/types/googlePlace";
import { Spot } from "@/types/spot";

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// 掲載済みの実在史跡(例:シッタウン・パゴダ)とGoogle検索結果が同じ場所を指している場合、
// 地図上でピンが重複しないよう、名称が近いものはGoogle側を除外する簡易的な名寄せ。
// 厳密なマッチングではないため、取りこぼし・誤除外はどちらも起こり得る。
export function dedupeGooglePlaces(
  curated: Spot[],
  googlePlaces: GooglePlaceResult[],
): GooglePlaceResult[] {
  const curatedNames = curated.map((spot) => normalize(spot.name.en));

  return googlePlaces.filter((place) => {
    const placeName = normalize(place.name);
    if (!placeName) return true;
    return !curatedNames.some(
      (name) => name && (placeName.includes(name) || name.includes(placeName)),
    );
  });
}
