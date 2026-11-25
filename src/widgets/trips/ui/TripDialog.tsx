import { useEffect, useState } from 'react'
import { programs } from '@/entities/program'
import { reviews, reviewScreens, ReviewCard, type Review } from '@/entities/review'
import { tripGroups, type Trip } from '@/entities/trip'
import { contacts } from '@/shared/content'
import { Button } from '@/shared/ui/button'
import { Lightbox } from '@/shared/ui/lightbox'
import { Modal } from '@/shared/ui/modal'
import { withBase } from '@/shared/lib/withBase'
import { TripMap } from './TripMap'
import styles from './TripDialog.module.css'
import { ui } from '@/shared/i18n'

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
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const [openReview, setOpenReview] = useState<{ review: Review; index: number } | null>(null)

  useEffect(() => {
    setDepartureId(null)
    setPhotoIndex(null)
    setOpenReview(null)
    trip?.departures.forEach((d) => {
      if (d.route.mapImage) {
        new Image().src = withBase(d.route.mapImage)
      }
    })
  }, [trip])

  const noun = tripGroups.find((g) => g.id === trip?.group)?.noun ?? ui.tripNoun.travel
  const baseConditions = programs.find((p) => p.id === trip?.group)?.detail.included ?? []
  const ownConditions = trip?.conditions ?? []
  const conditions = [
    ...baseConditions.map((c) => ownConditions.find((o) => o.label === c.label) ?? c),
    ...ownConditions.filter((o) => !baseConditions.some((c) => c.label === o.label)),
  ]
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
                <span className={styles.factLabel}>
                  {ui.dates} · {trip.year}
                </span>
                {trip.departures.length > 1 ? (
                  <span
                    className={styles.dates}
                    role="group"
                    aria-label={ui.datesPick}
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
                  <span className={styles.datesNote}>{ui.datesNote}</span>
                )}
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>{ui.route}</span>
                <span className={styles.factValue}>{route.name}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>{ui.atSea}</span>
                <span className={styles.factValue}>
                  {route.duration} · {route.extent}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>{ui.price}</span>
                <span className={styles.factValue}>
                  <b>{trip.price}</b> {trip.priceUnit}
                </span>
              </div>
              <p className={styles.priceNotes}>
                {[trip.priceNote, ui.flightNote]
                  .filter(Boolean)
                  .map((note) => (
                    <span key={note}>{note}</span>
                  ))}
              </p>
            </div>

            <section className={styles.block} aria-label={ui.conditions}>
              <h4 className={styles.blockTitle}>{ui.conditions}</h4>
              <ul className={styles.included}>
                {conditions.map((item) => (
                  <li key={item.label}>
                    <span className={styles.k}>{item.label}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              {trip.included && trip.included.length > 0 && (
                <>
                  <h5 className={styles.subTitle}>{ui.included}</h5>
                  <ul className={styles.includedPlain}>
                    {trip.included.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {trip.extras && trip.extras.length > 0 && (
                <>
                  <h5 className={styles.subTitle}>{ui.extras}</h5>
                  <ul className={styles.includedPlain}>
                    {trip.extras.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className={styles.block} aria-label={ui.program}>
              <h4 className={styles.blockTitle}>{ui.program}</h4>
              {route.itinerary.summary && (
                <div className={styles.summary}>
                  <p className={styles.summaryTitle}>{route.itinerary.summary.title}</p>
                  <p className={styles.stops}>
                    {route.itinerary.summary.stops.map((stop, i, all) => (
                      <span key={`${stop}-${i}`} className={styles.stop}>
                        {stop}
                        {i < all.length - 1 && <span className={styles.dash}> —</span>}
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {route.itinerary.intro && <p className={styles.intro}>{route.itinerary.intro}</p>}
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

            {(trip.photos.length > 0 || trip.video) && (
              <section className={styles.block} aria-label={ui.photos}>
                <h4 className={styles.blockTitle}>{ui.photosTitle}</h4>
                <div className={styles.gallery}>
                  {trip.photos.map((photo, i) => (
                    <figure key={photo.src}>
                      <button
                        type="button"
                        className={styles.zoom}
                        onClick={() => setPhotoIndex(i)}
                        aria-label={ui.openPhoto(photo.caption ?? photo.alt)}
                      >
                        <img src={withBase(photo.src)} alt={photo.alt} loading="lazy" />
                      </button>
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
            )}

            {tripReviews.length > 0 && (
              <section className={styles.block} aria-label={ui.tripReviewsLabel}>
                <h4 className={styles.blockTitle}>{ui.tripReviews}</h4>
                <div className={styles.reviews}>
                  {tripReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onOpen={() => setOpenReview({ review, index: 0 })}
                    />
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
                aria-label={ui.writeTelegramAbout(contacts.telegramLabel, trip.geo)}
              >
                {ui.writeTelegram}
              </Button>
              <p className={styles.ctaNote}>
                {ui.replyNote}
              </p>
            </footer>
          </div>
          <button
            type="button"
            data-autofocus
            className={styles.close}
            onClick={onClose}
            aria-label={ui.closeDialog}
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <Lightbox photos={trip?.photos ?? []} index={photoIndex} onChange={setPhotoIndex} />
      <Lightbox
        photos={openReview ? reviewScreens(openReview.review) : []}
        index={openReview?.index ?? null}
        onChange={(index) =>
          setOpenReview(openReview && index !== null ? { ...openReview, index } : null)
        }
      />
    </Modal>
  )
}
