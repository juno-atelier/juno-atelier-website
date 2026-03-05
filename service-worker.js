/* ═══════════════════════════════════════════════════════════════════════════
   service-worker.js — Juno Atelier
   ─────────────────────────────────────────────────────────────────────────
   Strategy: Cache-First for assets, Network-First for HTML pages.
   Falls back to offline.html when a navigation request fails completely.

   HOW IT WORKS:
   1. INSTALL  — pre-caches all core pages, CSS, JS, and the offline page.
   2. ACTIVATE — clears old caches from previous SW versions.
   3. FETCH    — intercepts every request:
                 • HTML pages  → try network first, fall back to cache,
                                 fall back to offline.html.
                 • CSS/JS/img  → try cache first, then network.
                 • External    → pass through (Google Fonts, Maps, etc.)
═══════════════════════════════════════════════════════════════════════════ */

const CACHE_NAME    = 'juno-atelier-v1';
const OFFLINE_URL   = '/offline.html';

// ── Core files to pre-cache on install ──────────────────────────────────────
// Add any additional assets your site needs (images, fonts, etc.)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/work.html',
  '/contact.html',
  '/brand-audit.html',
  '/404.html',
  '/offline.html',

  // Stylesheets
  '/css/styles.css',
  '/css/navbar.css',
  '/css/sections.css',
  '/css/about.css',
  '/css/services.css',
  '/css/responsive.css',
  '/css/fab.css',
  '/css/contact.css',
  '/css/brand-audit.css',
  '/css/portfolio.css',

  // Scripts
  '/js/component.js',
  '/js/main.js',
  '/js/contact.js',

  // Core brand images — add others as needed
  '/assets/images/favicon.svg',
  '/assets/images/JA arts.svg',
  '/assets/images/JA Apple.svg',
];

// ── INSTALL — pre-cache core files ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Activate immediately, don't wait
  );
});

// ── ACTIVATE — delete stale caches from old SW versions ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)  // keep only current cache
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// ── FETCH — intercept all network requests ───────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url         = new URL(request.url);

  // ── 1. Skip non-GET requests (POST forms, analytics pings, etc.) ────────────
  if (request.method !== 'GET') return;

  // ── 2. Skip cross-origin requests (Google Fonts, Maps embeds, CDNs) ─────────
  //       These are handled by the browser's normal cache / network logic.
  if (url.origin !== location.origin) return;

  // ── 3. HTML navigation requests — Network First ──────────────────────────────
  //       Try the network. If it fails, serve the cached version.
  //       If no cache exists, serve offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Got a fresh response — clone it into cache before returning
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return networkResponse;
        })
        .catch(async () => {
          // Network failed — try the cache
          const cached = await caches.match(request);
          if (cached) return cached;

          // Nothing in cache either — serve offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response(
            '<h1>You are offline</h1><p>Please check your connection.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // ── 4. Static assets (CSS, JS, images) — Cache First ────────────────────────
  //       Serve from cache instantly if available.
  //       If not cached yet, fetch from network and add to cache.
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;

        // Not in cache — fetch and cache for next time
        return fetch(request)
          .then(networkResponse => {
            // Only cache successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
            return networkResponse;
          })
          .catch(() => {
            // Asset fetch failed and not cached — return nothing gracefully
            // (the browser will handle the missing asset visually)
          });
      })
  );
});