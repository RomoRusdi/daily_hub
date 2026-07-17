// Supabase Edge Function: send-reminders
//
// Dipanggil tiap menit oleh pg_cron (lihat SUPABASE.md). Mencari tugas yang
// reminder-nya jatuh tempo lalu mengirim Web Push ke semua device milik
// pemilik tugas.
//
// Secrets (supabase secrets set …):
//   VAPID_PUBLIC_KEY   — pasangan dari VITE_VAPID_PUBLIC_KEY di frontend
//   VAPID_PRIVATE_KEY  — JANGAN pernah taruh di frontend
//   VAPID_SUBJECT      — mailto:emailmu (identitas pengirim VAPID)
//   CRON_SECRET        — string acak; harus sama dengan header x-cron-secret
// SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY disediakan otomatis oleh runtime.
//
// Deploy: supabase functions deploy send-reminders --no-verify-jwt
// (JWT dimatikan karena pemanggilnya pg_cron, bukan user; akses dijaga
//  CRON_SECRET. Service role dipakai untuk query lintas-user — RLS bypass
//  yang memang disengaja dan aman karena key-nya tidak pernah keluar server.)

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

Deno.serve(async (req) => {
  // Hanya cron (atau kamu, saat menguji manual) yang boleh memanggil.
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('Forbidden', { status: 403 })
  }

  // Tugas jatuh tempo: belum dikirim, belum selesai, dan tidak lebih telat
  // dari 1 hari (reminder basi tidak berguna — tandai saja tanpa kirim).
  const { data: due, error } = await supabase
    .from('tasks')
    .select('id, title, user_id, remind_at')
    .eq('reminder_sent', false)
    .eq('done', false)
    .not('remind_at', 'is', null)
    .lte('remind_at', new Date().toISOString())
    .limit(100)
  if (error) return new Response(error.message, { status: 500 })
  if (!due?.length) return Response.json({ sent: 0 })

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  const fresh = due.filter((t) => new Date(t.remind_at).getTime() > dayAgo)

  // Semua subscription milik user-user terkait, sekali query.
  const userIds = [...new Set(fresh.map((t) => t.user_id))]
  const { data: subs } = userIds.length
    ? await supabase
        .from('push_subscriptions')
        .select('endpoint, subscription, user_id')
        .in('user_id', userIds)
    : { data: [] }
  const subsByUser = new Map<string, typeof subs>()
  for (const s of subs ?? []) {
    const list = subsByUser.get(s.user_id) ?? []
    list.push(s)
    subsByUser.set(s.user_id, list)
  }

  let sent = 0
  const staleEndpoints: string[] = []

  for (const task of fresh) {
    for (const sub of subsByUser.get(task.user_id) ?? []) {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: 'Pengingat tugas',
            body: task.title,
            url: '/tasks',
            tag: `task-${task.id}`,
          }),
        )
        sent++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        // 404/410 = subscription kadaluarsa (app di-uninstall, izin dicabut).
        if (status === 404 || status === 410) staleEndpoints.push(sub.endpoint)
        else console.error(`push gagal (task ${task.id}):`, e)
      }
    }
  }

  // Tandai SEMUA yang jatuh tempo (termasuk yang basi/tanpa subscription)
  // supaya tidak di-retry selamanya.
  await supabase
    .from('tasks')
    .update({ reminder_sent: true })
    .in('id', due.map((t) => t.id))

  if (staleEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', staleEndpoints)
  }

  return Response.json({ due: due.length, sent, pruned: staleEndpoints.length })
})
