import CommunitySpotClient from "./CommunitySpotClient";

export default async function CommunitySpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunitySpotClient id={id} />;
}
