import { site } from '@/shared/content'
import styles from './Hero.module.css'

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.brand}>{site.brand}</div>
  </section>
)
