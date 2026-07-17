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
Set env var `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan
`VITE_VAPID_PUBLIC_KEY` di project Vercel (karena `.env` di-gitignore).
`vercel.json` sudah menyiapkan SPA rewrite.

---

## Reminder push (notifikasi saat app ditutup)

Arsitektur: reminder tugas disimpan sebagai `remind_at` (timestamptz) →
pg_cron memanggil Edge Function [`send-reminders`](supabase/functions/send-reminders/index.ts)
tiap menit → function mengirim Web Push ke semua device user via VAPID →
service worker ([`public/push-sw.js`](public/push-sw.js)) menampilkan notifikasi.

### Setup sekali (urut)

1. **Generate VAPID keys** (di PC mana pun):
   ```
   npx web-push generate-vapid-keys
   ```
   - Public key → `.env` frontend: `VITE_VAPID_PUBLIC_KEY=...` (+ di Vercel)
   - Private key → secret function (langkah 3). JANGAN taruh di frontend.

2. **Run ulang [`supabase/schema.sql`](supabase/schema.sql)** di SQL Editor
   (v3 menambah kolom reminder + tabel `push_subscriptions`; ingat: men-DROP
   tabel → data lama hilang).

3. **Deploy Edge Function + secrets** (butuh [Supabase CLI](https://supabase.com/docs/guides/cli), login + link project):
   ```
   supabase functions deploy send-reminders --no-verify-jwt
   supabase secrets set VAPID_PUBLIC_KEY=<public> VAPID_PRIVATE_KEY=<private> \
     VAPID_SUBJECT=mailto:emailmu@gmail.com CRON_SECRET=<string-acak-panjang>
   ```

4. **Aktifkan cron tiap menit**: Dashboard → Database → Extensions →
   aktifkan `pg_cron` dan `pg_net`, lalu di SQL Editor (ganti `<ref>` dan
   `<CRON_SECRET>`):
   ```sql
   select cron.schedule(
     'send-reminders-every-minute',
     '* * * * *',
     $$
     select net.http_post(
       url     := 'https://<ref>.supabase.co/functions/v1/send-reminders',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-cron-secret', '<CRON_SECRET>'
       ),
       body := '{}'::jsonb
     );
     $$
   );
   ```
   (Cek: `select * from cron.job;` · hapus: `select cron.unschedule('send-reminders-every-minute');`)

5. **Di iPhone (iOS 16.4+)**: buka app di Safari → Share → **Add to Home
   Screen** → buka dari Home Screen → menu avatar → Pengaturan → **Aktifkan
   notifikasi reminder** → Allow.

### Menguji
1. Di PWA yang sudah subscribe, buat tugas dengan waktu ~2 menit ke depan dan
   reminder "Saat waktunya".
2. Tutup app sepenuhnya.
3. Maksimal ±1 menit setelah waktunya, notifikasi "Pengingat tugas" muncul.
   Tap → app terbuka di halaman Tasks.

Debug: Dashboard → Edge Functions → send-reminders → Logs; atau panggil
manual dengan `curl -X POST <url> -H "x-cron-secret: <CRON_SECRET>"` dan
lihat respons `{ due, sent, pruned }`.

## Langkah AI berikutnya (opsional)
Buat **Supabase Edge Function** sebagai proxy penyimpan Claude API key (jangan
di frontend). Handler `AIPrompt` tinggal memanggil function itu. Lihat titik
`// TODO: AI integration`.
