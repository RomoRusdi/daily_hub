import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

/**
 * A collection of records that is:
 *  - **local mode** (`cloud` false): kept in localStorage, seeded from `seed`.
 *  - **cloud mode** (`cloud` true): backed by a shared Supabase table, cached
 *    in localStorage for instant paint + offline reads, updated optimistically,
 *    and kept fresh via realtime.
 *
 * There's no auth: cloud mode is one shared dataset across all devices. The
 * returned API ({ items, insert, update, remove }) is identical in both modes.
 *
 * @param {object}  cfg
 * @param {string}  cfg.key      localStorage cache key suffix (e.g. 'tasks')
 * @param {string}  cfg.table    Supabase table name
 * @param {Array}   cfg.seed     starter records (app shape)
 * @param {fn}      cfg.fromRow  (dbRow) => appRecord
 * @param {fn}      cfg.toRow    (appRecordOrPatch) => dbRow (only maps present keys)
 * @param {fn}      [cfg.order]  comparator applied to app records after fetch
 * @param {boolean} cfg.cloud    enable Supabase backing
 */
export function useCollection({ key, table, seed, fromRow, toRow, order, cloud }) {
  const cacheKey = `hub:cache:${key}`

  const [items, setItems] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) return JSON.parse(cached)
    } catch {
      /* ignore */
    }
    return cloud ? [] : seed
  })

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
    const { data, error } = await supabase.from(table).select('*')
    if (error) {
      console.warn(`[${table}] fetch gagal`, error.message)
      return
    }
    let rows = (data || []).map(fromRow)

    // Empty table → seed it so Hub feels alive on first run.
    if (rows.length === 0 && seed.length) {
      const seeded = seed.map((s) => ({ ...s, id: newId() }))
      const { error: seedErr } = await supabase
        .from(table)
        .insert(seeded.map((s) => toRow(s)))
      if (!seedErr) rows = seeded
    }

    if (order) rows = [...rows].sort(order)
    write(rows)
  }, [cloud, table, fromRow, toRow, seed, order, write])

  fetchRef.current = fetchAll

  useEffect(() => {
    if (!cloud) return
    fetchAll()

    const channel = supabase
      .channel(`hub:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => fetchRef.current?.(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // Subscribe once per table; fetchAll is called through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud, table])

  // ---- Optimistic mutations ----
  const insert = useCallback(
    async (record) => {
      write((prev) => [record, ...prev])
      if (!cloud) return
      const { error } = await supabase.from(table).insert(toRow(record))
      if (error) {
        console.warn(`[${table}] insert gagal`, error.message)
        fetchRef.current?.()
      }
    },
    [cloud, table, toRow, write],
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
