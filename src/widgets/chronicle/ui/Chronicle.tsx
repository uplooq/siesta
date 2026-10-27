import { useEffect, useRef, useState } from 'react'
import { chronicle, site } from '@/shared/content'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Chronicle.module.css'

// Лента живёт в content/chronicle.json: кадры идут вперемешку по всем направлениям,
// два соседних никогда не из одного места.
const gallery = chronicle.photos
const copy = site.chronicle

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
    const clamped = Math.max(0, Math.min(gallery.length - 1, index))
    const slide = scroller.children[clamped] as HTMLElement | undefined
    if (!slide) return
    scroller.scrollTo({
      left: slide.offsetLeft - (scroller.clientWidth - slide.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <section className={styles.chronicle} id="chronicle" aria-labelledby="chron-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <Kicker>{copy.kicker}</Kicker>
          <h2 className={cx('display', styles.title)} id="chron-title">
            {copy.title}
          </h2>
          <p>{copy.lead}</p>
        </Reveal>
        <Reveal>
          <div
            className={styles.carousel}
            role="group"
            aria-roledescription="карусель"
            aria-label={`Фотографии из выходов ${site.brand}`}
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
              {gallery.map((photo, i) => (
                <figure
                  key={photo.src}
                  className={styles.slide}
                  role="group"
                  aria-roledescription="слайд"
                  aria-label={`Кадр ${i + 1} из ${gallery.length}`}
                >
                  <div className={styles.media}>
                    <img loading="lazy" src={withBase(photo.src)} alt={photo.alt} />
                    <span className={styles.shade} aria-hidden="true" />
                    <span className={styles.count} aria-hidden="true">
                      {i + 1}/{gallery.length}
                    </span>
                  </div>
                  <figcaption className={styles.caption}>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
            <button
              type="button"
              className={cx(styles.navBtn, styles.next)}
              onClick={() => scrollTo(active + 1)}
              disabled={active === gallery.length - 1}
              aria-label="Следующий кадр"
            >
              <ArrowIcon />
            </button>
            <div className={styles.dots}>
              {gallery.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  className={styles.dot}
                  aria-current={i === active}
                  aria-label={`Кадр ${i + 1}: ${photo.caption}`}
                  onClick={() => scrollTo(i)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
