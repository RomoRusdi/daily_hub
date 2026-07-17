import { Bell, BellOff, BellRing, LogOut, Smartphone } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import { usePush } from '../hooks/usePush'
import { useAuth } from '../store/AuthContext'

const PERMISSION_LABEL = {
  default: { text: 'Belum diminta', cls: 'bg-white/40 text-subtle dark:bg-white/10' },
  granted: { text: 'Diizinkan', cls: 'bg-brand-soft text-brand' },
  denied: { text: 'Ditolak', cls: 'bg-accent/10 text-accent' },
}

export default function Settings() {
  const { configured, username, signOut } = useAuth()
  const push = usePush()
  const perm = PERMISSION_LABEL[push.permission] ?? PERMISSION_LABEL.default

  return (
    <div>
      <Header title="Pengaturan" showDate={false} />

      {/* Reminder notifications */}
      <Reveal>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-brand-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <BellRing size={19} className="text-brand" />
              </span>
              <div>
                <p className="text-sm font-medium">Notifikasi reminder</p>
                <p className="mt-0.5 text-xs text-subtle">
                  Pengingat tugas muncul walau app ditutup.
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${perm.cls}`}
            >
              {perm.text}
            </span>
          </div>

          {!configured ? (
            <p className="mt-4 text-xs text-muted">
              Fitur ini butuh Supabase (mode cloud). Saat ini app berjalan
              local-only.
            </p>
          ) : !push.supported ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/40 p-3 text-xs leading-relaxed text-subtle dark:bg-white/5">
              <Smartphone size={15} className="mt-0.5 shrink-0" />
              {push.needsInstall ? (
                <span>
                  Di iPhone, notifikasi hanya bisa lewat app yang ter-install:
                  buka menu <b>Share</b> → <b>Add to Home Screen</b>, lalu buka
                  Hub dari Home Screen dan kembali ke sini.
                </span>
              ) : (
                <span>Browser ini tidak mendukung notifikasi push.</span>
              )}
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {push.subscribed && push.permission === 'granted' ? (
                  <>
                    <Button variant="secondary" onClick={push.test} disabled={push.busy}>
                      <Bell size={15} /> Kirim tes
                    </Button>
                    <Button variant="ghost" onClick={push.disable} disabled={push.busy}>
                      <BellOff size={15} /> Matikan
                    </Button>
                  </>
                ) : (
                  <Button onClick={push.enable} disabled={push.busy}>
                    <Bell size={15} />
                    {push.busy ? 'Memproses…' : 'Aktifkan notifikasi reminder'}
                  </Button>
                )}
              </div>
              {push.permission === 'denied' && (
                <p className="mt-3 text-xs text-accent">
                  Izin notifikasi ditolak — aktifkan lagi lewat pengaturan
                  browser/OS untuk situs ini, lalu coba lagi.
                </p>
              )}
              {push.error && <p className="mt-3 text-xs text-accent">{push.error}</p>}
            </>
          )}
        </Card>
      </Reveal>

      {/* Account */}
      {configured && (
        <Reveal delay={0.08}>
          <Card className="mt-4 flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-subtle">Masuk sebagai</p>
              <p className="text-sm font-medium capitalize">{username}</p>
            </div>
            <Button variant="ghost" onClick={signOut}>
              <LogOut size={15} /> Keluar
            </Button>
          </Card>
        </Reveal>
      )}
    </div>
  )
}
