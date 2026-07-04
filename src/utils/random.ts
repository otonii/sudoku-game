export function pickRandomItem<T>(items: readonly T[]): T | null {
  if (items.length === 0) {
    return null
  }

  return items[Math.floor(Math.random() * items.length)] ?? null
}
