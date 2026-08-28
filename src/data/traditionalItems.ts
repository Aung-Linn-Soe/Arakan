import { LocalizedText } from "@/types/spot";

// Traditionalタブ(旧Craft)で紹介する、ラカインの伝統的なもの(衣装・工芸・芸能など)。
// 沖縄の三線のような「地域を象徴する伝統的な物」の紹介を意図している。
// Google Places(工房・お店の検索)ではなく、Wikipedia/Wikimedia Commonsで実在を
// 確認できたものだけを掲載する(工房・お店のサンプルデータは廃止済み。下記tr4/tr5参照)。
export type TraditionalItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  // 実写真が確認できないものはundefinedのままにし、プレースホルダー表示にフォールバックする
  // (誤った写真を出すより正直な表示を優先する方針。仕様書§7参照)。
  photoUrl?: string;
  sourceUrl?: string;
  sourceNote: string;
};

export const traditionalItems: TraditionalItem[] = [
  {
    id: "tr1",
    name: {
      my: "ရခိုင် ရိုးရာ ပုဆိုး",
      en: "Arakanese Longyi",
      ja: "ラカインの伝統織物(ロンジー)",
    },
    description: {
      my: "ရခိုင်ဒေသ၏ ထူးခြားသော အရောင်အသွေးနှင့် ပုံစံများပါဝင်သည့် ရိုးရာဝတ်ရုံအထည်(ပုဆိုး)။ လက်ရက်အထည်လုပ်ငန်းသည် ရခိုင်ယဉ်ကျေးမှု၏ တစ်စိတ်တစ်ပိုင်းအဖြစ် ယနေ့တိုင် ရှင်သန်နေဆဲဖြစ်ပြီး၊ ဤကဲ့သို့သော အထည်များကို မြန်မာနိုင်ငံအနှံ့ ဈေးများတွင် တွေ့နိုင်သည်။",
      en: "A traditional wrap-skirt (longyi) featuring distinctive Rakhine patterns and colors. Handweaving remains a living part of Rakhine culture, and cloth like this is still sold in markets across Myanmar today.",
      ja: "ラカイン地方独特の色柄が特徴の伝統的な巻き布(ロンジー)。手織りの技術は今もラカイン文化の一部として受け継がれ、こうした柄の布はミャンマー各地の市場で現在も売られている。",
    },
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Arakanese_longyi.png/500px-Arakanese_longyi.png",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Arakanese_longyi.png",
    sourceNote:
      "Wikimedia Commons掲載の実写真(ヤンゴンのボージョーアウンサン市場で撮影)。実在するラカイン柄の織物。",
  },
  {
    id: "tr2",
    name: {
      my: "ရခိုင် ရိုးရာ သင်္ကြန်ဝတ်စုံ",
      en: "Rakhine Festival Costume",
      ja: "ラカインの祭礼衣装(水かけ祭り)",
    },
    description: {
      my: "သင်္ကြန်ပွဲတော်တွင် ရခိုင်လူမျိုးများ ဝတ်ဆင်လေ့ရှိသော ရိုးရာဝတ်စုံ။ ရွှေရောင်၊ လိမ္မော်ရောင် အထည်များနှင့် ရိုးရာလက်ဝတ်ရတနာများကို ပွဲတော်များတွင် တွေ့မြင်ရလေ့ရှိသည်။",
      en: "Traditional dress worn by Rakhine people during Thingyan, the Burmese New Year water festival, often in gold and orange tones with traditional jewelry.",
      ja: "ミャンマーの正月にあたる水かけ祭り「ティンジャン」の際に、ラカインの人々が着る伝統衣装。金色やオレンジ色の布に伝統的な装身具を合わせるのが特徴。",
    },
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Rakhine_water_festival_cox_bazar.png/500px-Rakhine_water_festival_cox_bazar.png",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rakhine_water_festival_cox_bazar.png",
    sourceNote:
      "Wikimedia Commons掲載の実写真。撮影地はラカイン州内ではなく、ラカイン系コミュニティが暮らすバングラデシュ・コックスバザール。",
  },
  {
    id: "tr3",
    name: {
      my: "ရခိုင် ရိုးရာ စည်တီး ပညာ",
      en: "Rakhine Traditional Drums",
      ja: "ラカインの伝統太鼓",
    },
    description: {
      my: "ရခိုင်ရိုးရာပွဲလမ်းများ၊ အထူးသဖြင့် သင်္ကြန်ပွဲတော်တွင် တီးမှုတ်လေ့ရှိသော ရိုးရာစည်များ။ ရိုးရာဝတ်စုံဆင်ပြီး အဖွဲ့လိုက် စည်တီးလေ့ရှိသည်။",
      en: "Traditional drums played at Rakhine festivals, especially Thingyan, typically performed by groups dressed in traditional costume.",
      ja: "ラカインの祭礼、特に水かけ祭り「ティンジャン」で演奏される伝統的な太鼓。伝統衣装を着た演奏者グループによって披露されることが多い。",
    },
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rakhine_drummers_at_Thingyan%2C_New_York_City.jpg/500px-Rakhine_drummers_at_Thingyan%2C_New_York_City.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rakhine_drummers_at_Thingyan,_New_York_City.jpg",
    sourceNote:
      "Wikimedia Commons掲載の実写真。撮影地はラカイン州内ではなく、ラカイン系コミュニティによる海外(ニューヨーク)でのThingyan祭り。",
  },
  {
    // 旧 spots.ts s12(機織り工房、"craft"カテゴリー廃止に伴い移植)。
    // 「工房を探す」ではなく「手織り技術そのもの」の紹介として、実写真付きで再構成。
    id: "tr4",
    name: {
      my: "ရခိုင် ရိုးရာ ယက်လက်မှု",
      en: "Rakhine Handloom Weaving",
      ja: "ラカインの手織り技術",
    },
    description: {
      my: "ရခိုင်ရိုးရာ အထည်ယက်နည်းကို လက်ဆင့်ကမ်းထားသော လက်မှုပညာ။ အမျိုးသမီးများက ရိုးရာပုံစံများကို လက်ဖြင့် ယက်ကြသည်။",
      en: "The handloom weaving craft that produces the patterned cloth used in the Arakanese longyi. Passed down through generations of Rakhine women, it remains a living tradition today.",
      ja: "ラカイン柄の織物(ロンジー)を生み出す手織りの技術。世代を超えて受け継がれてきた、女性たちが担う伝統工芸。",
    },
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Rakhaine_Handloom_Weaver.jpg/500px-Rakhaine_Handloom_Weaver.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rakhaine_Handloom_Weaver.jpg",
    sourceNote:
      "Wikimedia Commons掲載の実写真。撮影地はラカイン州内ではなく、ラカイン系コミュニティが暮らすバングラデシュ・クアカタ(Kuakata)。",
  },
  {
    // 旧 spots.ts s13(漆器・銀細工工房、"craft"カテゴリー廃止に伴い移植)。
    // ラカイン州に限定した実写真がWikimedia Commonsで確認できなかったため、
    // 誤った写真を出すより正直な表示を優先し、写真無し(プレースホルダー表示)で掲載する。
    id: "tr5",
    name: {
      my: "ရခိုင် ရိုးရာ ကြေးမောင်း၊ ငွေပန်းထိမ် လက်မှုပညာ",
      en: "Rakhine Lacquerware & Silverwork",
      ja: "ラカインの漆器・銀細工",
    },
    description: {
      my: "ရခိုင့်ရိုးရာ ကြေးမောင်းနှင့် ငွေပန်းထိမ်လက်မှုပညာများ။ မြန်မာ့ရိုးရာလက်မှုပညာအနက် ရခိုင်ဒေသတွင် ကျန်ရှိနေသေးသော နည်းပညာများဖြစ်သည်။",
      en: "Traditional Rakhine lacquerware and silversmithing crafts, part of Myanmar's broader lacquerware and silverwork traditions that are still practiced in the region.",
      ja: "ラカイン地方に伝わる漆器・銀細工の伝統工芸。ミャンマー各地に広がる漆器・銀細工文化の一部として、この地域でも受け継がれている。",
    },
    sourceNote:
      "実在が広く知られる伝統工芸だが、ラカイン州内で撮影された確認済みの実写真をWikimedia Commonsで見つけられなかったため、写真は未掲載(プレースホルダー表示)。確認済みの直リンク可能な画像URLが判明次第追加予定。",
  },
];
