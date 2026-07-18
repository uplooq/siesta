import type { Route } from '@/entities/route'
import { Modal } from '@/shared/ui/modal'
import { RouteMap } from './RouteMap'
import styles from './ItineraryDialog.module.css'

interface ItineraryDialogProps {
  route: Route | null
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

export const ItineraryDialog = ({ route, onClose }: ItineraryDialogProps) => (
  <Modal
    open={route !== null}
    onClose={onClose}
    label={route ? `Программа по дням: ${route.title}` : 'Программа по дням'}
    className={styles.dialog}
  >
    {route && (
      <div className={styles.frame}>
        <div className={styles.mapCol}>
          <RouteMap route={route} />
        </div>
        <div className={styles.scroll}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              {route.title} · {route.chipMeta}
            </p>
            <h3 className={styles.title}>{route.itinerary.title}</h3>
            <p className={styles.intro}>{route.itinerary.intro}</p>
          </header>
          <ol className={styles.days}>
            {route.itinerary.days.map((day) => (
              <li key={day.label}>
                <span className={styles.dayLabel}>{day.label}</span>
                <div className={styles.dayBody}>
                  <h4>{day.title}</h4>
                  <p>{day.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{route.itinerary.note}</p>
        </div>
        <button
          type="button"
          data-autofocus
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть программу"
        >
          <CloseIcon />
        </button>
      </div>
    )}
  </Modal>
)
