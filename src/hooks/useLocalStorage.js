import { useCallback, useEffect, useState } from 'react'

/**
 * Persist a piece of React state to localStorage.
 *
 * @param {string} key            storage key
 * @param {*}      initialValue   default value (or a lazy initializer fn)
 * @returns {[value, setValue]}   same shape as useState
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) return JSON.parse(item)
    } catch (err) {
      console.warn(`useLocalStorage: gagal membaca "${key}"`, err)
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState(readValue)

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch (err) {
          console.warn(`useLocalStorage: gagal menyimpan "${key}"`, err)
        }
        return next
      })
    },
    [key],
  )

  // Keep tabs in sync if the same key changes elsewhere.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setStoredValue(readValue())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, readValue])

  return [storedValue, setValue]
}
