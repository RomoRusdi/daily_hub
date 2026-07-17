// Supabase Edge Function: ai-assistant (Google Gemini, free tier)
//
// Proxy aman ke API Gemini untuk hero prompt di Home. API key hanya hidup di
// sini (secret function) — tidak pernah menyentuh frontend.
//
// Alur: frontend mengirim { prompt, context } (context = tanggal hari ini +
// ringkasan tugas/acara milik user) → Gemini mem-parse niatnya (function
// calling) → merespons { reply, actions } → frontend mengeksekusi actions
// lewat DataContext biasa, jadi RLS & kepemilikan data tetap berlaku.
//
// Setup:
//   1. API key gratis (tanpa kartu kredit): https://aistudio.google.com
//   2. supabase secrets set GEMINI_API_KEY=...
//   3. supabase functions deploy ai-assistant   (verify_jwt AKTIF — hanya
//      user login yang bisa memanggil; supabase.functions.invoke otomatis
//      menyertakan token sesi.)

// Dicoba berurutan: model berversi bisa ditutup untuk pengguna baru, dan
// free tier sering kena "high demand" — kalau satu gagal karena kapasitas/
// kuota, coba model berikutnya yang biasanya lebih longgar.
const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash',
]
const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

// Browser memanggil lintas origin → wajib jawab preflight + header CORS.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM = `Kamu adalah asisten dari "Hub", aplikasi daily command center pribadi (tugas, kalender, catatan). Bahasa utama: Indonesia, santai tapi jelas.

Tugasmu:
1. Kalau user meminta membuat tugas/acara/catatan (bisa lebih dari satu sekaligus), panggil function yang sesuai — sekali per item. Pahami tanggal relatif ("besok", "Jumat depan", "lusa") berdasarkan konteks waktu yang diberikan. Tulis judul singkat dan rapi.
2. Kalau user bertanya tentang jadwal/tugasnya, jawab dari konteks data yang diberikan.
3. Selain itu, jawab singkat dan membantu.

Aturan function:
- create_task: reminder_minutes hanya boleh diisi kalau ada jam (time). Kalau user minta diingatkan tapi tidak sebut offset, pakai 10. priority "high" hanya kalau user menyiratkan penting/urgent/deadline.
- Tanggal selalu format YYYY-MM-DD, jam format HH:MM (24 jam), string kosong "" kalau tidak ada jam.
- Jangan mengarang data yang tidak diminta. Kalau informasi kurang (mis. tanggal tidak jelas), tanyakan dulu, jangan menebak.

Setelah memanggil function, sertakan juga satu kalimat konfirmasi ramah tentang apa yang dibuat.`

const functionDeclarations = [
  {
    name: 'create_task',
    description: 'Buat satu tugas (to-do) baru. Panggil sekali untuk tiap tugas yang diminta user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Judul tugas, singkat' },
        date: { type: 'STRING', description: 'YYYY-MM-DD' },
        time: { type: 'STRING', description: 'HH:MM 24 jam, atau "" jika tanpa jam' },
        priority: { type: 'STRING', enum: ['normal', 'high'] },
        reminder_minutes: {
          type: 'INTEGER',
          nullable: true,
          description:
            'Menit sebelum waktu tugas untuk notifikasi (0/10/30/60/1440). Hilangkan/null jika tanpa reminder atau time kosong.',
        },
      },
      required: ['title', 'date'],
    },
  },
  {
    name: 'create_event',
    description: 'Buat satu acara kalender baru. Panggil sekali untuk tiap acara yang diminta user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        date: { type: 'STRING', description: 'YYYY-MM-DD' },
        time: { type: 'STRING', description: 'HH:MM 24 jam, atau "" jika tidak disebut' },
        duration: { type: 'STRING', description: 'mis. "1 jam" / "30 mnt", "" jika tidak disebut' },
        location: { type: 'STRING', description: 'Lokasi/link, "" jika tidak disebut' },
      },
      required: ['title', 'date'],
    },
  },
  {
    name: 'create_note',
    description: 'Simpan satu catatan baru.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Judul singkat' },
        body: { type: 'STRING', description: 'Isi catatan' },
      },
      required: ['title', 'body'],
    },
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY belum di-set — ambil key gratis di aistudio.google.com lalu jalankan: npx supabase secrets set GEMINI_API_KEY=...' },
        { status: 500, headers: corsHeaders },
      )
    }

    const { prompt, context } = await req.json()
    if (!prompt?.trim()) {
      return Response.json({ error: 'Prompt kosong' }, { status: 400, headers: corsHeaders })
    }

    // Konteks (waktu sekarang di timezone user + snapshot datanya) ikut di
    // pesan user karena berubah tiap request.
    const contextText = [
      `Konteks waktu: sekarang ${context?.now ?? 'tidak diketahui'} (${context?.weekday ?? ''}, tanggal hari ini ${context?.today ?? '?'}).`,
      context?.tasks?.length ? `Tugas user:\n${JSON.stringify(context.tasks)}` : 'User belum punya tugas.',
      context?.events?.length ? `Acara user:\n${JSON.stringify(context.events)}` : 'User belum punya acara.',
    ].join('\n\n')

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [
        { role: 'user', parts: [{ text: `${contextText}\n\n---\n\nPesan user: ${prompt}` }] },
      ],
      tools: [{ functionDeclarations }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
      },
    })

    let res: Response | null = null
    let lastDetail = ''
    for (const model of GEMINI_MODELS) {
      res = await fetch(geminiUrl(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
      })
      if (res.ok) break

      const err = await res.json().catch(() => null)
      const detail = err?.error?.message ?? `HTTP ${res.status}`
      lastDetail = `${model}: ${detail}`
      console.warn('[ai-assistant] gagal di', model, res.status, detail)

      // Key tidak valid → percuma coba model lain.
      if (/api key not valid/i.test(detail)) {
        return Response.json(
          { error: 'GEMINI_API_KEY tidak valid — cek lagi di aistudio.google.com.', detail },
          { status: 500, headers: corsHeaders },
        )
      }
      // Selain itu (kapasitas penuh, kuota, model ditutup) → lanjut fallback.
    }

    if (!res?.ok) {
      // `detail` ikut dikirim untuk debugging; UI hanya menampilkan `error`.
      return Response.json(
        {
          error: 'Semua model AI sedang penuh/limit — tunggu sebentar lalu coba lagi.',
          detail: lastDetail,
        },
        { status: 500, headers: corsHeaders },
      )
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const reply = parts
      .filter((p: { text?: string }) => p.text)
      .map((p: { text?: string }) => p.text)
      .join('\n')
      .trim()
    const actions = parts
      .filter((p: { functionCall?: unknown }) => p.functionCall)
      .map((p: { functionCall: { name: string; args?: Record<string, unknown> } }) => ({
        tool: p.functionCall.name,
        input: p.functionCall.args ?? {},
      }))

    return Response.json({ reply, actions }, { headers: corsHeaders })
  } catch (e) {
    console.error('[ai-assistant]', e)
    return Response.json(
      { error: 'Asisten sedang bermasalah, coba lagi ya.', detail: String(e) },
      { status: 500, headers: corsHeaders },
    )
  }
})
