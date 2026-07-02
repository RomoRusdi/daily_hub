// Initial "starter" content so the app feels alive on first open.
// Everything here is seeded into localStorage once, then owned by the user.
// Dates are computed relative to "now" so nothing ever looks stale.

const pad = (n) => String(n).padStart(2, '0')

/** YYYY-MM-DD for a day offset from today. */
export function dateKey(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const seedTasks = [
  {
    id: uid(),
    title: 'Kirim proposal klien',
    date: dateKey(0),
    time: '09:00',
    priority: 'high', // high | normal
    deadline: true,
    reminder: '10 menit sebelum',
    done: false,
  },
  {
    id: uid(),
    title: 'Review desain onboarding',
    date: dateKey(0),
    time: '11:30',
    priority: 'normal',
    reminder: '',
    done: false,
  },
  {
    id: uid(),
    title: 'Balas email tim',
    date: dateKey(0),
    time: '',
    priority: 'normal',
    reminder: '',
    done: false,
  },
  {
    id: uid(),
    title: 'Siapkan slide all-hands',
    date: dateKey(1),
    time: '14:00',
    priority: 'high',
    reminder: '1 jam sebelum',
    done: false,
  },
  {
    id: uid(),
    title: 'Booking tiket kereta',
    date: dateKey(2),
    time: '',
    priority: 'normal',
    reminder: '',
    done: false,
  },
  {
    id: uid(),
    title: 'Standup pagi',
    date: dateKey(0),
    time: '08:30',
    priority: 'normal',
    reminder: '',
    done: true,
  },
  {
    id: uid(),
    title: 'Bayar tagihan internet',
    date: dateKey(-1),
    time: '',
    priority: 'normal',
    reminder: '',
    done: true,
  },
]

export const seedEvents = [
  {
    id: uid(),
    title: 'Standup pagi',
    date: dateKey(0),
    time: '09:00',
    duration: '30 mnt',
    location: 'Google Meet',
    accent: false,
  },
  {
    id: uid(),
    title: 'Sync produk Q3',
    date: dateKey(0),
    time: '14:00',
    duration: '1 jam',
    location: 'Ruang Meeting 2',
    accent: true,
  },
  {
    id: uid(),
    title: 'Panggilan klien',
    date: dateKey(0),
    time: '17:30',
    duration: '45 mnt',
    location: 'Zoom · Prioritas tinggi',
    accent: true,
  },
  {
    id: uid(),
    title: 'Konsultasi dokter gigi',
    date: dateKey(3),
    time: '16:00',
    duration: '1 jam',
    location: 'Klinik Sehat',
    accent: false,
  },
  {
    id: uid(),
    title: 'Nonton bareng',
    date: dateKey(6),
    time: '19:00',
    duration: '2 jam',
    location: 'CGV',
    accent: false,
  },
]

export const seedNotes = [
  {
    id: uid(),
    title: 'Ide fitur AI',
    body: 'Asisten bisa menyusun to-do langsung dari email masuk dan otomatis memblok waktu di kalender.\n\nPrioritas eksplorasi:\n• Ringkasan harian tiap pagi\n• Deteksi deadline dari teks\n• Saran waktu fokus berdasarkan pola\n\nNada harus tetap tenang — jangan terlalu banyak notifikasi.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: uid(),
    title: 'Belanja mingguan',
    body: 'Kopi, oat, telur, sayur, deterjen, buah, susu, roti gandum.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: uid(),
    title: 'Catatan rapat',
    body: 'Prioritas Q3: retensi, onboarding baru, integrasi kalender. Target rilis akhir bulan.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: uid(),
    title: 'Buku untuk dibaca',
    body: 'Deep Work, Atomic Habits, The Design of Everyday Things, The Almanack of Naval Ravikant.',
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
]

export { uid }
