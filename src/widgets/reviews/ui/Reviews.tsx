import { useEffect, useRef, useState } from 'react'
import { reviews, reviewScreens, ReviewCard, type Review } from '@/entities/review'
import { site } from '@/shared/content'
import { Kicker } from '@/shared/ui/kicker'
import { Lightbox } from '@/shared/ui/lightbox'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Reviews.module.css'

const copy = site.reviews

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

export const Reviews = () => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })
  const [open, setOpen] = useState<{ review: Review; index: number } | null>(null)

  // стрелки нужны, только когда карточки не помещаются в ширину
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const update = () =>
      setEdges({
        start: scroller.scrollLeft <= 4,
        end: scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4,
      })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(scroller)
    scroller.addEventListener('scroll', update, { passive: true })
    return () => {
      ro.disconnect()
      scroller.removeEventListener('scroll', update)
    }
  }, [])

  if (reviews.length === 0) return null

  const scrollBy = (dir: 1 | -1) => {
    const scroller = scrollerRef.current
    const card = scroller?.firstElementChild as HTMLElement | null
    if (!scroller || !card) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scroller.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <section className={styles.reviews} id="reviews" aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <div className={styles.headText}>
            <Kicker>{copy.kicker}</Kicker>
            <h2 className={cx('display', styles.title)} id="reviews-title">
              {copy.title}
            </h2>
            <p>{copy.lead}</p>
          </div>
          {!(edges.start && edges.end) && (
            <div className={styles.nav}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => scrollBy(-1)}
                disabled={edges.start}
                aria-label="Предыдущие отзывы"
              >
                <ArrowIcon flip />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => scrollBy(1)}
                disabled={edges.end}
                aria-label="Следующие отзывы"
              >
                <ArrowIcon />
              </button>
            </div>
          )}
        </Reveal>
        <Reveal delay={0.08}>
          <div className={styles.scroller} ref={scrollerRef}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onOpen={() => setOpen({ review, index: 0 })}
              />
            ))}
          </div>
        </Reveal>
      </div>
      <Lightbox
        photos={open ? reviewScreens(open.review) : []}
        index={open?.index ?? null}
        onChange={(index) => setOpen(open && index !== null ? { ...open, index } : null)}
      />
    </section>
  )
}
