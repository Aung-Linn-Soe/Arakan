import boundary from "@/data/rakhineBoundary.geo.json";

// OpenStreetMap(Nominatim, relation 5996483 = ရခိုင်ပြည်နယ် / Rakhine State)から
// 取得した実際の州境界を簡略化(Douglas-Peucker, 許容誤差0.02度)したもの。
// 地図の表示を「ラカイン州の形だけ」に絞るためのマスク描画とパン制限に使う。
type MultiPolygonGeoJson = { type: "MultiPolygon"; coordinates: number[][][][] };

const RAKHINE_MULTI_POLYGON = boundary as MultiPolygonGeoJson;

// GeoJSONは[lng, lat]、Leafletは[lat, lng]の順序なので変換する。
function toLatLngRing(ring: number[][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat, lng]);
}

// 州の外周(海に浮かぶ島も含む複数ポリゴン)。マスクの「穴」およびアウトラインの
// 両方に使う。
export const rakhineOutlineRings: [number, number][][] = RAKHINE_MULTI_POLYGON.coordinates.map(
  (polygon) => toLatLngRing(polygon[0]),
);

// 地図全体を覆う巨大な外枠。この中からラカイン州の形を「穴」として抜くことで、
// 州の外側だけを覆い隠すマスクポリゴンを作る(Leaflet/SVGのevenoddルールにより、
// 最初のリングが外枠、以降のリングはすべて穴として扱われる)。
const WORLD_OUTER_RING: [number, number][] = [
  [-85, -720],
  [85, -720],
  [85, 720],
  [-85, 720],
];

export const rakhineMaskRings: [number, number][][] = [WORLD_OUTER_RING, ...rakhineOutlineRings];

// 州の実際の形状に基づくバウンディングボックス(パン制限用に少し余裕を持たせる)。
function computeBounds(rings: [number, number][][]) {
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
  return { minLat, maxLat, minLng, maxLng };
}

const RAKHINE_ACTUAL_BOUNDS = computeBounds(rakhineOutlineRings);

// パンできる範囲。実際の州の形状のbboxに、地図端で完全に真っ白にならない程度の
// 余裕(0.3度、約30km)だけ持たせる。
const PAN_BUFFER_DEG = 0.3;
export const RAKHINE_STATE_PAN_BOUNDS: [[number, number], [number, number]] = [
  [RAKHINE_ACTUAL_BOUNDS.minLat - PAN_BUFFER_DEG, RAKHINE_ACTUAL_BOUNDS.minLng - PAN_BUFFER_DEG],
  [RAKHINE_ACTUAL_BOUNDS.maxLat + PAN_BUFFER_DEG, RAKHINE_ACTUAL_BOUNDS.maxLng + PAN_BUFFER_DEG],
];
