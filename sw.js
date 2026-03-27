// Pulso · Service Worker v1
// Mantiene el rastreo GPS activo en segundo plano

const CACHE_NAME = 'pulso-v1';
const OFFLINE_ASSETS = [
  '/tracker.html',
  '/index.html',
  '/manifest.json'
];

// ── INSTALL: cachear assets esenciales ──
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
});

// ── ACTIVATE: limpiar caches viejos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first para assets propios, network para Firebase ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase y CDNs: siempre network
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('openstreetmap.org')
  ) {
    return; // dejar pasar sin interceptar
  }

  // Assets propios: cache-first con fallback a network
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/tracker.html');
      }
    })
  );
});

// ── BACKGROUND SYNC: enviar cola offline cuando vuelve la conexion ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-positions') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  // El SW notifica a los clientes para que hagan el flush
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type: 'FLUSH_QUEUE' });
  });
}

// ── PUSH: notificaciones si se pierde señal (futuro) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Pulso', {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'pulso-alert',
    renotify: true,
    data: { url: '/tracker.html' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow('/tracker.html');
    })
  );
});

// ── KEEP ALIVE: ping cada 20s para que el SW no se duerma ──
self.addEventListener('message', event => {
  if (event.data?.type === 'KEEP_ALIVE') {
    // Responder para confirmar que el SW sigue activo
    event.source?.postMessage({ type: 'SW_ALIVE', ts: Date.now() });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
