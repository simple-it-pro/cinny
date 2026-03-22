/// <reference lib="WebWorker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

async function askForAccessToken(client: Client): Promise<string | undefined> {
  return new Promise((resolve) => {
    const responseKey = Math.random().toString(36);
    const listener = (event: ExtendableMessageEvent) => {
      if (event.data.responseKey !== responseKey) return;
      resolve(event.data.token);
      self.removeEventListener('message', listener);
    };
    self.addEventListener('message', listener);
    client.postMessage({ responseKey, type: 'token' });
  });
}

function fetchConfig(token?: string): RequestInit | undefined {
  if (!token) return undefined;

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'default',
  };
}

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(clients.claim());
});

// Push notification handler
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Simple', {
      body: data.body ?? 'Новое сообщение',
      icon: data.icon ?? '/public/res/android/android-chrome-192x192.png',
      badge: data.badge ?? '/public/res/android/android-chrome-72x72.png',
      data: data.data,
      tag: data.data?.roomId ?? 'simple-notification',
    })
  );
});

// Handle notification click — open the chat
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const roomId = event.notification.data?.roomId;
  const baseUrl = self.registration.scope.replace(/\/$/, '');
  const targetUrl = roomId ? `${baseUrl}/#/room/${roomId}` : `${baseUrl}/`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window and navigate via URL change
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return (client as WindowClient).navigate(targetUrl).then((c) => c?.focus());
        }
      }
      // Open new window with room URL
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { url, method } = event.request;
  if (method !== 'GET') return;
  if (
    !url.includes('/_matrix/client/v1/media/download') &&
    !url.includes('/_matrix/client/v1/media/thumbnail')
  ) {
    return;
  }
  event.respondWith(
    (async (): Promise<Response> => {
      const client = await self.clients.get(event.clientId);
      let token: string | undefined;
      if (client) token = await askForAccessToken(client);

      return fetch(url, fetchConfig(token));
    })()
  );
});
