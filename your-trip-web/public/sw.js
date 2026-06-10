const CACHE_VERSION = "yourtrip-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [OFFLINE_URL, "/manifest.webmanifest", "/icon.svg", "/icon-192.png"];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate — purge old caches ───────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const current = new Set([STATIC_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !current.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch strategies ──────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept POST / non-GET, auth routes, or API calls
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/auth/")) return;

  // Cache-first: Next.js static assets (hashed filenames — safe to cache forever)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Stale-while-revalidate: external images (Cloudinary, Unsplash, Google)
  if (
    url.hostname === "res.cloudinary.com" ||
    url.hostname === "images.unsplash.com" ||
    url.hostname === "lh3.googleusercontent.com"
  ) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, 200));
    return;
  }

  // Network-first: navigation (HTML pages) — fresh content, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }
});

// ─── Strategy helpers ──────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cache, maxEntries);
    }
    return response;
  }).catch(() => null);

  return cached ?? (await fetchPromise) ?? Response.error();
}

async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(OFFLINE_URL);
    return cached ?? Response.error();
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  }
}
