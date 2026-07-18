import { Reveal } from '@/shared/ui/reveal'
import styles from './Voice.module.css'

export const Voice = () => (
  <section className={styles.voice} aria-label="Отзыв гостя">
    <Reveal>
      <blockquote className={styles.quote}>
        «Засыпали под плеск воды у борта, просыпались от запаха кофе с камбуза. Телефон так и
        остался разряженным до самой марины.»
        <cite className={styles.cite}>Игорь и Софа</cite>
      </blockquote>
    </Reveal>
  </section>
)
