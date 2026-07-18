import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import styles from './Intro.module.css'

const stats = [
  { num: '8', label: 'гостей на борту, не больше' },
  { num: '5–12', label: 'дней в море' },
  { num: '2', label: 'капитана в каждом выходе' },
]

export const Intro = () => (
  <section className={styles.intro} aria-labelledby="intro-title">
    <Reveal className={styles.head}>
      <Kicker>Средиземноморье под парусом</Kicker>
      <h2 className={cx('display', styles.title)} id="intro-title">
        Море задаёт ритм, <span className={styles.accent}>а не расписание</span>
      </h2>
    </Reveal>
    <Reveal className={styles.body} delay={0.1}>
      <p className="lead">
        siesta — это авторские выходы под парусом для тех, кому важно не количество точек на
        карте, а качество тишины между ними. Небольшие команды, живой контакт с морем и два
        капитана, которые знают побережье наизусть.
      </p>
      <div className={styles.meta}>
        {stats.map((s) => (
          <div key={s.label}>
            <span className={styles.num}>{s.num}</span>
            <span className={styles.lbl}>{s.label}</span>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
)
