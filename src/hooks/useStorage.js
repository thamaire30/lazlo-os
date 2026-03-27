import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.warn(`useLocalStorage error for key "${key}":`, err)
    }
  }, [key, storedValue])

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && e.newValue !== null) {
        try { setStoredValue(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [storedValue, setValue]
}

export function clearAllData() {
  const keys = ['lazlo_xp', 'lazlo_level', 'lazlo_streak', 'lazlo_last_active',
    'lazlo_daily_tasks', 'lazlo_daily_date', 'lazlo_custom_task_bank',
    'lazlo_history', 'lazlo_network', 'lazlo_coach_history',
    'lazlo_api_key', 'lazlo_settings', 'lazlo_weekly_scores']
  keys.forEach(k => localStorage.removeItem(k))
}
