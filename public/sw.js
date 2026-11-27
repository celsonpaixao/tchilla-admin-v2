/* Tchilla Admin — service worker único (PWA + Firebase Cloud Messaging).
 *
 * Só pode existir um service worker no scope "/", por isso o push do Firebase
 * vive aqui também. Registado por src/lib/pwa.ts.
 *
 * Estratégia de cache (painel com dados sensíveis e em tempo real):
 *   - Páginas, RSC, Server Actions e /api → SEMPRE rede, nunca em cache.
 *     Sem rede numa navegação → /offline.html.
 *   - /_next/static (ficheiros com hash, imutáveis) → cache-first.
 *   - /assets, /icons e Google Fonts → stale-while-revalidate.
 *
 * Mudou a lógica deste ficheiro? Suba VERSION para limpar as caches antigas.
 */

const VERSION = "v1";
const STATIC_CACHE = `tchilla-static-${VERSION}`;
const RUNTIME_CACHE = `tchilla-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png"];

const STATIC_MAX_ENTRIES = 400;
const RUNTIME_MAX_ENTRIES = 80;

// Em dev os chunks do Next não têm hash: não cachear para não quebrar o HMR.
const IS_DEV = ["localhost", "127.0.0.1"].includes(self.location.hostname);

/* ─── Firebase Cloud Messaging ──────────────────────────────────────────── */

try {
  importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

  // Config hardcoded — SWs não têm acesso a process.env
  firebase.initializeApp({
    apiKey: "AIzaSyDheF9baAGJE8BBNKaCRoFs537nxLjvIsw",
    authDomain: "tchilla-hmg.firebaseapp.com",
    databaseURL: "https://tchilla-hmg-default-rtdb.firebaseio.com",
    projectId: "tchilla-hmg",
    storageBucket: "tchilla-hmg.firebasestorage.app",
    messagingSenderId: "879571708226",
    appId: "1:879571708226:web:6a4c958392e7a202dec0db",
  });

  const messaging = firebase.messaging();

  // Recebe push quando a app está em background ou fechada
  messaging.onBackgroundMessage((payload) => {
    const { title, body, icon } = payload.notification ?? {};
    self.registration.showNotification(title ?? "Tchilla Admin", {
      body: body ?? "",
      icon: icon ?? "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload.data,
      tag: payload.data?.reservaId ?? "tchilla-notif",
      renotify: true,
    });
  });
} catch (err) {
  // Sem Firebase (offline na 1.ª carga, gstatic bloqueado…) a PWA continua a funcionar.
  console.warn("[SW] Firebase Messaging indisponível", err);
}

// Clique numa notificação → foca a app (ou abre-a) na página certa.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data ?? {};

  // ROUTES.RESERVAS.DETALHE(id) — o SW não importa constantes do app.
  let path = data.url ?? data.link ?? (data.reservaId ? `/reservas/${data.reservaId}` : "/");
  let target = new URL(path, self.location.origin);
  if (target.origin !== self.location.origin) target = new URL("/", self.location.origin);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const client = windows.find((c) => new URL(c.url).origin === self.location.origin);
      if (client) {
        await client.focus();
        if (path !== "/" && "navigate" in client) await client.navigate(target.href);
        return;
      }
      await self.clients.openWindow(target.href);
    })()
  );
});

/* ─── Ciclo de vida ─────────────────────────────────────────────────────── */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC_CACHE, RUNTIME_CACHE];
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("tchilla-") && !keep.includes(n)).map((n) => caches.delete(n))
      );
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

/* ─── Fetch ─────────────────────────────────────────────────────────────── */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkWithOfflineFallback(event));
    return;
  }

  if (IS_DEV) return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE, STATIC_MAX_ENTRIES));
    } else if (/^\/(assets|icons)\//.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(event, RUNTIME_CACHE, RUNTIME_MAX_ENTRIES));
    }
    // Tudo o resto (RSC, /api, /_next/image, /sounds…) segue direto para a rede.
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(event, RUNTIME_CACHE, RUNTIME_MAX_ENTRIES));
  }
});

async function networkWithOfflineFallback(event) {
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;
    return await fetch(event.request);
  } catch {
    return (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await putInCache(cacheName, request, response.clone(), maxEntries);
  return response;
}

async function staleWhileRevalidate(event, cacheName, maxEntries) {
  const { request } = event;
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      // Respostas "opaque" (CSS de fontes cross-origin) têm status 0 mas são válidas.
      if (response.ok || response.type === "opaque") {
        await putInCache(cacheName, request, response.clone(), maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) ?? Response.error();
}

async function putInCache(cacheName, request, response, maxEntries) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  // Remove as entradas mais antigas (ordem de inserção) acima do limite.
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((k) => cache.delete(k)));
}
