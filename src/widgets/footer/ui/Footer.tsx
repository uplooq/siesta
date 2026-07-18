import { withBase } from '@/shared/lib/withBase'
import styles from './Footer.module.css'

const nav = [
  { href: '#intro-title', label: 'О нас' },
  { href: '#exp-title', label: 'Программы' },
  { href: '#route', label: 'Маршрут' },
  { href: withBase('/map/'), label: 'Карта' },
  { href: '#captains', label: 'Капитаны' },
  { href: '#chron-title', label: 'Хроника' },
  { href: '#book', label: 'Бронирование' },
]

export const Footer = () => (
  <footer className={styles.foot}>
    <div className={styles.inner}>
      <div className={styles.mark}>siesta</div>
      <nav className={styles.nav} aria-label="Разделы">
        {nav.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className={styles.copy}>
        <span>© 2026 siesta · Средиземноморье под парусом</span>
        <span>Фотографии: архив siesta</span>
      </div>
    </div>
  </footer>
)
