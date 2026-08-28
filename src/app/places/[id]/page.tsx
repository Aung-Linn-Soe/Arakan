import PlaceDetailClient from "./PlaceDetailClient";

export default async function PlaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { id } = await params;
  const { category } = await searchParams;
  return <PlaceDetailClient id={id} category={category} />;
}
