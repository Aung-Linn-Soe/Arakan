// Googleの住所表記は "4VPM+GVR, Sittwe, Myanmar (Burma)" のように、Plus Code
// (緯度経度から作られる暗号っぽい記号)が先頭、または住所の途中に混ざることが多い。
// 正式な番地が無い地域(ラカイン州の大半)でよく出るが、一般利用者には読みにくく
// 意味も分からないため、表示用の住所からは(位置を問わず)取り除く。
const PLUS_CODE = /[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\s*,?\s*/gi;

export function stripPlusCode(address: string): string {
  return address
    .replace(PLUS_CODE, "")
    .replace(/^\s*,\s*/, "") // 除去した結果、先頭に余ったカンマがあれば消す
    .trim();
}
