/* eslint-env serviceworker */
/**
 * Web Push handlers, loaded into the generated Workbox service worker via
 * `workbox.importScripts` (see vite.config.js). Kept separate so we stay on
 * vite-plugin-pwa's generateSW + autoUpdate — no custom SW build needed.
 *
 * Payload sent by supabase/functions/send-reminders:
 *   { "title": "…", "body": "…", "url": "/tasks" }
 */

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Hub'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || undefined, // same tag replaces instead of stacking
      data: { url: data.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // App already open somewhere → focus it and navigate.
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate?.(url)
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})
