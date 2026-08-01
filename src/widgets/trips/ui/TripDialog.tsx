import { useEffect, useState } from 'react'
import { programs } from '@/entities/program'
import { reviews, ReviewCard } from '@/entities/review'
import { tripGroups, type Trip } from '@/entities/trip'
import { contacts } from '@/shared/config/contacts'
import { Button } from '@/shared/ui/button'
import { Modal } from '@/shared/ui/modal'
import { withBase } from '@/shared/lib/withBase'
import { TripMap } from './TripMap'
import styles from './TripDialog.module.css'

interface TripDialogProps {
  trip: Trip | null
  onClose: () => void
}

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const TripDialog = ({ trip, onClose }: TripDialogProps) => {
  const [departureId, setDepartureId] = useState<string | null>(null)

  useEffect(() => {
    setDepartureId(null)
    trip?.departures.forEach((d) => {
      if (d.route.mapImage) {
        new Image().src = withBase(d.route.mapImage)
      }
    })
  }, [trip])

  const noun = tripGroups.find((g) => g.id === trip?.group)?.noun ?? 'Путешествие'
  const conditions = programs.find((p) => p.id === trip?.group)?.detail.included ?? []
  const tripReviews = trip ? reviews.filter((r) => trip.reviewIds.includes(r.id)) : []
  const departure =
    trip?.departures.find((d) => d.id === departureId) ?? trip?.departures[0] ?? null
  const route = departure?.route ?? null
  const multiRoute = trip ? new Set(trip.departures.map((d) => d.route)).size > 1 : false

  return (
    <Modal
      open={trip !== null}
      onClose={onClose}
      label={trip ? `${noun}: ${trip.geo}` : noun}
      className={styles.dialog}
    >
      {trip && route && departure && (
        <div className={styles.frame}>
          <div className={styles.mapCol}>
            <TripMap route={route} />
          </div>
          <div className={styles.scroll}>
            <header className={styles.head}>
              <p className={styles.eyebrow}>
                {noun} · {route.name}
              </p>
              <h3 className={styles.title}>{trip.geo}</h3>
              <p className={styles.tagline}>{trip.tagline}</p>
            </header>

            <div className={styles.facts}>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Даты · {trip.year}</span>
                {trip.departures.length > 1 ? (
                  <span
                    className={styles.dates}
                    role="group"
                    aria-label="Выбор даты выхода"
                  >
                    {trip.departures.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={styles.dateBtn}
                        aria-pressed={d.id === departure.id}
                        onClick={() => setDepartureId(d.id)}
                      >
                        {d.dates}
                      </button>
                    ))}
                  </span>
                ) : (
                  <span className={styles.dates}>
                    <span className={styles.date}>{departure.dates}</span>
                  </span>
                )}
                {multiRoute && (
                  <span className={styles.datesNote}>у каждой даты — своя нитка</span>
                )}
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Маршрут</span>
                <span className={styles.factValue}>{route.name}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>В море</span>
                <span className={styles.factValue}>
                  {route.duration} · {route.extent}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Цена</span>
                <span className={styles.factValue}>
                  <b>{trip.price}</b> {trip.priceUnit}
                </span>
              </div>
              <p className={styles.priceNotes}>
                {[trip.priceNote, 'перелёт в стоимость не входит']
                  .filter(Boolean)
                  .map((note) => (
                    <span key={note}>{note}</span>
                  ))}
              </p>
            </div>

            <section className={styles.block} aria-label="Условия">
              <h4 className={styles.blockTitle}>Условия</h4>
              <ul className={styles.included}>
                {conditions.map((item) => (
                  <li key={item.label}>
                    <span className={styles.k}>{item.label}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block} aria-label="Программа по дням">
              <h4 className={styles.blockTitle}>Программа по дням</h4>
              <p className={styles.intro}>{route.itinerary.intro}</p>
              {route.itinerary.days.length > 0 && (
                <ol className={styles.days}>
                  {route.itinerary.days.map((day) => (
                    <li key={day.label}>
                      <span className={styles.dayLabel}>{day.label}</span>
                      <div className={styles.dayBody}>
                        <h5>{day.title}</h5>
                        <p>{day.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <p className={styles.note}>{route.itinerary.note}</p>
            </section>

            <section className={styles.block} aria-label="Фотографии">
              <h4 className={styles.blockTitle}>Как это выглядит</h4>
              <div className={styles.gallery}>
                {trip.photos.map((photo) => (
                  <figure key={photo.src}>
                    <img src={withBase(photo.src)} alt={photo.alt} loading="lazy" />
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                ))}
              </div>
              {trip.video && (
                <a
                  className={styles.videoLink}
                  href={trip.video.href}
                  target="_blank"
                  rel="noopener"
                >
                  {trip.video.label}
                  <span aria-hidden="true"> ↗</span>
                </a>
              )}
            </section>

            {tripReviews.length > 0 && (
              <section className={styles.block} aria-label="Отзывы">
                <h4 className={styles.blockTitle}>Отзывы с этого маршрута</h4>
                <div className={styles.reviews}>
                  {tripReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            )}

            <footer className={styles.cta}>
              <div className={styles.price}>
                <span className={styles.p}>{trip.price}</span>
                <span className={styles.u}>
                  {trip.priceUnit}
                  {trip.priceNote && ` · ${trip.priceNote}`}
                </span>
              </div>
              <Button
                href={contacts.telegram}
                target="_blank"
                rel="noopener"
                aria-label={`Написать в Telegram ${contacts.telegramLabel} про «${trip.geo}»`}
              >
                Написать в Telegram
              </Button>
              <p className={styles.ctaNote}>
                Ответим в течение дня: сверим даты и забронируем места.
              </p>
            </footer>
          </div>
          <button
            type="button"
            data-autofocus
            className={styles.close}
            onClick={onClose}
            aria-label="Закрыть и вернуться на сайт"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </Modal>
  )
}
