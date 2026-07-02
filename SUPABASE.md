# Supabase — login username + password (tanpa email)

Hub berjalan **tanpa** Supabase (mode lokal / localStorage). Dengan Supabase,
setiap user punya **akun + data privat sendiri** (RLS), bisa diakses lintas
device. Login pakai **username + password** — tidak ada email sungguhan.

## 1. Buat project & jalankan skema
1. <https://supabase.com> → **New project**.
2. **SQL Editor** → **New query** → tempel isi
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. (Membuat tabel dengan
   `user_id` + RLS per-user + realtime. Script otomatis `drop table` dulu —
   hanya data dummy yang hilang.)

## 2. ⚠️ Matikan konfirmasi email (WAJIB)
Karena pakai username (email palsu `username@hub.local`), verifikasi email
harus dimatikan supaya pendaftaran langsung jadi:

**Authentication → Providers → Email** → matikan **"Confirm email"** → Save.

(Kalau lupa, daftar akan "menggantung" menunggu email yang tidak pernah datang.)

## 3. Isi .env
1. **Project Settings → API** → salin **Project URL** dan **anon public key**.
2. Salin `.env.example` → `.env`, isi kedua nilai, lalu **restart** `npm run dev`.

`.env` sudah masuk `.gitignore`.

## 4. Coba
`npm run dev` → muncul layar login. **Daftar** dengan username + password
(min 6 karakter) → langsung masuk. Data dummy otomatis dibuat di akunmu. Login
dengan username yang sama di HP → data-nya sama, tersinkron realtime.

---

## Cara kerjanya
- **Auth**: [`src/store/AuthContext.jsx`](src/store/AuthContext.jsx) memetakan
  username ke `username@hub.local` lalu memakai Supabase Auth (password di-hash
  Supabase). Data display "username" diambil kembali dengan membuang domainnya.
- **Hybrid + per-user**: [`src/store/useCollection.js`](src/store/useCollection.js)
  cache di localStorage (paint instan/offline) + Supabase difilter `user_id`.
  Optimistic update + realtime.
- **Tanpa kredensial** → app otomatis mode lokal (localStorage, tanpa login).
- Keamanan: RLS `auth.uid() = user_id` → user hanya bisa akses datanya sendiri.
  Anon key aman di frontend karena dibatasi RLS.

## Deploy (Vercel)
Set env var `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` di project Vercel
(karena `.env` di-gitignore). `vercel.json` sudah menyiapkan SPA rewrite.

## Langkah AI berikutnya (opsional)
Buat **Supabase Edge Function** sebagai proxy penyimpan Claude API key (jangan
di frontend). Handler `AIPrompt` tinggal memanggil function itu. Lihat titik
`// TODO: AI integration`.
