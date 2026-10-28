import { contacts, site } from '@/shared/content'
import { Button } from '@/shared/ui/button'
import { Kicker } from '@/shared/ui/kicker'
import { cx } from '@/shared/lib/cx'
import styles from './Hero.module.css'

const copy = site.hero

export const Hero = () => (
  <section className={styles.hero} id="top" aria-labelledby="hero-title">
    <div className={styles.brand}>{site.brand}</div>
    <div className={styles.content}>
      <Kicker className={styles.kicker}>{copy.kicker}</Kicker>
      <h1 className={cx('display', styles.title)} id="hero-title">
        {copy.title.map((line) => (
          <span key={line} className={styles.line}>
            {line}
          </span>
        ))}
      </h1>
      <p className={styles.lead}>{copy.lead}</p>
      <Button
        href={contacts.telegram}
        target="_blank"
        rel="noopener"
        className={styles.cta}
        aria-label={`${copy.cta}: написать Софе в Telegram ${contacts.telegramLabel}`}
      >
        {copy.cta}
        <span aria-hidden="true">↗</span>
      </Button>
    </div>
  </section>
)
