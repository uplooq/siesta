import { useSelectedTrip } from '@/entities/trip'
import { contacts } from '@/shared/config/contacts'
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

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2.6" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
  </svg>
)

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
          <Kicker style={{ color: 'var(--coral)' }}>Курс проложен</Kicker>
          <h2 className={cx('display', styles.title)} id="book-title">
            Занять место на борту
          </h2>
          <p className={cx('lead', styles.lead)}>
            Напишите нам — сверим даты, подберём борт и маршрут под вашу команду. Мест в сезоне
            немного, экипажи маленькие, и это принципиально.
          </p>
          <div className={styles.log}>
            {log.map((row) => (
              <div key={row.label}>
                <span className={styles.lbl}>{row.label}</span>
                <span className={cx(styles.val, row.coord && styles.coord)}>{row.value}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className={styles.manifest} delay={0.1}>
          <div className={styles.manifestHead}>
            <h3>Связаться</h3>
            <span className={styles.tag}>Прямой контакт</span>
          </div>
          <p className={styles.manifestLead}>
            Быстрее всего — в Telegram: ответим в течение дня, обсудим даты и подберём маршрут под
            вашу компанию.
          </p>
          <Button
            href={contacts.telegram}
            target="_blank"
            rel="noopener"
            className={styles.tg}
            aria-label={`Написать в Telegram ${contacts.telegramLabel}`}
          >
            <TelegramIcon />
            Написать в Telegram
          </Button>
          <div className={styles.sub} aria-label="Другие контакты">
            <a
              className={styles.contactBtn}
              href={`mailto:${contacts.email}`}
              aria-label={`Написать на почту ${contacts.email}`}
            >
              <span className={styles.ci} aria-hidden="true">
                <MailIcon />
              </span>
              Почта
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
