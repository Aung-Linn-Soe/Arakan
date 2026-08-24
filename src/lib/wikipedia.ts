// Wikipedia REST/Action API を使って、スポットの要約(概要)を取得するヘルパー。
// APIキー不要・無料。
//
// 名前でのあいまい検索(action=query&list=search)は、ラカイン語/ビルマ語の
// ローマ字表記が何通りもある("Shittaung" / "Shitthaung" / "Shite-thaung" 等)ため、
// 全く違う記事(例: 王国全体の歴史記事)を拾ってしまうことが多かった。
// そのためGoogle Placesの緯度経度で近傍のWikipedia記事を探す geosearch を優先する
// (座標は表記ゆれが無いため、ランドマーク記事とはるかに高精度に一致する)。
export type WikipediaSummary = {
  title: string;
  extract: string;
  url: string;
  thumbnailUrl?: string;
};

const GEOSEARCH_RADIUS_M = 250;

async function geosearchTitle(lat: number, lng: number, lang: string): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&format=json&origin=*&gslimit=1&gsradius=${GEOSEARCH_RADIUS_M}&gscoord=${lat}|${lng}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.query?.geosearch?.[0]?.title ?? null;
}

async function searchTitleByName(query: string, lang: string): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&origin=*&srsearch=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.query?.search?.[0]?.title ?? null;
}

async function fetchSummaryByTitle(title: string, lang: string): Promise<WikipediaSummary | null> {
  const res = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.extract) return null;
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumbnailUrl: data.thumbnail?.source,
  };
}

// 1. まず座標の近傍検索(最も正確)。2. 見つからなければ名前のあいまい検索にフォールバック。
export async function findWikipediaSummary(
  name: string,
  lang: string,
  location?: { lat: number; lng: number },
): Promise<WikipediaSummary | null> {
  let title: string | null = null;

  if (location) {
    title = await geosearchTitle(location.lat, location.lng, lang);
  }
  if (!title) {
    title = await searchTitleByName(name, lang);
  }
  if (!title) return null;

  return fetchSummaryByTitle(title, lang);
}
