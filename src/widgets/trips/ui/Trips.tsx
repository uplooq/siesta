import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { trips, tripGroups, type TripGroup } from '@/entities/trip'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import { TripDialog } from './TripDialog'
import styles from './Trips.module.css'

const tripHash = /^#trip-(.+)$/

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const Trips = () => {
  const [group, setGroup] = useState<TripGroup>('travel')
  const [openId, setOpenId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const tabRefs = useRef(new Map<TripGroup, HTMLButtonElement>())
  const pushedRef = useRef(false)

  useEffect(() => {
    const sync = () => {
      const match = location.hash.match(tripHash)
      if (match && trips.some((trip) => trip.id === match[1])) {
        setOpenId(match[1])
        return
      }
      pushedRef.current = false
      setOpenId(null)
      if (location.hash === '#travel' || location.hash === '#race') {
        setGroup(location.hash.slice(1) as TripGroup)
        sectionRef.current?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        })
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const openTrip = (id: string) => {
    setOpenId(id)
    history.pushState(null, '', `#trip-${id}`)
    pushedRef.current = true
  }

  const closeTrip = () => {
    setOpenId(null)
    if (pushedRef.current) {
      pushedRef.current = false
      history.back()
    } else if (tripHash.test(location.hash)) {
      history.replaceState(null, '', location.pathname + location.search)
    }
  }

  const focusTab = (index: number) => {
    const next = tripGroups[(index + tripGroups.length) % tripGroups.length]
    setGroup(next.id)
    tabRefs.current.get(next.id)?.focus()
  }

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusTab(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusTab(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusTab(tripGroups.length - 1)
    }
  }

  return (
    <section className={styles.trips} id="trips" ref={sectionRef} aria-labelledby="trips-title">
      <Reveal className={styles.head}>
        <Kicker>Сезон 2026</Kicker>
        <h2 className={cx('display', styles.title)} id="trips-title">
          Куда пойдём под парусом
        </h2>
        <p>
          Выберите формат и даты. Внутри каждой карточки — маршрут с картой, программа по дням,
          условия и цена.
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className={styles.tabs} role="tablist" aria-label="Форматы выходов в море">
          {tripGroups.map((g, index) => {
            const selected = g.id === group
            return (
              <button
                key={g.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(g.id, el)
                  else tabRefs.current.delete(g.id)
                }}
                className={styles.tab}
                role="tab"
                id={`trips-tab-${g.id}`}
                aria-controls={`trips-panel-${g.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setGroup(g.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
              >
                {g.label}
              </button>
            )
          })}
        </div>
      </Reveal>

      {tripGroups.map((g) => (
        <div
          key={g.id}
          className={styles.panel}
          role="tabpanel"
          id={`trips-panel-${g.id}`}
          aria-labelledby={`trips-tab-${g.id}`}
          hidden={g.id !== group}
        >
          <div className={styles.grid}>
            {trips
              .filter((trip) => trip.group === g.id)
              .map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  className={styles.card}
                  onClick={() => openTrip(trip.id)}
                  aria-haspopup="dialog"
                >
                  <span
                    className={styles.cardBg}
                    style={{ backgroundImage: `url('${withBase(trip.cover)}')` }}
                  />
                  <span className={styles.cardShade} />
                  <span className={styles.cardInner}>
                    <span className={styles.cardEyebrow}>
                      {g.noun} · {trip.duration}
                    </span>
                    <span className={styles.cardTitle}>{trip.geo}</span>
                    <span className={styles.cardDates}>
                      {trip.departures.map((dates) => (
                        <span key={dates} className={styles.date}>
                          {dates}
                        </span>
                      ))}
                      <span className={styles.year}>{trip.year}</span>
                    </span>
                    <span className={styles.cardMeta}>
                      {trip.price} <span className={styles.cardMetaUnit}>{trip.priceUnit}</span>
                    </span>
                    <span className={styles.cardHint}>Смотреть программу</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}

      <TripDialog trip={trips.find((trip) => trip.id === openId) ?? null} onClose={closeTrip} />
    </section>
  )
}
