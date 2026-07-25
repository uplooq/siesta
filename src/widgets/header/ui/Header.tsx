import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { cx } from '@/shared/lib/cx'
import styles from './Header.module.css'

const links = [
  { href: '#travel', label: 'Путешествия' },
  { href: '#race', label: 'Гонки' },
  { href: '#builder', label: 'Маршруты', wide: true },
  { href: '#chronicle', label: 'Фотоотчёты', wide: true },
]

export const Header = () => {
  const [shown, setShown] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setShown(window.scrollY > window.innerHeight * 0.72)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <header className={cx(styles.header, shown && styles.shown)}>
      <div className={styles.inner}>
        <a className={styles.brand} href="#top" aria-label="siesta — к началу страницы">
          siesta
        </a>
        <nav className={styles.nav} aria-label="Разделы сайта">
          {links.map((link) => (
            <a
              key={link.href}
              className={cx(styles.link, link.wide && styles.wide)}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button href="#book" className={styles.cta}>
          Связаться
        </Button>
      </div>
    </header>
  )
}
