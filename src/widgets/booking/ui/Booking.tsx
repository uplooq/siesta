import { useSelectedTrip } from '@/entities/trip'
import { contacts, site } from '@/shared/content'
import { Button } from '@/shared/ui/button'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Booking.module.css'

const CompassRose = () => (
  <svg className={styles.compass} viewBox="0 0 200 200" aria-hidden="true" fill="currentColor">
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="100" cy="100" r="94" />
      <circle cx="100" cy="100" r="64" />
    </g>
    <g opacity="0.55">
      <path d="M148 52 L102 98 L98 94 Z" />
      <path d="M52 52 L98 98 L102 94 Z" />
      <path d="M148 148 L98 102 L102 106 Z" />
      <path d="M52 148 L102 102 L98 106 Z" />
    </g>
    <path d="M100 12 L106 100 L94 100 Z" />
    <path d="M100 188 L106 100 L94 100 Z" />
    <path d="M12 100 L100 106 L100 94 Z" />
    <path d="M188 100 L100 106 L100 94 Z" />
    <circle cx="100" cy="100" r="4" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.6l-2.9 13.7c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.24.24-.44.44-.9.44l.32-4.6L18.3 6.8c.37-.33-.08-.5-.56-.18L7.4 13.1l-4.4-1.4c-.96-.3-.98-.96.2-1.42l17.2-6.6c.8-.3 1.5.18 1.5 1.32z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3.6 20.4l1.2-3.9a8.6 8.6 0 1 1 3.3 3z" strokeLinejoin="round" />
    <path
      fill="currentColor"
      stroke="none"
      d="M9.2 7.6c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .6-.3 1.3-.9 1.6-.6.3-1.5.4-2.9-.2-1.6-.7-2.9-2-3.7-3.5-.6-1.2-.5-2.1-.1-2.8z"
    />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
  </svg>
)

const copy = site.booking

export const Booking = () => {
  const { harbor } = useSelectedTrip()
  const log = [
    { label: 'Порт приписки', value: harbor.port },
    { label: 'Координаты', value: harbor.coords, coord: true },
    { label: 'Навигация', value: harbor.season },
    { label: 'На борту', value: harbor.crew },
  ]

  return (
    <section className={styles.book} id="book" aria-labelledby="book-title">
      <CompassRose />
      <div className={styles.inner}>
        <Reveal>
          <Kicker style={{ color: 'var(--coral)' }}>{copy.kicker}</Kicker>
          <h2 className={cx('display', styles.title)} id="book-title">
            {copy.title}
          </h2>
          <p className={cx('lead', styles.lead)}>{copy.lead}</p>
          <div className={styles.log}>
            {log.map((row) => (
              <div key={row.label}>
                <span className={styles.lbl}>{row.label}</span>
                <span className={cx(styles.val, row.coord && styles.coord)}>{row.value}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.manifest} delay={0.1} id="contact">
          <div className={styles.manifestHead}>
            <h3>{copy.contactTitle}</h3>
            <span className={styles.tag}>{copy.contactTag}</span>
          </div>
          <p className={styles.manifestLead}>{copy.contactLead}</p>
          <div className={styles.tgRow}>
            <Button
              href={contacts.telegram}
              target="_blank"
              rel="noopener"
              className={styles.tg}
              aria-label={`${copy.telegramCtaSofia} в Telegram ${contacts.telegramLabel}`}
            >
              <TelegramIcon />
              {copy.telegramCtaSofia}
            </Button>
            <Button
              href={contacts.telegramIgor}
              target="_blank"
              rel="noopener"
              className={styles.tg}
              aria-label={`${copy.telegramCtaIgor} в Telegram ${contacts.telegramIgorLabel}`}
            >
              <TelegramIcon />
              {copy.telegramCtaIgor}
            </Button>
          </div>
          <div className={styles.sub}>
            <a
              className={styles.contactBtn}
              href={contacts.whatsapp}
              target="_blank"
              rel="noopener"
              aria-label="Написать в WhatsApp"
            >
              <span className={styles.ci} aria-hidden="true">
                <WhatsAppIcon />
              </span>
              WhatsApp
            </a>
            <a
              className={styles.contactBtn}
              href={contacts.instagram}
              target="_blank"
              rel="noopener"
              aria-label={`Открыть Instagram ${contacts.instagramLabel}`}
            >
              <span className={styles.ci} aria-hidden="true">
                <InstagramIcon />
              </span>
              Instagram
            </a>
          </div>
          <p className={styles.note}>{harbor.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
