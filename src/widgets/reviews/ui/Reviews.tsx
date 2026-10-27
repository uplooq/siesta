import { reviews, ReviewCard } from '@/entities/review'
import { site } from '@/shared/content'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Reviews.module.css'

const copy = site.reviews

export const Reviews = () => {
  if (reviews.length === 0) return null

  return (
    <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 className={cx('display', styles.title)} id="reviews-title">
            {copy.title}
          </h2>
          <p>{copy.lead}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className={styles.wall}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
