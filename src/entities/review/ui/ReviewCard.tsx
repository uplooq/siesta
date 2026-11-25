import { useState } from 'react'
import type { Review } from '../model/data'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './ReviewCard.module.css'

interface ReviewCardProps {
  review: Review
  // открыть оригинал сообщения (просмотр поверх страницы)
  onOpen: () => void
}

// длинные отзывы сворачиваем, чтобы карточки в ленте были сопоставимой высоты
const LONG_TEXT = 420

export const ReviewCard = ({ review, onOpen }: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const long = review.text.length > LONG_TEXT
  const [first] = review.screenshots

  return (
    <figure className={styles.card}>
      <blockquote className={cx(styles.text, long && !expanded && styles.clamped)}>
        {review.text}
      </blockquote>
      {long && (
        <button
          type="button"
          className={styles.more}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Свернуть' : 'Читать целиком'}
        </button>
      )}
      <figcaption className={styles.foot}>
        <span className={styles.who}>
          <span className={styles.author}>{review.author}</span>
          {review.trip && <span className={styles.trip}>{review.trip}</span>}
        </span>
        <button
          type="button"
          className={styles.proof}
          onClick={onOpen}
          aria-label={`Открыть оригинал сообщения: ${review.author}`}
        >
          <img src={withBase(first.src)} alt="" loading="lazy" />
          <span>Оригинал</span>
        </button>
      </figcaption>
    </figure>
  )
}
