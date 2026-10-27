import { site } from '@/shared/content'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Intro.module.css'

const copy = site.intro

export const Intro = () => (
  <section className={styles.intro} aria-labelledby="intro-title">
    <Reveal className={styles.head}>
      <Kicker>{copy.kicker}</Kicker>
      <h2 className={cx('display', styles.title)} id="intro-title">
        {copy.title} <span className={styles.accent}>{copy.titleAccent}</span>
      </h2>
    </Reveal>
    <Reveal className={styles.body} delay={0.1}>
      {copy.lead.map((paragraph) => (
        <p key={paragraph} className="lead">
          {paragraph}
        </p>
      ))}
    </Reveal>
  </section>
)
