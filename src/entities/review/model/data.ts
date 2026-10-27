import { collect } from '@/shared/content/collection'
import type { ReviewContent } from '@/shared/content/schema'

export type Review = ReviewContent

// Настоящие отзывы гостей кладутся в content/reviews/<id>.json; пока папка пуста,
// секция «Отзывы» и блоки отзывов внутри маршрутов скрыты.
export const reviews: Review[] = collect<ReviewContent>(
  import.meta.glob('/content/reviews/*.json', { eager: true, import: 'default' }),
)
