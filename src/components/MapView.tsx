"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { Spot } from "@/types/spot";
import { GooglePlaceResult } from "@/types/googlePlace";
import { RAKHINE_LATLNG_BOUNDS } from "@/lib/googlePlacesQuery";
import { rakhineOutlineRings } from "@/lib/rakhineBoundary";
import styles from "./MapView.module.css";

// ピンの内側は白にして絵文字アイコンをそのまま見せ、カテゴリーの色は
// 枠線の方に持たせる。
function buildSpotIcon(spot: Spot) {
  const html = `
    <div class="${styles.marker}" style="border-color:${categoryColorVar[spot.category]}">
      <span>${categoryIcon[spot.category]}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "", // leafletの既定スタイル(白背景の角丸)を打ち消す
    iconSize: undefined,
    iconAnchor: [16, 16],
  });
}

// Google Places由来のピンは、掲載データと見分けられるよう外枠の色を変える
function buildGoogleIcon(place: GooglePlaceResult) {
  const html = `
    <div class="${styles.marker} ${styles.googleMarker}">
      <span>${categoryIcon[place.category]}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: undefined,
    iconAnchor: [16, 16],
  });
}

// 地名検索(Nominatim)で選んだ場所用の、掲載データとは見た目を変えたピン。
function buildSearchIcon() {
  const html = `<div class="${styles.marker} ${styles.searchMarker}"><span>📍</span></div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: undefined,
    iconAnchor: [20, 14],
  });
}

// リストでカードを選んだときに、地図をそのピンへ移動するための補助コンポーネント。
// react-leafletのMapContainerの外からは地図インスタンスを操作できないため、
// useMap()で取得したインスタンスをここで直接操作する。
function FlyToFocusedPlace({ focusPlace }: { focusPlace?: { id: string; lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (!focusPlace) return;
    map.flyTo([focusPlace.lat, focusPlace.lng], Math.max(map.getZoom(), 13));
  }, [focusPlace, map]);

  return null;
}

// 地名検索(Nominatim)で選んだ地点へ地図を移動するだけの補助コンポーネント
// (Google Placesのピンのようにポップアップを開く対象が無いのでシンプルにflyToのみ)。
function FlyToSearchResult({ point }: { point?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 13));
  }, [point, map]);

  return null;
}

type Props = {
  spots: Spot[];
  googlePlaces?: GooglePlaceResult[];
  focusPlace?: { id: string; lat: number; lng: number };
  onSelectGooglePlace?: (id: string) => void;
  searchResult?: { lat: number; lng: number; label: string } | null;
};

export default function MapView({
  spots,
  googlePlaces = [],
  focusPlace,
  onSelectGooglePlace,
  searchResult,
}: Props) {
  const { t, pick } = useLocale();

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        bounds={RAKHINE_LATLNG_BOUNDS}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        {/* OpenStreetMap標準タイル。APIキー不要・無料で利用できる。
            (CARTO Positronタイルは現在APIキーが必須になり「API KEY REQUIRED」の
            透かしが出てしまうため、キー不要なOSM標準タイルに変更) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {/* ラカイン州の境界線(目印として表示するだけで、パン/ズームは制限しない)。 */}
        <Polygon
          positions={rakhineOutlineRings}
          pathOptions={{ fill: false, className: styles.stateOutline, weight: 1.5 }}
          interactive={false}
        />
        <FlyToFocusedPlace focusPlace={focusPlace} />
        <FlyToSearchResult point={searchResult} />
        {searchResult && (
          <Marker position={[searchResult.lat, searchResult.lng]} icon={buildSearchIcon()}>
            <Popup className={styles.popup}>
              <div className={styles.popupName}>{searchResult.label}</div>
            </Popup>
          </Marker>
        )}
        {spots.map((spot) => {
          const name = pick(spot.name);
          return (
            <Marker
              key={spot.id}
              position={[spot.location.lat, spot.location.lng]}
              icon={buildSpotIcon(spot)}
            >
              <Popup className={styles.popup} maxWidth={220}>
                <div className={styles.popupName}>{name.value}</div>
                <div className={styles.popupMeta}>{spot.district}</div>
                <Link href={`/spots/${spot.slug}`} className={styles.popupLink}>
                  {t("viewDetails")}
                </Link>
              </Popup>
            </Marker>
          );
        })}

        {/* ポップアップは出さない(ピンや近くの他のピンを覆って隠してしまうため)。
            クリックしたら選択状態にするだけで、詳細は地図の下のSelectedPlaceDetail
            パネルに表示する。 */}
        {googlePlaces.map((place) => (
          <Marker
            key={`g-${place.id}`}
            position={[place.lat, place.lng]}
            icon={buildGoogleIcon(place)}
            eventHandlers={{
              click: () => onSelectGooglePlace?.(place.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
