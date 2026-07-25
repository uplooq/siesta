import type { Review } from '../model/data'
import { withBase } from '@/shared/lib/withBase'
import styles from './ReviewCard.module.css'

const initials = (author: string) =>
  author
    .split(' ')
    .filter((word) => word !== 'и')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

export const ReviewCard = ({ review }: { review: Review }) => (
  <article className={styles.card}>
    <header className={styles.head}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(review.author)}
      </span>
      <div className={styles.who}>
        <span className={styles.author}>{review.author}</span>
        <span className={styles.meta}>{review.meta}</span>
      </div>
    </header>
    {review.screenshot ? (
      <img
        className={styles.shot}
        src={withBase(review.screenshot)}
        alt={review.screenshotAlt ?? `Скриншот отзыва — ${review.author}`}
        loading="lazy"
      />
    ) : (
      <p className={styles.bubble}>{review.text}</p>
    )}
  </article>
)
