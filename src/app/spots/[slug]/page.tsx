import { notFound } from "next/navigation";
import { getSpotBySlug, spots } from "@/data/spots";
import SpotDetailClient from "./SpotDetailClient";

export function generateStaticParams() {
  return spots.map((spot) => ({ slug: spot.slug }));
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);

  if (!spot) {
    notFound();
  }

  return <SpotDetailClient spot={spot} />;
}
