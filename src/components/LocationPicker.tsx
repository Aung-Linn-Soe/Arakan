"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RAKHINE_LATLNG_BOUNDS, RAKHINE_MAX_PAN_BOUNDS } from "@/lib/googlePlacesQuery";
import { useLocale } from "@/i18n/LocaleContext";
import styles from "./LocationPicker.module.css";

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (value: { lat: number; lng: number }) => void;
};

// 地図をクリックしてピンの位置(緯度経度)を選ぶための投稿フォーム用コンポーネント。
function ClickToPlaceMarker({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div>
      <div className={styles.wrap}>
        <MapContainer
          bounds={RAKHINE_LATLNG_BOUNDS}
          maxBounds={RAKHINE_MAX_PAN_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlaceMarker onChange={onChange} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
      <p className={styles.hint}>{t("locationPickerHint")}</p>
    </div>
  );
}
