import { useMemo, useState } from "react";
import { Spot, Category, CATEGORIES } from "@/types/spot";
import { Locale } from "@/types/spot";

export function useFilteredSpots(spots: Spot[], locale: Locale) {
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots.filter((spot) => {
      if (spot.category !== category) return false;
      if (!q) return true;
      const name = (spot.name[locale] ?? spot.name.en).toLowerCase();
      const nameEn = spot.name.en.toLowerCase();
      const district = spot.district.toLowerCase();
      return name.includes(q) || nameEn.includes(q) || district.includes(q);
    });
  }, [spots, category, query, locale]);

  return { category, setCategory, query, setQuery, filtered };
}
