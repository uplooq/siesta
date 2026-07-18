import { useRef, useState, type KeyboardEvent } from 'react'
import { programs, type ProgramId } from '@/entities/program'
import { Button } from '@/shared/ui/button'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Programs.module.css'

export const Programs = () => {
  const [activeId, setActiveId] = useState<ProgramId>('travel')
  const tabRefs = useRef(new Map<ProgramId, HTMLButtonElement>())

  const focusTab = (index: number) => {
    const next = programs[(index + programs.length) % programs.length]
    setActiveId(next.id)
    tabRefs.current.get(next.id)?.focus()
  }

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusTab(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusTab(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusTab(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusTab(programs.length - 1)
    }
  }

  return (
    <>
      <section className={styles.experiences} aria-labelledby="exp-title">
        <Reveal className={styles.expIntro}>
          <h2 className={cx('display', styles.expTitle)} id="exp-title">
            Два способа выйти в море
          </h2>
          <p>Наведите и выберите — ниже раскроются детали программы.</p>
        </Reveal>
        <Reveal>
          <div className={styles.tablist} role="tablist" aria-label="Программы siesta">
            {programs.map((program, index) => {
              const selected = program.id === activeId
              return (
                <button
                  key={program.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(program.id, el)
                    else tabRefs.current.delete(program.id)
                  }}
                  className={styles.panel}
                  role="tab"
                  id={`tab-${program.id}`}
                  aria-controls={`panel-${program.id}`}
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(program.id)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                >
                  <span
                    className={styles.panelBg}
                    style={{ backgroundImage: `url('${program.cover}')` }}
                  />
                  <span className={styles.panelOverlay} />
                  <span className={styles.panelInner}>
                    <span className={styles.panelEyebrow}>{program.eyebrow}</span>
                    <span className={styles.panelTitle}>{program.title}</span>
                    <span className={styles.panelHint}>{program.hint}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>
      </section>

      <div className={styles.detail}>
        {programs.map((program) => (
          <div
            key={program.id}
            className={cx(styles.detailPanel, program.flip && styles.flip)}
            id={`panel-${program.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${program.id}`}
            tabIndex={0}
            hidden={program.id !== activeId}
          >
            <figure className={styles.detailFigure}>
              <img src={program.detail.image} alt={program.detail.imageAlt} />
              <figcaption>{program.detail.imageCaption}</figcaption>
            </figure>
            <div className={styles.detailCopy}>
              <h3 className={cx('display', styles.detailTitle)}>{program.detail.title}</h3>
              <p>{program.detail.description}</p>
              <ul className={styles.included}>
                {program.detail.included.map((item) => (
                  <li key={item.label}>
                    <span className={styles.k}>{item.label}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.cta}>
                <div className={styles.price}>
                  <span className={styles.p}>{program.detail.price}</span>
                  <span className={styles.u}>{program.detail.priceUnit}</span>
                </div>
                <Button href="#book">Забронировать место</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
