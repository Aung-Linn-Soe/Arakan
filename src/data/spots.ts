import { Spot } from "@/types/spot";

// ⚠️ データの信頼度について
// - 地名・座標: 公開情報に基づくおおよその位置(現地取材による正確な測位ではありません)
// - 史跡の名称・概要: 一般に知られる歴史的事実を基にしていますが、建立年代等の細部や
//   ビルマ語表記は異表記がある場合があります(sourceNote参照)
// - 評価・レビュー数・営業時間・写真: 実データが無い項目はダミー値、または未掲載としています
// 本番投入前に必ず現地取材・公式情報での確認が必要です。

export const spots: Spot[] = [
  // --- ミャウーU(Mrauk-U)の史跡群。実在する史跡です ---
  {
    id: "s1",
    slug: "shittaung-pagoda",
    category: "temple",
    name: {
      my: "ရှစ်သောင်းဘုရား",
      en: "Shittaung Pagoda",
      ja: "シッタウン・パゴダ",
    },
    district: "Mrauk-U",
    location: { lat: 20.6013, lng: 93.1958 },
    description: {
      my: "၁၅၃၅ခုနှစ်တွင် မင်းပင်းမင်းကြီး တည်ထားသည်ဟု ဆိုသည်။ 'ရှစ်သောင်းဘုရား' ဆိုသည်မှာ ဘုရားပုံရိပ် ၈သောင်းကို ကိုးကွယ်ထားသောကြောင့်ဖြစ်သည်။",
      en: "Said to have been built in 1535 by King Min Bin, and known as the \"Shrine of 80,000 Images\" for the large number of Buddha images it houses. One of Mrauk-U's most significant temples.",
      ja: "1535年に王ミンビンによって建立されたと伝わる。「8万体の仏像を祀る寺院」の意味を持つとされ、ミャウーで最も重要な寺院の一つ。",
    },
    photos: [],
    wikipediaTitle: "Shite-thaung Temple", // Wikipedia側の表記ゆれ(Shittaung⇔Shite-thaung)を確認済み
    lastUpdated: "2026-06-01",
    sourceNote: "実在する史跡。建立年代・ビルマ語表記は文献により異なる場合があり要確認",
  },
  {
    id: "s2",
    slug: "htukkanthein-temple",
    category: "temple",
    name: {
      my: "ဟုတ်ကန်းသိမ်",
      en: "Htukkanthein Temple",
      ja: "トゥッカンテイン寺院",
    },
    district: "Mrauk-U",
    location: { lat: 20.5975, lng: 93.1966 },
    description: {
      my: "၁၅၇၁ခုနှစ်ခန့်တွင် မင်းဖလောင်းမင်းကြီး တည်ထားသည်ဟု ဆိုသည်။ ရိုက်တားခံနိုင်သော တံတိုင်းပုံစံဗိသုကာဖြစ်ပြီး၊ သံဃာတော်များ ရဟန်းခံဝတ်အတွက် အသုံးပြုခဲ့သည်။",
      en: "Built around 1571 by King Min Phalaung. Its fortress-like exterior was designed to withstand attack, while the interior served as an ordination hall with a spiral corridor lined with Buddha images.",
      ja: "1571年頃、王ミンパラウンによって建立されたとされる。要塞のような外観を持ちながら、内部は螺旋状の回廊に仏像が並ぶ授戒堂として使われた。",
    },
    photos: [],
    wikipediaTitle: "Htukkanthein Temple",
    lastUpdated: "2026-06-01",
    sourceNote: "実在する史跡。建立年代・ビルマ語表記は文献により異なる場合があり要確認",
  },
  {
    id: "s3",
    slug: "koe-thaung-pagoda",
    category: "temple",
    name: {
      my: "ကိုးသောင်းဘုရား",
      en: "Koe Thaung Pagoda",
      ja: "コータウン・パゴダ",
    },
    district: "Mrauk-U",
    location: { lat: 20.5940, lng: 93.2005 },
    description: {
      my: "၁၅၅၃ခုနှစ်တွင် မင်းတိုက္ခမင်းကြီး(မင်းပင်းမင်း၏သားတော်)တည်ထားသည်ဟု ဆိုသည်။ 'ကိုးသောင်းဘုရား' ဆိုသည်မှာ ဘုရားပုံရိပ် ၉သောင်းကို ကိုးကွယ်ထားသောကြောင့်ဖြစ်ပြီး၊ ရှစ်သောင်းဘုရားထက် ၁သောင်းပိုသည်ဟု ဆိုသည်။",
      en: "Built in 1553 by King Min Dikkha (Mintaikkha), son of King Min Bin, reportedly to house even more Buddha images than Shittaung Pagoda — hence the name \"Shrine of 90,000 Images.\" Considered one of the largest single temples in Mrauk-U.",
      ja: "1553年、ミンビン王の息子ミンタイッカ王によって建立されたと伝わる。シッタウン・パゴダより多い「9万体の仏像を祀る寺院」の意味を持つとされ、ミャウー最大級の単体寺院とされる。",
    },
    photos: [],
    wikipediaTitle: "Koe-thaung Temple", // Wikipedia側の表記ゆれ(Koe Thaung⇔Koe-thaung)を確認済み
    lastUpdated: "2026-06-01",
    sourceNote: "実在する史跡。建立年代・ビルマ語表記は文献により異なる場合があり要確認",
  },
  {
    id: "s4",
    slug: "andaw-thein-temple",
    category: "temple",
    name: {
      my: "အံတော်သိမ်",
      en: "Andaw-thein Temple",
      ja: "アンドータウン寺院",
    },
    district: "Mrauk-U",
    location: { lat: 20.6000, lng: 93.1970 },
    description: {
      my: "၁၆ရာစုတွင် တည်ထားသည်ဟု ဆိုပြီး၊ ဗုဒ္ဓ၏သွားတော်အရိုးအာနုအား ထိန်းသိမ်းထားသည်ဟု ယုံကြည်ရသည်။",
      en: "Believed to have been built in the 16th century to enshrine a tooth relic of the Buddha. The name \"Andaw\" is said to derive from the Burmese word for tooth relic.",
      ja: "16世紀に建立されたと伝わり、仏舎利(仏の歯の遺骨)を祀っていると信じられている。「アンドー」は歯の遺骨を意味する語に由来するとされる。",
    },
    photos: [],
    wikipediaTitle: "Andaw-thein Temple",
    lastUpdated: "2026-06-01",
    sourceNote: "実在する史跡。建立年代・由来の詳細は要確認",
  },
  {
    id: "s5",
    slug: "dukkanthein-temple",
    category: "temple",
    name: {
      my: "ဒုက္ကန်းသိမ်",
      en: "Dukkanthein Temple",
      ja: "ドゥッカンテイン寺院",
    },
    district: "Mrauk-U",
    location: { lat: 20.5985, lng: 93.1950 },
    description: {
      my: "ဟုတ်ကန်းသိမ်နှင့် တူညီသော ဗိသုကာပုံစံဖြစ်ပြီး၊ ၁၆ရာစုတွင် တည်ထားသည်ဟု ဆိုသည်။",
      en: "Shares a similar fortress-like architectural style with Htukkanthein Temple and is believed to have been built in the 16th century, also serving defensive purposes in addition to religious use.",
      ja: "トゥッカンテイン寺院と似た要塞様式の建築で、16世紀の建立と伝わる。宗教的な役割に加え、防衛的な機能も兼ねていたとされる。",
    },
    photos: [],
    lastUpdated: "2026-06-01",
    sourceNote: "実在する史跡。建立年代・ビルマ語表記は文献により異なる場合があり要確認",
  },

  // --- 海・自然 ---
  {
    id: "s6",
    slug: "ngapali-beach",
    category: "coast",
    name: {
      my: "ငပလီ ကမ်းခြေ",
      en: "Ngapali Beach",
      ja: "ンガパリ・ビーチ",
    },
    district: "Thandwe",
    location: { lat: 18.4326, lng: 94.3667 },
    description: {
      my: "မြန်မာနိုင်ငံ၏ နာမည်ကျော်ဆုံး ကမ်းခြေတစ်ခု။ ရေသန့်၊ သဲဖြူ။",
      en: "Myanmar's best-known beach destination — clear water and fine white sand along the Bay of Bengal.",
      ja: "ミャンマーで最も知られたビーチリゾート。透明度の高い海と白い砂浜が広がる。",
    },
    photos: [],
    wikipediaTitle: "Ngapali Beach",
    rating: 4.8,
    openingHours: ["終日 (サンプル)"],
    lastUpdated: "2026-07-10",
    sourceNote: "実在するビーチ。評価数値はサンプルです",
  },
  {
    id: "s7",
    slug: "sittwe-view-point",
    category: "coast",
    name: {
      my: "စစ်တွေ View Point",
      en: "Sittwe View Point",
      ja: "シットウェー・ビューポイント",
    },
    district: "Sittwe",
    location: { lat: 20.1330, lng: 92.8830 },
    description: {
      my: "စစ်တွေမြို့၏ ရေစိမ့်ကမ်းနားတွင် နေဝင်ချိန် ကြည့်ရန် ဒေသခံများ ရေပန်းစားသော နေရာ။",
      en: "A waterfront spot in Sittwe popular with locals and visitors for watching the sunset over the bay.",
      ja: "シットウェーの水辺にある、地元の人々にも人気の夕景スポット。",
    },
    photos: [],
    wikipediaTitle: "Point, Sittwe", // 地元で"Point"と呼ばれる夕景公園。Wikipediaに記事あり
    lastUpdated: "2026-05-01",
    sourceNote: "地元で知られる夕景スポット。正式名称・座標は要確認",
  },
  {
    id: "s8",
    slug: "myebon-coast",
    category: "coast",
    name: {
      my: "မြေပုံ ကမ်းရိုး",
      en: "Myebon Coastal Area",
      ja: "ミェボン海岸",
    },
    district: "Myebon",
    location: { lat: 20.2167, lng: 93.2333 },
    description: {
      my: "လူနည်းသိသေးသော ငြိမ်သက်သည့် ကမ်းရိုးတန်းဒေသ။",
      en: "A quieter stretch of coastline, less visited than Ngapali, with mangrove-lined inlets.",
      ja: "ンガパリほど知られていない、マングローブに囲まれた静かな海岸地域。",
    },
    photos: [],
    rating: 4.1,
    lastUpdated: "2026-04-15",
    sourceNote: "サンプルデータ — 現地最新情報の確認が必要",
  },

  // --- 食 ---
  {
    id: "s9",
    slug: "sittwe-central-market",
    category: "food",
    name: {
      my: "စစ်တွေ ဗဟိုဈေး",
      en: "Sittwe Central Market",
      ja: "シットウェー中央市場",
    },
    district: "Sittwe",
    location: { lat: 20.1470, lng: 92.8975 },
    description: {
      my: "ရေနံချက်ငါးနှင့် ဒေသထွက်အစားအစာများကို ရှာဖွေနိုင်သော ဗဟိုဈေးကွက်။",
      en: "Sittwe's main market, a good place to browse fresh seafood and local produce, and try Rakhine street food.",
      ja: "シットウェーの中心的な市場。鮮魚や地元の農産物が並び、ラカイン風の屋台料理も楽しめる。",
    },
    photos: [],
    openingHours: ["早朝〜午後 (サンプル)"],
    lastUpdated: "2026-05-10",
    sourceNote: "実在する市場。営業時間はサンプルです",
  },
  {
    id: "s10",
    slug: "sittwe-mohinga-stall",
    category: "food",
    name: {
      my: "စစ်တွေ မုန့်ဟင်းခါး ဆိုင်",
      en: "Sittwe Mohinga Stall",
      ja: "シットウェーのモヒンガー屋台",
    },
    district: "Sittwe",
    location: { lat: 20.1500, lng: 92.9000 },
    description: {
      my: "နံနက်စာအတွက် ရေပန်းစားသော ရခိုင်မုန့်ဟင်းခါးဆိုင်ငယ်များ။",
      en: "A popular morning food stall style serving Rakhine-style mohinga (fish noodle soup).",
      ja: "ラカイン風モヒンガー(魚のスープ麺)を提供する朝食向けの屋台。",
    },
    photos: [],
    rating: 4.5,
    openingHours: ["06:00–10:00 (サンプル)"],
    lastUpdated: "2026-06-18",
    sourceNote: "サンプルデータ — 店名・場所は要確認",
  },
  {
    id: "s11",
    slug: "rakhine-fish-curry-house",
    category: "food",
    name: {
      my: "ရခိုင် ငါးဟင်း ဆိုင်",
      en: "Rakhine Fish Curry House",
      ja: "ラカイン風魚カレー食堂",
    },
    district: "Thandwe",
    location: { lat: 18.4700, lng: 94.3667 },
    description: {
      my: "ရခိုင့်ငါးဟင်းနှင့် ရေပန်းစားသော ဒေသန္တရ အစားအစာဆိုင်။",
      en: "A local eatery known for Rakhine-style fish curry, near the Ngapali area.",
      ja: "ンガパリ近郊にある、ラカイン風魚カレーで知られる食堂。",
    },
    photos: [],
    rating: 4.3,
    lastUpdated: "2026-03-30",
    sourceNote: "サンプルデータ — 店名・場所は要確認",
  },
  {
    id: "s14",
    slug: "maw-leik-mont-di",
    category: "food",
    name: {
      my: "မော်လိပ် မုန့်တီ",
      en: "Maw Leik Mont Di",
      ja: "モーレイ・モンディー",
    },
    district: "Sittwe",
    location: { lat: 20.1419, lng: 92.8992 },
    description: {
      my: "ရခိုင်ပြည်ယဉ်ကျေးမှုပြတိုက်ရှေ့၊ မော်လိပ်ရပ်ကွက်ရှိ ရခိုင်မုန့်တီ ဆိုင်။ ပုစွန်သားနှင့် ရေချိုးမုန့်တီအတွက် ကျော်ကြားသည်။",
      en: "A Rakhine-style mont di (rice-noodle) shop in Sittwe's Maw Laik Ward, right in front of the Rakhine State Cultural Museum — named after both the neighborhood and the dish it serves. Known for its crab-topped mont di.",
      ja: "シットウェーのマウレイ地区、ラカイン州文化博物館の目の前にあるラカイン風モンディー(米麺)の店。地区名と料理名を店名にしており、カニの身をのせたモンディーで知られる。",
    },
    photos: [],
    lastUpdated: "2026-08-27",
    sourceNote: "Web検索(foodpanda等)を基に住所を確認。座標は近隣のラカイン州文化博物館の位置で代用(要現地確認)。写真は未掲載 — 確認済みの直リンク可能な画像URLが判明次第追加予定",
  },

  // --- 工芸 ---
  {
    id: "s12",
    slug: "rakhine-weaving-workshop",
    category: "craft",
    name: {
      my: "ရခိုင် ရိုးရာ ယက်လက်မှု ဆိုင်ရာ",
      en: "Traditional Rakhine Weaving Workshop",
      ja: "ラカイン伝統織物工房",
    },
    district: "Mrauk-U",
    location: { lat: 20.6050, lng: 93.2020 },
    description: {
      my: "ရခိုင်ရိုးရာ အထည်ယက်နည်းကို လက်ဆင့်ကမ်းထားသော အလုပ်ရုံငယ်။",
      en: "A small workshop preserving traditional Rakhine handloom weaving techniques.",
      ja: "ラカイン伝統の手織り技術を継承する小さな工房。",
    },
    photos: [],
    rating: 4.0,
    lastUpdated: "2026-02-12",
    sourceNote: "サンプルデータ — 実在店舗の特定情報ではありません",
  },
  {
    id: "s13",
    slug: "lacquerware-silverwork-studio",
    category: "craft",
    name: {
      my: "ကြေးမောင်း၊ ငွေပန်းထိမ် လက်မှုပညာ",
      en: "Lacquerware & Silverwork Studio",
      ja: "漆器・銀細工スタジオ",
    },
    district: "Sittwe",
    location: { lat: 20.1400, lng: 92.9100 },
    description: {
      my: "ရခိုင့်ရိုးရာ ကြေးမောင်းနှင့် ငွေပန်းထိမ်လက်မှုပညာများကို ပြသသည်။",
      en: "Showcases traditional Rakhine lacquerware and silversmithing craftsmanship.",
      ja: "ラカインの伝統的な漆器・銀細工の技術を紹介するスタジオ。",
    },
    photos: [],
    rating: 4.2,
    lastUpdated: "2026-01-25",
    sourceNote: "サンプルデータ — 実在店舗の特定情報ではありません",
  },
];

export function getSpotBySlug(slug: string): Spot | undefined {
  return spots.find((s) => s.slug === slug);
}
