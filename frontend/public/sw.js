// Braida Beauty Marketplace Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = 'braida-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install service worker and cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler with network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Return cached version on network failure
        return caches.match(event.request);
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Braida',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || data.message,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'braida-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Braida', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  // Determine URL based on notification data
  if (data.bookingId) {
    url = `/bookings/${data.bookingId}`;
  } else if (data.disputeId) {
    url = `/disputes/${data.disputeId}`;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's an open window
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window if none exists
      return clients.openWindow(url);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Track notification dismissals if needed
  console.log('Notification closed:', event.notification.tag);
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // Implement syncing of offline actions when connection is restored
  console.log('Syncing pending actions...');
}

