import { useEffect, useRef, useState } from 'react'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Chronicle.module.css'

const gallery = [
  {
    src: '/photos/archipelago-aerial.webp',
    alt: 'Аэросъёмка архипелага на золотом часе: острова, песчаная коса и десятки яхт на якоре',
    caption: 'Острова залива, золотой час',
  },
  {
    src: '/photos/cove-anchorage.webp',
    alt: 'Гулеты на якоре в сосновой бухте, зеркальная вода и зелёные склоны',
    caption: 'Стоянка в сосновой бухте',
  },
  {
    src: '/photos/under-sail.webp',
    alt: 'Вид с палубы под парусом на глубокую синь открытого моря, вдали второй парусник',
    caption: 'Полный ветер, курс бейдевинд',
  },
  {
    src: '/photos/horseshoe-bay.webp',
    alt: 'Подковообразная бухта с бирюзовыми отмелями и одинокой яхтой, вид сверху',
    caption: 'Бухта-подкова, вид с дрона',
  },
  {
    src: '/photos/ancient-ruins.webp',
    alt: 'Античные руины у самой кромки бирюзовой воды среди сосен',
    caption: 'Античные руины у кромки воды',
  },
  {
    src: '/photos/catamaran-cove.webp',
    alt: 'Катамаран и гулет у каменного пирса в тихой зелёной бухте',
    caption: 'Тихая стоянка у пирса',
  },
  {
    src: '/photos/sunset-regatta.webp',
    alt: 'Оранжевый закат над морем, силуэты парусников у гористого берега',
    caption: 'Закат после гоночного дня',
  },
]

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
          <Kicker>Фотоотчёты</Kicker>
          <h2 className={cx('display', styles.title)} id="chron-title">
            Как это выглядит с воды
          </h2>
          <p>Кадры из прошлых выходов: бухты, переходы и вечера на палубе.</p>
        </Reveal>
        <Reveal>
          <div
            className={styles.carousel}
            role="group"
            aria-roledescription="карусель"
            aria-label="Фотографии из выходов siesta"
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
