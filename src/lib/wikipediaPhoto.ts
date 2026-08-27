// Wikipedia(Wikimedia)から、実在スポットの写真を取得するための共通処理。
// Google Places API (New) がこのプロジェクトの契約では photos フィールドを一切
// 返さないため(rating/editorialSummaryなど他フィールドは取得できるのに photos だけ
// 常に空 — 検証済み)、Google自身の写真(place.photos)を最優先で使い、
// 無ければWikipediaの記事サムネイルにフォールバックする(呼び出し側 route.ts で
// `if (place.photoUrl) return place;` を先に見ているのがこの1段階目)。
//
// 写真が取れるのはWikipediaに記事がある有名スポットのみ。市場・屋台・小さな工房のような
// 固有記事が無い場所は取得できず、カテゴリー別プレースホルダーのままになる(=正直な表示)。

const REVALIDATE_SECONDS = 60 * 60 * 24 * 30; // 30日。写真は滅多に変わらないため長めに設定

// Wikimedia API利用規約(User-Agent policy)に沿って、送信元を分かるようにする。
// https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT = "RakhineCatalogApp/1.0 (https://github.com/; contact via repository issues)";

type WikiSummary = {
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
};

// ラカイン州内の地名(この語が出てくれば、まず間違いなくラカイン州の記事)。
const RAKHINE_SIGNAL = /rakhine|arakan|mrauk|sittwe|thandwe|ngapali|myebon/i;

// ミャンマー国内の他地域(同名スポットが実際に存在し、混同しやすい)。
// 例: "Mahamuni" はマンダレーの有名寺院とMrauk-Uの小寺院の両方に存在するが、
// Wikipediaには前者(マンダレー)の記事しかない。descriptionにこれらの地名が
// 出てきた場合は、たとえ本文中にArakan/Myanmarという語が混ざっていても
// (例: 「像は元々アラカンから来た」等の由来の言及)、記事自体はラカイン州の
// スポットではないと判断して除外する。
const CONFUSABLE_OTHER_REGION = /mandalay|yangon|rangoon|bagan|bago|naypyidaw|mawlamyine|hpa-an|taunggyi/i;

function isRelevantToRakhine(data: WikiSummary): boolean {
  // description(Wikidataの短い定型説明。"Buddhist temple in Mandalay, Myanmar"のように
  // 場所が明記されることが多く、自由記述のextractより信頼できる)を優先して判定する。
  if (data.description && CONFUSABLE_OTHER_REGION.test(data.description)) return false;

  const text = `${data.description ?? ""} ${data.extract ?? ""}`;
  return RAKHINE_SIGNAL.test(text);
}

