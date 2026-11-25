import type { Review } from '../model/data'
import { withBase } from '@/shared/lib/withBase'
import styles from './ReviewCard.module.css'

interface ReviewCardProps {
  review: Review
  // открыть переписку целиком (просмотр поверх страницы)
  onOpen: () => void
}

const screensLabel = (n: number) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} экран`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} экрана`
  return `${n} экранов`
}

export const ReviewCard = ({ review, onOpen }: ReviewCardProps) => {
  const [first] = review.screenshots
  const count = review.screenshots.length

  return (
    <figure className={styles.card}>
      <button
        type="button"
        className={styles.shot}
        onClick={onOpen}
        aria-label={`Открыть переписку: ${review.author}`}
      >
        <img src={withBase(first.src)} alt={first.alt} loading="lazy" />
        <span className={styles.open} aria-hidden="true">
          {count > 1 ? `Читать · ${screensLabel(count)}` : 'Читать переписку'}
        </span>
      </button>
      {review.quote && <blockquote className={styles.quote}>{review.quote}</blockquote>}
      <figcaption className={styles.who}>
        <span className={styles.author}>{review.author}</span>
        {review.trip && <span className={styles.trip}>{review.trip}</span>}
      </figcaption>
    </figure>
  )
}
