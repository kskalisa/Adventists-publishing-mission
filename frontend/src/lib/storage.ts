export function readStoredList<T>(key: string, fallback: T[]): T[] {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T[]) : fallback
  } catch {
    return fallback
  }
}

export function appendStoredItem<T>(key: string, item: T) {
  const current = readStoredList<T>(key, [])
  const next = [item, ...current]
  window.localStorage.setItem(key, JSON.stringify(next))
  return next
}

