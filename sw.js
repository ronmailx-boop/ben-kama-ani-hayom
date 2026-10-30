// Service worker: keeps AgeNow working offline.
// Pages and app files are network-first, so every deploy reaches users
// on their next online visit; the cache is only the offline fallback.
// Bump CACHE when the precache list changes.
const CACHE = 'agenow-v1';
const FONT_CACHE = 'agenow-fonts-v1';

const PRECACHE = [
  './',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/favicon.png?v=2',
  'icons/apple-touch-icon.png?v=2',
  'icons/icon-192.png?v=2',
  'icons/icon-512.png?v=2',
  'privacy-policy.html',
  'privacy-policy-en.html',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async path => {
      const response = await fetch(path, { cache: 'reload' });
      if (response.ok) await cache.put(path, await unredirect(response));
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [CACHE, FONT_CACHE];
    for (const key of await caches.keys()) {
      if (!keep.includes(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Google Fonts never change at a given URL: cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Other origins (analytics) and the guide videos go straight to the network
  if (url.origin !== self.location.origin || url.pathname.includes('/media/')) return;

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, await unredirect(response.clone()));
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return (await cache.match(prettyToHtml(request.url))) || (await cache.match('./'));
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
  return response;
}

// Cloudflare redirects page.html → /page, and a browser refuses a redirected
// response served from cache for a navigation, so store a plain copy.
async function unredirect(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), {
    status: response.status, statusText: response.statusText, headers: response.headers
  });
}

// /privacy-policy → /privacy-policy.html, / → /index.html
function prettyToHtml(href) {
  const u = new URL(href);
  u.search = '';
  if (u.pathname.endsWith('/')) u.pathname += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(u.pathname)) u.pathname += '.html';
  return u.href;
}
