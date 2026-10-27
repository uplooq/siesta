import type { CSSProperties } from 'react'
import { captains } from '@/entities/captain'
import { site } from '@/shared/content'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Captains.module.css'

const copy = site.captains

export const Captains = () => (
  <section className={styles.captains} id="captains" aria-labelledby="captains-title">
    <div className={styles.inner}>
      <Reveal className={styles.head}>
        <Kicker>{copy.kicker}</Kicker>
        <h2 className={cx('display', styles.title)} id="captains-title">
          {copy.title}
        </h2>
        <p>{copy.lead}</p>
      </Reveal>

      <div className={styles.rows}>
        {captains.map((captain, index) => (
          <Reveal
            key={captain.id}
            className={cx(styles.row, index % 2 === 1 && styles.flip)}
            delay={0.05}
          >
            <figure
              className={styles.photo}
              style={
                captain.photoRatio
                  ? ({ '--photo-ratio': captain.photoRatio } as CSSProperties)
                  : undefined
              }
            >
              {captain.photo ? (
                <img
                  src={withBase(captain.photo)}
                  alt={captain.photoAlt ?? captain.name}
                  loading="lazy"
                  style={captain.photoPosition ? { objectPosition: captain.photoPosition } : undefined}
                />
              ) : (
                <div className={styles.photoFallback}>фото капитана</div>
              )}
            </figure>
            <div className={styles.copy}>
              <h3>{captain.name}</h3>
              <span className={styles.role}>{captain.role}</span>
              <p>{captain.bio}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className={styles.note} delay={0.1}>
        <p className={styles.noteLead}>
          {copy.noteLead} <span aria-hidden="true">🌊</span>
        </p>
        <div className={styles.noteBody}>
          {copy.noteBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
)
