import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

export const Modal = ({ open, onClose, label, children, className }: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, className)}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
