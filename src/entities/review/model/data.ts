import { collect } from '@/shared/content/collection'
import type { ReviewContent } from '@/shared/content/schema'
import type { LightboxPhoto } from '@/shared/ui/lightbox'

export type Review = ReviewContent

// Отзывы гостей лежат в content/reviews/<id>.json; пока папка пуста,
// секция «Отзывы» и блоки отзывов внутри маршрутов скрыты.
export const reviews: Review[] = collect<ReviewContent>(
  import.meta.glob('/content/reviews/*.json', { eager: true, import: 'default' }),
)

// Экраны переписки для просмотра поверх страницы
export const reviewScreens = (review: Review): LightboxPhoto[] =>
  review.screenshots.map((shot) => ({
    src: shot.src,
    alt: shot.alt,
    caption: [review.author, review.trip].filter(Boolean).join(' · '),
  }))
