type Props = {
  rating?: number;
};

export default function RatingStars({ rating }: Props) {
  if (rating == null) return null;
  return (
    <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 13 }}>
      ★ {rating.toFixed(1)}
    </span>
  );
}
