import { useEffect, useRef, useState } from 'react'
import { reviews } from '@/entities/review'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import { ReviewDialog } from './ReviewDialog'
import styles from './Chronicle.module.css'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
  </svg>
)

const ArrowIcon = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const Chronicle = () => {
  const [active, setActive] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const onScroll = () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const scroller = scrollerRef.current
      if (!scroller) return
      const center = scroller.scrollLeft + scroller.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      Array.from(scroller.children).forEach((child, i) => {
        const el = child as HTMLElement
        const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      })
      setActive(best)
    })
  }

  const scrollTo = (index: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const clamped = Math.max(0, Math.min(reviews.length - 1, index))
    const slide = scroller.children[clamped] as HTMLElement | undefined
    if (!slide) return
    scroller.scrollTo({
      left: slide.offsetLeft - (scroller.clientWidth - slide.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  const openReview = reviews.find((review) => review.id === openId) ?? null

  return (
    <section className={styles.chronicle} aria-labelledby="chron-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <Kicker>Хроника сезона</Kicker>
          <h2 className={cx('display', styles.title)} id="chron-title">
            Как это выглядит с воды
          </h2>
          <p>
            За каждым кадром стоит чья-то неделя в море. Листайте карусель и нажимайте на фото,
            чтобы прочитать отзыв.
          </p>
        </Reveal>
        <Reveal>
          <div
            className={styles.carousel}
            role="group"
            aria-roledescription="карусель"
            aria-label="Кадры из выходов с отзывами гостей"
          >
            <button
              type="button"
              className={cx(styles.navBtn, styles.prev)}
              onClick={() => scrollTo(active - 1)}
              disabled={active === 0}
              aria-label="Предыдущий кадр"
            >
              <ArrowIcon flip />
            </button>
            <div className={styles.scroller} ref={scrollerRef} onScroll={onScroll}>
              {reviews.map((review, i) => (
                <figure
                  key={review.id}
                  className={styles.slide}
                  role="group"
                  aria-roledescription="слайд"
                  aria-label={`Кадр ${i + 1} из ${reviews.length}`}
                >
                  <button
                    type="button"
                    className={styles.slideBtn}
                    onClick={() => setOpenId(review.id)}
                    aria-haspopup="dialog"
                    aria-label={`Открыть отзыв: ${review.author}`}
                  >
                    <img loading="lazy" src={withBase(review.photo)} alt={review.photoAlt} />
                    <span className={styles.shade} aria-hidden="true" />
                    <span className={styles.count} aria-hidden="true">
                      {i + 1}/{reviews.length}
                    </span>
                    <span className={styles.tag} aria-hidden="true">
                      <QuoteIcon />
                      <span className={styles.tagName}>{review.author}</span>
                      <span className={styles.tagCta}>читать отзыв</span>
                    </span>
                  </button>
                </figure>
              ))}
            </div>
            <button
              type="button"
              className={cx(styles.navBtn, styles.next)}
              onClick={() => scrollTo(active + 1)}
              disabled={active === reviews.length - 1}
              aria-label="Следующий кадр"
            >
              <ArrowIcon />
            </button>
            <div className={styles.dots}>
              {reviews.map((review, i) => (
                <button
                  key={review.id}
                  type="button"
                  className={styles.dot}
                  aria-current={i === active}
                  aria-label={`Кадр ${i + 1}: ${review.author}`}
                  onClick={() => scrollTo(i)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <ReviewDialog review={openReview} onClose={() => setOpenId(null)} />
    </section>
  )
}
