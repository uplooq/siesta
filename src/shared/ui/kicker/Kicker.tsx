import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Kicker.module.css'

interface KickerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const Kicker = ({ children, className, style }: KickerProps) => (
  <span className={cx(styles.kicker, className)} style={style}>
    {children}
  </span>
)
