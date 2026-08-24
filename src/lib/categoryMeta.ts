import { Category } from "@/types/spot";

export const categoryColorVar: Record<Category, string> = {
  temple: "var(--color-temple)",
  coast: "var(--color-coast)",
  food: "var(--color-food)",
  craft: "var(--color-craft)",
};

// カテゴリーごとの簡易アイコン(絵文字)。外部アイコンフォント不要でオフラインでも表示できる。
export const categoryIcon: Record<Category, string> = {
  temple: "🛕",
  coast: "🌊",
  food: "🍜",
  craft: "🧵",
};
