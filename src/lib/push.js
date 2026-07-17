import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Web Push plumbing. Reminder notifications with the app closed only work
 * via real push: SW subscription here → stored in `push_subscriptions` →
 * the `send-reminders` Edge Function (cron, every minute) sends the push.
 *
 * iOS quirk: web push requires iOS 16.4+ AND the PWA installed to the home
 * screen; in Safari-tab mode `PushManager` simply doesn't exist.
 */

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

// True when running as an installed PWA (standalone) — how we distinguish
// "iOS needs install first" from "browser just doesn't support push".
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const needsInstallFirst = () => isIOS() && !isStandalone() && !isPushSupported()

// PushManager.subscribe wants the VAPID public key as a Uint8Array.
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/** Current subscription of this browser/device, or null. */
export async function getExistingSubscription() {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

/**
 * Full opt-in flow — MUST be called from a user gesture (button click):
 * permission prompt → pushManager.subscribe → upsert into Supabase.
 * Throws Error with an Indonesian, user-showable message on failure.
 */
export async function enablePush() {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi.')
  if (!VAPID_PUBLIC_KEY) throw new Error('VITE_VAPID_PUBLIC_KEY belum di-set di .env.')
  if (!isPushSupported()) {
    throw new Error(
      needsInstallFirst()
        ? 'Di iPhone, install dulu app ini ke Home Screen (Share → Add to Home Screen), lalu buka dari sana.'
        : 'Browser ini tidak mendukung notifikasi push.',
    )
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak. Aktifkan lewat pengaturan browser/OS.')
  }

  const reg = await navigator.serviceWorker.ready
  const subscription =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }))

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { endpoint: subscription.endpoint, subscription: subscription.toJSON() },
      { onConflict: 'endpoint' },
    )
  if (error) throw new Error(`Gagal menyimpan langganan: ${error.message}`)

  return subscription
}

/** Unsubscribe this device and remove its row server-side. */
export async function disablePush() {
  const sub = await getExistingSubscription()
  if (!sub) return
  if (isSupabaseConfigured) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  }
  await sub.unsubscribe()
}

/** Local test notification through the SW (no backend involved). */
export async function showTestNotification() {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    throw new Error('Aktifkan notifikasi dulu.')
  }
  const reg = await navigator.serviceWorker.ready
  await reg.showNotification('Hub — tes notifikasi', {
    body: 'Kalau kamu melihat ini, notifikasi lokal bekerja. 🎉',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { url: '/tasks' },
  })
}
