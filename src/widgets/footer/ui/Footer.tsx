import { reviews } from '@/entities/review'
import { withBase } from '@/shared/lib/withBase'
import styles from './Footer.module.css'

const nav = [
  { href: '#travel', label: 'Путешествия' },
  { href: '#race', label: 'Гонки' },
  { href: '#intro-title', label: 'О нас' },
  { href: '#chronicle', label: 'Фотоотчёты' },
  { href: '#captains', label: 'Капитаны' },
  ...(reviews.length > 0 ? [{ href: '#reviews', label: 'Отзывы' }] : []),
  { href: withBase('/map/'), label: 'Карта' },
  { href: '#book', label: 'Связаться' },
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
