import { useEffect, useRef, useState } from 'react'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Chronicle.module.css'

const gallery = [
  {
    src: '/photos/covers/marina-sunset.webp',
    alt: 'Розово-сиреневое небо на закате над мариной Гёчека, сосны на переднем плане и мачты яхт у причала',
    caption: 'Закат над мариной Гёчека',
  },
  {
    src: '/photos/race/heeling.webp',
    alt: 'Гоночная яхта с чёрными парусами в крене, экипаж откренивает на наветренном борту',
    caption: 'Полный крен на дистанции',
  },
  {
    src: '/photos/turkey/night-mast.webp',
    alt: 'Мачта яхты снизу вверх на фоне звёздного неба с полосой Млечного Пути',
    caption: 'Звёзды над мачтой, ночь на якоре',
  },
  {
    src: '/photos/race/start-line.webp',
    alt: 'Флот одинаковых яхт с чёрными парусами выстроился на линии старта вдоль волнолома',
    caption: 'Минуты до старта',
  },
  {
    src: '/photos/turkey/awning-view.webp',
    alt: 'Вид из-под тента яхты на скалистый мыс и синее море залива',
    caption: 'Переход между бухтами',
  },
  {
    src: '/photos/race/bow-to-bow.webp',
    alt: 'Две гоночные яхты идут вплотную борт к борту, паруса пересекаются',
    caption: 'Борт к борту на дистанции',
  },
  {
    src: '/photos/turkey/swim-platform.webp',
    alt: 'Тиковая корма яхты с купальной лестницей у изумрудной воды, на палубе надувные круги',
    caption: 'Купание на стоянке',
  },
  {
    src: '/photos/turkey/polaroid.webp',
    alt: 'Рука держит полароидный снимок с общим фото компании за столом в кокпите яхты',
    caption: 'Полароид с прошлой недели',
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
