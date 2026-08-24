"use client";

import styles from "./PhotoLightbox.module.css";

type Props = {
  photos: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

// 写真をクリックしたときに、大きく表示するためのライトボックス。
// 複数枚ある投稿では前へ/次へで切り替えられる。
export default function PhotoLightbox({ photos, index, onClose, onIndexChange }: Props) {
  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="close">
        ×
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((index - 1 + photos.length) % photos.length);
          }}
          aria-label="previous"
        >
          ‹
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" className={styles.image} onClick={(e) => e.stopPropagation()} />

      {photos.length > 1 && (
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((index + 1) % photos.length);
          }}
          aria-label="next"
        >
          ›
        </button>
      )}

      {photos.length > 1 && (
        <div className={styles.counter}>
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}
