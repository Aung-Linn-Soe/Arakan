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
  // REST の page/summary は導入部の最初の1文だけしか返さず物足りないため、
  // Action API の exintro(導入部全体、通常2〜4段落)を使ってより詳しく表示する。
  // extract・サムネイル・記事URLを1回のリクエストでまとめて取得する。
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=extracts%7Cpageimages%7Cinfo&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=500&inprop=url` +
    `&titles=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data?.query?.pages ?? {})[0] as
    | {
        title?: string;
        extract?: string;
        fullurl?: string;
        thumbnail?: { source?: string };
        missing?: string;
      }
    | undefined;
  if (!page || page.missing !== undefined || !page.extract) return null;

  return {
    title: page.title ?? title,
    extract: page.extract,
    url: page.fullurl ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    thumbnailUrl: page.thumbnail?.source,
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
