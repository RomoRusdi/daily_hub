import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

/**
 * A collection of records that is:
 *  - **local mode** (`userId` falsy): kept in localStorage, seeded from `seed`.
 *  - **cloud mode** (`userId` set): backed by a per-user Supabase table, cached
 *    in localStorage for instant paint + offline reads, updated optimistically,
 *    and kept fresh via realtime.
 *
 * The returned API ({ items, insert, update, remove }) is identical in both
 * modes, so DataContext doesn't care which one is active.
 *
 * @param {object}  cfg
 * @param {string}  cfg.key      localStorage cache key suffix (e.g. 'tasks')
 * @param {string}  cfg.table    Supabase table name
 * @param {Array}   cfg.seed     starter records (app shape)
 * @param {fn}      cfg.fromRow  (dbRow) => appRecord
 * @param {fn}      cfg.toRow    (appRecordOrPatch, userId?) => dbRow (only maps present keys)
 * @param {fn}      [cfg.order]  comparator applied to app records after fetch
 * @param {string}  [cfg.userId] current user id; presence enables cloud mode
 */
export function useCollection({ key, table, seed, fromRow, toRow, order, userId }) {
  const cloud = Boolean(userId)
  // Cache is scoped per user so switching accounts never mixes data.
  const cacheKey = `hub:cache:${key}:${userId || 'local'}`

  const initialItems = () => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) return JSON.parse(cached)
    } catch {
      /* ignore */
    }
    return cloud ? [] : seed
  }

  const [items, setItems] = useState(initialItems)

  // Reset synchronously when the user (and thus cacheKey) changes, so the
  // previous account's rows never linger in memory across a login/logout.
  const [prevKey, setPrevKey] = useState(cacheKey)
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey)
    setItems(initialItems())
  }

  // Persist to cache on every change so reloads paint instantly.
  const write = useCallback(
    (updater) => {
      setItems((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        try {
          localStorage.setItem(cacheKey, JSON.stringify(next))
        } catch {
          /* ignore quota errors */
        }
        return next
      })
    },
    [cacheKey],
  )

  // Keep the latest fetch fn in a ref so the realtime subscription (set up
  // once) always calls the current version without re-subscribing.
  const fetchRef = useRef(null)

  const fetchAll = useCallback(async () => {
    if (!cloud) return
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
    if (error) {
      console.warn(`[${table}] fetch gagal`, error.message)
      return
    }
    let rows = (data || []).map(fromRow)

    // Brand-new user with an empty table → seed it so Hub feels alive.
    if (rows.length === 0 && seed.length) {
      const seeded = seed.map((s) => ({ ...s, id: newId() }))
      const { error: seedErr } = await supabase
        .from(table)
        .insert(seeded.map((s) => toRow(s, userId)))
      if (!seedErr) rows = seeded
    }

    if (order) rows = [...rows].sort(order)
    write(rows)
  }, [cloud, table, userId, fromRow, toRow, seed, order, write])

  fetchRef.current = fetchAll

  useEffect(() => {
    if (!cloud) return
    fetchAll()

    const channel = supabase
      .channel(`hub:${table}:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        () => fetchRef.current?.(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // Re-subscribe only when the user changes; fetchAll is called via the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud, table, userId])

  // ---- Optimistic mutations ----
  const insert = useCallback(
    async (record) => {
      write((prev) => [record, ...prev])
      if (!cloud) return
      const { error } = await supabase.from(table).insert(toRow(record, userId))
      if (error) {
        console.warn(`[${table}] insert gagal`, error.message)
        fetchRef.current?.()
      }
    },
    [cloud, table, userId, toRow, write],
  )

  const update = useCallback(
    async (id, patch) => {
      write((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
      if (!cloud) return
      const { error } = await supabase.from(table).update(toRow(patch)).eq('id', id)
      if (error) {
        console.warn(`[${table}] update gagal`, error.message)
        fetchRef.current?.()
      }
    },
    [cloud, table, toRow, write],
  )

  const remove = useCallback(
    async (id) => {
      write((prev) => prev.filter((x) => x.id !== id))
      if (!cloud) return
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) {
        console.warn(`[${table}] delete gagal`, error.message)
        fetchRef.current?.()
      }
    },
    [cloud, table, write],
  )

  return { items, insert, update, remove }
}

export { newId }
