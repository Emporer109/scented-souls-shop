// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  let data = {
    title: 'Luxury Perfumes',
    body: 'You have a new notification!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Luxury Perfumes', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});
