// Общий способ превратить результат import.meta.glob в отсортированный список.
// Файлы с published: false не попадают на сайт (черновики для будущей админки).
interface Entry {
  order?: number
  published?: boolean
}

export const collect = <T extends Entry>(modules: Record<string, unknown>): T[] =>
  Object.values(modules)
    .map((m) => m as T)
    .filter((item) => item.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
