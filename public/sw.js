// ラカイン州カタログアプリ用 Service Worker
//
// 目的:
// 1. OpenStreetMapの地図タイルをキャッシュし、通信が不安定な地域でも
//    一度表示したエリアを再表示できるようにする(Cache First)
// 2. 一度閲覧したページ・静的アセットをオフラインで再閲覧できるようにする
//    (Stale While Revalidate)
//
// 注: Next.js 16はTurbopackが既定になり、next-pwa等のwebpack専用プラグインが
// 使えないため、素のService Workerとして実装している。

const TILE_CACHE = "rakhine-tiles-v1";
const RUNTIME_CACHE = "rakhine-runtime-v1";
const MAX_TILE_ENTRIES = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function isTileRequest(url) {
  return url.hostname.endsWith("tile.openstreetmap.org");
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Cache APIのkeys()順は仕様上保証されないが、実用上は挿入順に近いため簡易LRUとして扱う
    await cache.delete(keys[0]);
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // クロスオリジンのタイル画像はopaque(status 0)になるため、200と併せて許可する
    if (response && (response.status === 200 || response.type === "opaque")) {
      cache.put(request, response.clone());
      trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await networkPromise) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isTileRequest(url)) {
    event.respondWith(cacheFirst(request, TILE_CACHE, MAX_TILE_ENTRIES));
    return;
  }

  if (url.origin === self.location.origin) {
    const isAppShell =
      request.mode === "navigate" ||
      url.pathname.startsWith("/_next/static/") ||
      request.destination === "style" ||
      request.destination === "script";

    if (isAppShell) {
      event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
  }
});
