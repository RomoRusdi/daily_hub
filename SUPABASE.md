# Menghubungkan Hub ke Supabase (tanpa login)

Hub berjalan **tanpa** Supabase (mode lokal / localStorage). Dengan Supabase,
semua device kamu berbagi **satu dataset yang sama** — tanpa login.

> ⚠️ **Tanpa auth = data tidak rahasia.** Siapa pun yang tahu Project URL +
> anon key (yang ikut ter-bundle di frontend) bisa baca/tulis data ini. Oke
> untuk app pribadi; jangan taruh hal sensitif. Kalau nanti mau privat, kita
> bisa tambah PIN gate atau login.

## 1. Buat project Supabase
1. Masuk ke <https://supabase.com> → **New project**.
2. Beri nama (mis. `hub`), pilih region terdekat.
3. Tunggu selesai (~1 menit).

## 2. Jalankan skema database
1. Buka **SQL Editor** → **New query**.
2. Salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Ini membuat tabel `tasks`, `events`, `notes` dengan RLS permissif (boleh
   diakses anon key) + realtime.

## 3. Isi .env
1. **Project Settings → API** → salin **Project URL** dan **anon public key**.
2. Salin `.env.example` → `.env`, isi:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. **Restart** `npm run dev` (Vite baca .env saat start).

`.env` sudah masuk `.gitignore`.

## 4. Coba
`npm run dev` → langsung masuk app (tanpa layar login). Data awal (dummy)
otomatis dibuat sekali di database saat tabel masih kosong. Buka dari HP →
data-nya sama, dan perubahan tersinkron realtime.

---

## Cara kerjanya

- **Hybrid**: [`src/store/useCollection.js`](src/store/useCollection.js) menyimpan
  cache di localStorage (paint instan + baca offline) dan menyinkronkan ke
  Supabase. Perubahan bersifat *optimistic* (langsung tampil, lalu dikirim).
- **Tanpa kredensial** → `isSupabaseConfigured` false → app otomatis mode lokal.
- [`src/store/DataContext.jsx`](src/store/DataContext.jsx) punya API yang sama
  (`addTask`, dst.), jadi halaman tidak berubah.

## Kalau mau privat lagi
Dua opsi ringkas kalau nanti berubah pikiran:
- **PIN gate** di frontend (paling ringan; bukan keamanan kuat).
- **Login** (email magic link / Google) + RLS `auth.uid() = user_id` — cara
  paling benar. Tinggal kabari, tidak lama untuk dipasang lagi.

## Langkah AI berikutnya (opsional)
Untuk fitur AI, buat **Supabase Edge Function** sebagai proxy yang menyimpan
Claude API key di server (jangan di frontend). Handler `AIPrompt` tinggal
memanggil function itu. Lihat titik `// TODO: AI integration`.
