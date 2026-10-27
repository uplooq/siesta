import { reviews } from '@/entities/review'
import { site } from '@/shared/content'
import { withBase } from '@/shared/lib/withBase'
import styles from './Footer.module.css'

// Ссылка на отзывы скрывается, пока отзывов нет; абсолютные пути получают base.
const nav = site.footer.links
  .filter((link) => link.href !== '#reviews' || reviews.length > 0)
  .map((link) => (link.href.startsWith('/') ? { ...link, href: withBase(link.href) } : link))

export const Footer = () => (
  <footer className={styles.foot}>
    <div className={styles.inner}>
      <div className={styles.mark}>{site.brand}</div>
      <nav className={styles.nav} aria-label="Разделы">
        {nav.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className={styles.copy}>
        <span>{site.footer.copyright}</span>
        <span>{site.footer.credits}</span>
      </div>
    </div>
  </footer>
)
