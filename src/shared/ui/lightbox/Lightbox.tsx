import { useEffect, useRef } from 'react'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Lightbox.module.css'

export interface LightboxPhoto {
  src: string
  alt: string
  caption?: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  // индекс открытого кадра, null — просмотр закрыт
  index: number | null
  onChange: (index: number | null) => void
}

const SWIPE_MIN = 50

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
)

export const Lightbox = ({ photos, index, onChange }: LightboxProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const open = index !== null
  const photo = index !== null ? photos[index] : null

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // соседние кадры грузим заранее, чтобы листание не мигало
  useEffect(() => {
    if (index === null) return
    ;[index - 1, index + 1].forEach((i) => {
      const next = photos[i]
      if (next) new Image().src = withBase(next.src)
    })
  }, [index, photos])

  const go = (step: number) => {
    if (index === null) return
    const next = index + step
    if (next >= 0 && next < photos.length) onChange(next)
  }

  return (
    <dialog
      ref={ref}
      className={styles.lightbox}
      aria-label={photo ? `Фото ${index! + 1} из ${photos.length}` : 'Просмотр фото'}
      // close не всплывает в DOM, но всплывает по дереву React — иначе закроется и карточка под нами
      onClose={(e) => {
        e.stopPropagation()
        onChange(null)
      }}
      onCancel={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target === e.currentTarget.firstElementChild) {
          onChange(null)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) >= SWIPE_MIN) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className={styles.stage}>
        {photo && (
          <figure className={styles.figure}>
            <img key={photo.src} src={withBase(photo.src)} alt={photo.alt} />
            <figcaption className={styles.caption}>
              {photo.caption && <span>{photo.caption}</span>}
              <span className={styles.count}>
                {index! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        )}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => onChange(null)}
        aria-label="Закрыть просмотр"
      >
        <Icon d="M6 6l12 12M18 6L6 18" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={cx(styles.nav, styles.prev)}
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Предыдущее фото"
          >
            <Icon d="M15 6l-6 6 6 6" />
          </button>
          <button
            type="button"
            className={cx(styles.nav, styles.next)}
            onClick={() => go(1)}
            disabled={index === photos.length - 1}
            aria-label="Следующее фото"
          >
            <Icon d="M9 6l6 6-6 6" />
          </button>
        </>
      )}
    </dialog>
  )
}
