"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { Spot } from "@/types/spot";
import { GooglePlaceResult } from "@/types/googlePlace";
import { RAKHINE_BOUNDS } from "@/lib/googlePlacesQuery";
import styles from "./MapView.module.css";

// 初期表示はラカイン州のバウンディングボックスにフィットさせる。
const RAKHINE_LATLNG_BOUNDS: [[number, number], [number, number]] = [
  [RAKHINE_BOUNDS.low.lat, RAKHINE_BOUNDS.low.lng],
  [RAKHINE_BOUNDS.high.lat, RAKHINE_BOUNDS.high.lng],
];
// パン(ドラッグ移動)できる範囲も、ラカイン州から大きく離れられないよう
// 少し余裕を持たせた範囲に制限する。
const MAX_PAN_BOUNDS: [[number, number], [number, number]] = [
  [RAKHINE_BOUNDS.low.lat - 1.5, RAKHINE_BOUNDS.low.lng - 1.5],
  [RAKHINE_BOUNDS.high.lat + 1.5, RAKHINE_BOUNDS.high.lng + 1.5],
];

function buildSpotIcon(spot: Spot) {
  const html = `
    <div class="${styles.marker}" style="background:${categoryColorVar[spot.category]}">
      <span>${categoryIcon[spot.category]}</span>
      ${spot.rating != null ? `<span>${spot.rating.toFixed(1)}</span>` : ""}
    </div>
  `;
  return L.divIcon({
    html,
    className: "", // leafletの既定スタイル(白背景の角丸)を打ち消す
    iconSize: undefined,
    iconAnchor: [20, 14],
  });
}

// Google Places由来のピンは、掲載データと見分けられるよう外枠の色を変える
function buildGoogleIcon(place: GooglePlaceResult) {
  const html = `
    <div class="${styles.marker} ${styles.googleMarker}" style="background:${categoryColorVar[place.category]}">
      <span>${categoryIcon[place.category]}</span>
      ${place.rating != null ? `<span>${place.rating.toFixed(1)}</span>` : ""}
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: undefined,
    iconAnchor: [20, 14],
  });
}

// リストでカードを選んだときに、地図をそのピンへ移動してポップアップを開くための補助コンポーネント。
// react-leafletのMapContainerの外からは地図インスタンスを操作できないため、
// useMap()で取得したインスタンスをここで直接操作する。
function FlyToFocusedPlace({
  focusPlace,
  markerRefs,
}: {
  focusPlace?: { id: string; lat: number; lng: number };
  markerRefs: React.RefObject<Record<string, L.Marker | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusPlace) return;
    map.flyTo([focusPlace.lat, focusPlace.lng], Math.max(map.getZoom(), 13));
    // 地図の移動が終わってからポップアップを開く(移動中に開くと位置がずれる)
    const openPopup = () => markerRefs.current[focusPlace.id]?.openPopup();
    map.once("moveend", openPopup);
    return () => {
      map.off("moveend", openPopup);
    };
  }, [focusPlace, map, markerRefs]);

  return null;
}

type Props = {
  spots: Spot[];
  googlePlaces?: GooglePlaceResult[];
  focusPlace?: { id: string; lat: number; lng: number };
  onSelectGooglePlace?: (id: string) => void;
};

export default function MapView({
  spots,
  googlePlaces = [],
  focusPlace,
  onSelectGooglePlace,
}: Props) {
  const { t, pick } = useLocale();
  const googleMarkerRefs = useRef<Record<string, L.Marker | null>>({});

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        bounds={RAKHINE_LATLNG_BOUNDS}
        maxBounds={MAX_PAN_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToFocusedPlace focusPlace={focusPlace} markerRefs={googleMarkerRefs} />
        {spots.map((spot) => {
          const name = pick(spot.name);
          return (
            <Marker
              key={spot.id}
              position={[spot.location.lat, spot.location.lng]}
              icon={buildSpotIcon(spot)}
            >
              <Popup className={styles.popup}>
                <div className={styles.popupName}>{name.value}</div>
                <div className={styles.popupMeta}>{spot.district}</div>
                <Link href={`/spots/${spot.slug}`} className={styles.popupLink}>
                  {t("viewDetails")}
                </Link>
              </Popup>
            </Marker>
          );
        })}

        {googlePlaces.map((place) => (
          <Marker
            key={`g-${place.id}`}
            position={[place.lat, place.lng]}
            icon={buildGoogleIcon(place)}
            ref={(instance) => {
              googleMarkerRefs.current[place.id] = instance;
            }}
            eventHandlers={{
              click: () => onSelectGooglePlace?.(place.id),
            }}
          >
            <Popup className={styles.popup}>
              <div className={styles.popupName}>{place.name}</div>
              {(place.summary || place.formattedAddress) && (
                <div className={styles.popupMeta}>{place.summary || place.formattedAddress}</div>
              )}
              {place.rating != null && (
                <div className={styles.popupMeta}>
                  ★ {place.rating.toFixed(1)}
                  {place.userRatingCount != null ? ` (${place.userRatingCount})` : ""}
                </div>
              )}
              {place.mapsUri && (
                <a
                  href={place.mapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.popupLink}
                >
                  {t("openInGoogleMaps")} →
                </a>
              )}
              <div className={styles.popupAttribution}>{t("googleAttribution")}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
