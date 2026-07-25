import { reviews, ReviewCard } from '@/entities/review'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Reviews.module.css'

export const Reviews = () => (
  <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
    <div className={styles.inner}>
      <Reveal className={styles.head}>
        <Kicker>Отзывы</Kicker>
        <h2 className={cx('display', styles.title)} id="reviews-title">
          Что пишут после моря
        </h2>
        <p>
          Гости рассказывают сами: после недели под парусом слова находятся легко. Свои отзывы
          есть и внутри каждого маршрута.
        </p>
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
