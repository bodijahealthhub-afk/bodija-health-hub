/* Bodija Health Hub — admin push notification service worker */

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Bodija Health Hub', body: event.data.text() };
    }
  }

  const title = data.title || 'Bodija Health Hub';
  const options = {
    body: data.body || data.message || '',
    icon: '/BHH.png',
    badge: '/BHH.png',
    data: { url: data.url || '/admin' },
    tag: 'bhh-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
      return undefined;
    })
  );
});
