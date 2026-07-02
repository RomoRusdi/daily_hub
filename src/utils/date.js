// Small date helpers shared across pages. Locale is Indonesian ('id-ID').

const pad = (n) => String(n).padStart(2, '0')

/** YYYY-MM-DD for a Date object. */
export function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey() {
  return toKey(new Date())
}

/** e.g. "Kamis, 2 Juli 2026" */
export function longDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Header style, no year: "Rabu, 2 Juli" */
export function headerDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "Kamis, 3 Juli" from a YYYY-MM-DD key. */
export function weekdayDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "2 Juli 2026 · 09:12" from an epoch ms timestamp (note editor meta). */
export function fullDateTime(ts) {
  const d = new Date(ts)
  const date = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${date} · ${time}`
}

/** Human greeting based on the current hour. */
export function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
}

/** "2 Jul" style short label from a YYYY-MM-DD key. */
export function shortDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

/** Friendly relative label for a date key: "Hari ini" / "Besok" / short date. */
export function relativeDay(key) {
  const t = todayKey()
  if (key === t) return 'Hari ini'
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (key === toKey(tomorrow)) return 'Besok'
  return shortDate(key)
}

/** "3 jam lalu" style label from an epoch ms timestamp. */
export function timeAgo(ts) {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Baru saja'
  if (min < 60) return `${min} menit lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} hari lalu`
  return shortDate(toKey(new Date(ts)))
}

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const WEEKDAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
