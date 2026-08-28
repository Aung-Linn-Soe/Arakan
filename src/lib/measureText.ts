// ラベルの衝突判定(RakhineIllustrationMap)で、ラベル幅を「文字数 × 定数」という
// ラテン文字前提の粗い推定ではなく、実際のフォントで実測するためのユーティリティ。
// ビルマ語などラテン文字と平均字幅が大きく異なるスクリプトでも、過不足なく判定できる。
const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null | undefined;

function getContext(): CanvasRenderingContext2D | null {
  if (ctx !== undefined) return ctx;
  if (typeof document === "undefined") {
    ctx = null;
    return ctx;
  }
  const canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  return ctx;
}

// SSR時やcanvas未対応環境では、従来通りの文字数ベースの粗い推定にフォールバックする。
function fallbackWidth(text: string): number {
  return text.length * 6.5;
}

export function measureTextWidth(text: string, font: string): number {
  const key = `${font}::${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const context = getContext();
  let width: number;
  if (context) {
    context.font = font;
    width = context.measureText(text).width;
  } else {
    width = fallbackWidth(text);
  }
  cache.set(key, width);
  return width;
}
