import type { Review } from '@/entities/review'
import { Modal } from '@/shared/ui/modal'
import styles from './ReviewDialog.module.css'

interface ReviewDialogProps {
  review: Review | null
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

export const ReviewDialog = ({ review, onClose }: ReviewDialogProps) => (
  <Modal
    open={review !== null}
    onClose={onClose}
    label={review ? `Отзыв гостя: ${review.author}` : 'Отзыв гостя'}
  >
    {review && (
      <div className={styles.layout}>
        <figure className={styles.photo}>
          <img src={review.photo} alt={review.photoAlt} />
        </figure>
        <div className={styles.body}>
          <header className={styles.header}>
            <h3 className={styles.author}>{review.author}</h3>
            <p className={styles.meta}>{review.meta}</p>
          </header>
          <p className={styles.text}>«{review.text}»</p>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть отзыв"
        >
          <CloseIcon />
        </button>
      </div>
    )}
  </Modal>
)
