import { Button } from '@/shared/ui/button'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { withBase } from '@/shared/lib/withBase'
import styles from './Builder.module.css'

const RouteSketch = () => (
  <svg className={styles.art} viewBox="0 0 320 200" aria-hidden="true">
    <path
      d="M20 160 C 90 40, 200 190, 300 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="1 10"
      strokeLinecap="round"
    />
    <circle cx="20" cy="160" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="149" cy="112" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="300" cy="50" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export const Builder = () => (
  <section className={styles.wrap} id="builder" aria-labelledby="builder-title">
    <Reveal className={styles.builder}>
      <RouteSketch />
      <div className={styles.copy}>
        <h2 className={cx('display', styles.title)} id="builder-title">
          Придумайте свою нитку
        </h2>
        <p className={styles.text}>
          Готовые маршруты — не предел. В конструкторе на карте можно ставить точки, соединять
          переходы и сразу видеть мили. Соберите маршрут мечты и отправьте нам на рассмотрение
          прямо с карты: проверим стоянки, посчитаем дни и вернёмся с датами и ценой.
        </p>
      </div>
      <div className={styles.cta}>
        <Button href={withBase('/map/')}>Собрать свой маршрут</Button>
        <p className={styles.note}>Кнопка «Отправить капитанам» уже на карте</p>
      </div>
    </Reveal>
  </section>
)
