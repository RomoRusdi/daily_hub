import { useCallback, useEffect, useState } from 'react'
import {
  isPushSupported,
  needsInstallFirst,
  getExistingSubscription,
  enablePush,
  disablePush,
  showTestNotification,
} from '../lib/push'

/**
 * Push opt-in state for the Settings page. `enable`/`disable`/`test` must be
 * wired to buttons — browsers only grant the permission from a user gesture.
 */
export function usePush() {
  const supported = isPushSupported()
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supported) return
    getExistingSubscription().then((s) => setSubscribed(Boolean(s)))
  }, [supported])

  const run = useCallback(async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
      if (typeof Notification !== 'undefined') setPermission(Notification.permission)
    }
  }, [])

  const enable = useCallback(
    () =>
      run(async () => {
        await enablePush()
        setSubscribed(true)
      }),
    [run],
  )

  const disable = useCallback(
    () =>
      run(async () => {
        await disablePush()
        setSubscribed(false)
      }),
    [run],
  )

  const test = useCallback(() => run(showTestNotification), [run])

  return {
    supported,
    needsInstall: needsInstallFirst(),
    permission, // 'default' | 'granted' | 'denied'
    subscribed,
    busy,
    error,
    enable,
    disable,
    test,
  }
}