// 完全一致するタイトルでWikipediaのサマリーAPIを叩き、サムネイルURLを返す。
// 失敗理由(記事が見つからない/画像フィールドなし/別地域の同名記事/リクエストエラー)は
// 必ずconsole.errorに出す — 静かに握りつぶさない(原因調査をしやすくするため)。
async function fetchWikipediaThumbnail(title: string): Promise<string | undefined> {
  let res: Response;
  try {
    res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { "User-Agent": USER_AGENT, accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (err) {
    console.error(`[wikipediaPhoto] リクエスト失敗: title="${title}"`, err);
    return undefined;
  }

  if (!res.ok) {
    if (res.status !== 404) {
      // 404(記事が存在しない)は表記ゆれ探索の過程で頻発する正常系なのでログを出さない。
      console.error(`[wikipediaPhoto] APIがエラーを返した: title="${title}" status=${res.status}`);
    }
    return undefined;
  }

  const data: WikiSummary = await res.json();

  if (!data.thumbnail?.source) {
    console.error(`[wikipediaPhoto] 記事はヒットしたが画像フィールドが無い: title="${title}"`);
    return undefined;
  }

  if (!isRelevantToRakhine(data)) {
    console.error(
      `[wikipediaPhoto] 記事はヒットしたが別地域と判定して除外: title="${title}" description="${data.description ?? ""}"`,
    );
    return undefined;
  }

  return data.thumbnail.source;
}

// Wikipediaに記事が無くても、Wikimedia Commons(写真専用のデータベース)には
// その場所固有の写真が登録されている場合がある。ファイル名を直接指定して取得する
// (あいまい検索はしない — 誤った場所の写真を出すリスクを避けるため)。
async function fetchCommonsThumbnail(fileTitle: string): Promise<string | undefined> {
  let res: Response;
  try {
    res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        `File:${fileTitle}`,
      )}&prop=imageinfo&iiprop=url&iiurlwidth=480&format=json`,
      {
        headers: { "User-Agent": USER_AGENT, accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
  } catch (err) {
    console.error(`[wikipediaPhoto] Commonsリクエスト失敗: file="${fileTitle}"`, err);
    return undefined;
  }

  if (!res.ok) {
    console.error(`[wikipediaPhoto] Commons APIがエラーを返した: file="${fileTitle}" status=${res.status}`);
    return undefined;
  }

  const data = await res.json();
  const page = Object.values(data.query?.pages ?? {})[0] as
    | { imageinfo?: Array<{ thumburl?: string }>; missing?: string }
    | undefined;
  const thumbUrl = page?.imageinfo?.[0]?.thumburl;

  if (!thumbUrl) {
    console.error(`[wikipediaPhoto] Commonsにファイルが見つからない: file="${fileTitle}"`);
    return undefined;
  }

  return thumbUrl;
}

// 目視確認済み: WikipediaにはMrauk-U版の固有記事が無いが、Wikimedia Commonsには
// カテゴリ(Category:Ponnagyun)経由でその場所固有の写真がある場合の対応表。
const COMMONS_FILE_BY_GOOGLE_PLACE_ID: Record<string, string> = {
  "ChIJETpZMcitsTAR8HZiWBL-ZAY": "ဦးရာဇ်တော်ဓါတ်စေတီတော်.jpg", // Urittaung Pagoda
};

// スポット名(特に"Mahamuni"のような複数の場所で使われがちな名前)は、あいまい検索で
// 自動的に候補を選ぶと無関係な同名記事(別の都市の観光地など)の写真を誤って表示する
// リスクが大きい。そのため全文検索は使わず、次の2種類の「完全一致」だけを試す:
//   1. Google Place ID(安定した一意な識別子)ベースの、目視確認済み対応表
//   2. スポット名そのもの、または「スポット名, 地域名」を記事タイトルとして完全一致
// どちらも見つからない場合は undefined(プレースホルダー表示にフォールバック)。
// 補足: 2.はUIの表示言語がミャンマー語/日本語のときはGoogleが返すplace.nameも
// その言語になるため機能しない(英語版Wikipediaと一致しなくなる)。表示言語に
// 関わらず確実に効かせたいスポットは対応表(1.)にPlace IDで登録すること。
export const WIKI_TITLE_BY_GOOGLE_PLACE_ID: Record<string, string> = {
  "ChIJS9MnMi4MsTARHtB-r53n2rk": "Koe-thaung Temple", // Koe Thaung Pagoda
  "ChIJoU5iiRkMsTAR8R7Kka6ke1c": "Shite-thaung Temple", // Shaitthaung Phayar
  "ChIJlYZJQBoMsTAR3rOZXcTToYE": "Htukkanthein Temple", // Htukkant Thein Temple
  "ChIJ3Zws7BkMsTARgj9rFpwqTFU": "Andaw-thein Temple", // Andaw Thein Temple
  "ChIJPbQ95RkMsTARr5JtTz8ie84": "Ratanabon Pagoda", // Ratanabon Pagoda
  "ChIJO5i4IUwZuTARHYI-4nzE_fQ": "Ngapali Beach", // Ngapali Beach
  "ChIJx0wbWKAOsTARq2nmRcflu_E": "Zina Man Aung Pagoda", // Zina Manaung Pagoda ("Five Man Pagodas"の一つ)
  "ChIJ4U37ySMMsTARlctYN9Bvnwk": "Sakya-Man-Aung Temple", // Sakya Man Aung Pagoda ("Five Man Pagodas"の一つ)
  "ChIJH131YxoMsTARfFQHOBHIJ_g": "Le-myet-hna Temple", // Lay Myet Hna Temple
};

// 上記に無い残りの寺院(Mahamuni Buddhist Temple, Ratana Man Aung Pagoda,
// Shwe San Daw Pagoda, Shwetharlyaung Pagoda, Japan-Myanmar Relationship Pagoda等)は、
// Wikipedia本体の"Mrauk U"記事の寺院一覧・「Five Man Pagodas」の残りメンバー・
// Wikimedia Commonsの関連カテゴリまで確認した上で、次のいずれかと判断済み:
//   - 対応する固有記事/写真が存在しない(赤リンクのまま)
//   - 存在しても別都市の同名記事(例: "Shwethalyaung"はバゴーの巨大寝仏、
//     "Shwesandaw Pagoda"は複数都市の曖昧さ回避ページ)
//   - 写真はあるが記念碑板・説明板の接写のみで、観光カードとして使うには
//     不適切(例: Ratana Man Aung Pagoda、Japan-Myanmar Relationship Pagoda)
// 誤った/不適切な写真を出すよりは正直にプレースホルダーを出す方針のため、
// これらは意図的に対応表へ追加していない。

// GoogleのformattedAddressから、Wikipedia側のタイトル曖昧さ排除に使える地名の
// 手がかりを推測する(このアプリが対象とするラカイン州内の主要な町のみ)。
const KNOWN_RAKHINE_TOWNS = ["Mrauk-U", "Mrauk Oo", "Sittwe", "Thandwe", "Myebon"];

export function guessRakhineDistrictHint(formattedAddress?: string): string | undefined {
  if (!formattedAddress) return undefined;
  const match = KNOWN_RAKHINE_TOWNS.find((town) =>
    formattedAddress.toLowerCase().includes(town.toLowerCase()),
  );
  // Wikipedia記事側の表記("Mrauk-U")に揃える("Mrauk Oo"はGoogle側の表記ゆれ)
  return match === "Mrauk Oo" ? "Mrauk-U" : match;
}

export async function resolveWikipediaPhoto(params: {
  name: string;
  googlePlaceId?: string;
  // formattedAddressや district など、地名の手がかりがあれば渡す。
  // 「name, districtHint」という表記のWikipedia記事(例: "Point, Sittwe")を
  // 追加で試すことで、地名を含めた曖昧さの排除を行う。
  districtHint?: string;
}): Promise<string | undefined> {
  const { name, googlePlaceId, districtHint } = params;

  const knownTitle = googlePlaceId ? WIKI_TITLE_BY_GOOGLE_PLACE_ID[googlePlaceId] : undefined;
  if (knownTitle) {
    const photo = await fetchWikipediaThumbnail(knownTitle);
    if (photo) return photo;
  }

  const commonsFile = googlePlaceId ? COMMONS_FILE_BY_GOOGLE_PLACE_ID[googlePlaceId] : undefined;
  if (commonsFile) {
    const photo = await fetchCommonsThumbnail(commonsFile);
    if (photo) return photo;
  }

  const photoByName = await fetchWikipediaThumbnail(name);
  if (photoByName) return photoByName;

  if (districtHint && !name.toLowerCase().includes(districtHint.toLowerCase())) {
    const photoByNameAndDistrict = await fetchWikipediaThumbnail(`${name}, ${districtHint}`);
    if (photoByNameAndDistrict) return photoByNameAndDistrict;
  }

  console.error(`[wikipediaPhoto] 写真を解決できず: name="${name}" googlePlaceId=${googlePlaceId ?? "(none)"}`);
  return undefined;
}

// src/data/spots.ts のキュレーション済みスポット用: スポット側で明示的に確認済みの
// Wikipediaタイトルを指定してもらう(こちらは検索ではなく、あらかじめ人力で確認した値)。
export async function fetchWikipediaPhotoByTitle(title: string): Promise<string | undefined> {
  return fetchWikipediaThumbnail(title);
}
