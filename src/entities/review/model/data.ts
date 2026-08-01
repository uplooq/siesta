export interface Review {
  id: string
  photo: string
  photoAlt: string
  author: string
  meta: string
  text: string
  screenshot?: string
  screenshotAlt?: string
}

// Настоящие отзывы гостей добавляются сюда; пока список пуст,
// секция «Отзывы» и блоки отзывов внутри маршрутов скрыты.
export const reviews: Review[] = []
