import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Button.module.css'

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'solid' | 'ghost' | 'outline'
  children: ReactNode
}

export const Button = ({ variant = 'solid', className, children, href, ...rest }: ButtonProps) => {
  const cls = cx(
    styles.btn,
    variant === 'ghost' && styles.ghost,
    variant === 'outline' && styles.outline,
    className,
  )
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
