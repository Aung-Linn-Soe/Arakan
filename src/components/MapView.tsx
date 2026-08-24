"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { categoryColorVar, categoryIcon } from "@/lib/categoryMeta";
import { Spot } from "@/types/spot";
import { GooglePlaceResult } from "@/types/googlePlace";
import styles from "./MapView.module.css";

// ラカイン州のおおよその中心座標
const DEFAULT_CENTER: [number, number] = [19.9, 93.4];
const DEFAULT_ZOOM = 8;

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

type Props = {
  spots: Spot[];
  googlePlaces?: GooglePlaceResult[];
};

export default function MapView({ spots, googlePlaces = [] }: Props) {
  const { t, pick } = useLocale();

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
