# Hub — Daily Command Center (PWA)

Aplikasi asisten harian pribadi. Minimalis, monokrom, mobile-first, dan
_installable_ sebagai PWA. Semua data disimpan lokal di `localStorage` (belum
ada backend). Halaman utama sudah menyediakan kotak input asisten AI (UI saja)
sebagai tempat integrasi AI nanti.

## Menjalankan

```bash
npm install      # sekali saja
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke /dist
npm run preview  # pratinjau hasil build (service worker aktif)
```

> Ikon PWA dibuat oleh `scripts/gen-icons.mjs` (sudah dijalankan). Jalankan
> ulang bila ingin mengubah mark: `node scripts/gen-icons.mjs`.

## Tech stack

- **Vite + React** (JavaScript)
- **Tailwind CSS** — token warna monokrom di `tailwind.config.js`, `darkMode: 'class'`
- **react-router-dom** — navigasi 4 tab + editor catatan
- **lucide-react** — ikon garis tipis
- **vite-plugin-pwa** — manifest, service worker, installable

## Struktur

```
src/
  components/   Button, Card, Checkbox, Modal, BottomNav, Header,
                FloatingActionButton, EmptyState, ProgressBar, ProgressRing,
                ThemeToggle, TaskRow, AIPrompt, Toast, Field,
                AddTaskModal, AddEventModal
  pages/        Home, Tasks, Calendar, Notes, NoteEditor
  hooks/        useLocalStorage, useTheme
  store/        DataContext  (state bersama tasks/events/notes → localStorage)
  data/         seed.js      (data dummy awal, tanggal relatif ke hari ini)
  utils/        date.js      (format tanggal lokal id-ID)
  App.jsx, main.jsx, index.css
public/         favicon.svg, pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png
```

## Fitur

- **Home** — kotak AI, ring progres harian, tugas hari ini (checkbox sinkron
  dengan halaman Tasks), jadwal berikutnya, dan quick note.
- **Tasks** — dikelompokkan Hari Ini / Mendatang / Selesai, tambah lewat
  bottom sheet, prioritas, hapus, empty state.
- **Calendar** — grid bulanan dengan penanda titik, klik tanggal → daftar
  acara, navigasi bulan, tambah acara.
- **Notes** — grid kartu, editor fokus dengan **auto-save** (debounce 500ms).
- **Dark mode** — toggle tersimpan; default mengikuti sistem.

## Menyimpan / mereset data

Data tersimpan di `localStorage` dengan kunci `hub:tasks`, `hub:events`,
`hub:notes`, `hub:theme`. Kosongkan _site data_ browser untuk memuat ulang
data dummy.

## 📌 Yang perlu diisi nanti untuk fitur AI

Semua titik integrasi diberi tanda `// TODO: AI integration`.

1. **`src/components/AIPrompt.jsx`** — handler `handleSubmit()` saat ini hanya
   `console.log` + toast. Ganti dengan pemanggilan ke endpoint asisten
   (mis. Claude API via server proxy) dan tampilkan/stream responsnya.
2. Pertimbangkan menambah halaman/panel percakapan, dan beri AI akses ke
   `useData()` agar bisa membaca/membuat tugas, acara, dan catatan.
3. Karena kunci API tidak boleh di frontend, tambahkan backend tipis (mis.
   serverless function) sebagai proxy saat fitur AI diaktifkan.
