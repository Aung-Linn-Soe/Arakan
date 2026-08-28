// 緯度経度をSVG座標に変換するための、シンプルな正距円筒図法(緯度で経度方向を補正)。
// ラカイン州は南北に細長い形なので、この程度の簡易投影で十分自然に見える。
export type LatLng = [number, number]; // [lat, lng]

export type Projector = (lat: number, lng: number) => [number, number];

// ringsSource(境界線データなど)の緯度経度の範囲から、SVG座標へ変換する関数を作る。
// paddingRatioは、点が枠ギリギリにならないよう周囲に余白を持たせる比率。
export function createProjector(
  rings: LatLng[][],
  viewBoxWidth: number,
  viewBoxHeight: number,
  paddingRatio = 0.08,
): Projector {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const ring of rings) {
    for (const [lat, lng] of ring) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }

  const midLat = (minLat + maxLat) / 2;
  const cosLat = Math.cos((midLat * Math.PI) / 180);

  // 経度方向は緯度によって実際の距離が縮むため、cos(緯度)を掛けて補正する。
  const projWidth = (maxLng - minLng) * cosLat;
  const projHeight = maxLat - minLat;

  const padding = paddingRatio;
  const usableWidth = viewBoxWidth * (1 - padding * 2);
  const usableHeight = viewBoxHeight * (1 - padding * 2);
  const scale = Math.min(usableWidth / projWidth, usableHeight / projHeight);

  // 実際に使う幅・高さ(アスペクト比を保ったまま中央寄せするためのオフセット)
  const offsetX = (viewBoxWidth - projWidth * scale) / 2;
  const offsetY = (viewBoxHeight - projHeight * scale) / 2;

  return (lat: number, lng: number) => {
    const x = (lng - minLng) * cosLat * scale + offsetX;
    const y = (maxLat - lat) * scale + offsetY; // 北が上になるようY軸を反転
    return [x, y];
  };
}

export function ringToPath(ring: [number, number][]): string {
  if (ring.length === 0) return "";
  const [first, ...rest] = ring;
  return `M ${first[0].toFixed(2)} ${first[1].toFixed(2)} ` +
    rest.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") +
    " Z";
}
