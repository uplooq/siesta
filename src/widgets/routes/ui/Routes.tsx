import { useState } from 'react'
import { routes, routeGroups } from '@/entities/route'
import { Button } from '@/shared/ui/button'
import { Kicker } from '@/shared/ui/kicker'
import { Reveal } from '@/shared/ui/reveal'
import { cx } from '@/shared/lib/cx'
import { ItineraryDialog } from './ItineraryDialog'
import styles from './Routes.module.css'

const RouteSketch = () => (
  <svg className={styles.builderArt} viewBox="0 0 320 200" aria-hidden="true">
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

export const Routes = () => {
  const [activeId, setActiveId] = useState(routes[0].id)
  const [itineraryId, setItineraryId] = useState<string | null>(null)

  return (
    <section className={styles.route} id="route" aria-labelledby="route-title">
      <Reveal className={styles.head}>
        <Kicker>Маршрут сезона</Kicker>
        <h2 className={cx('display', styles.title)} id="route-title">
          Куда ведёт вода
        </h2>
        <p>
          Под каждую программу — свои нитки. Выберите маршрут: покажем опорные точки, а финальный
          план с датами пришлём при бронировании.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className={styles.select} role="group" aria-label="Выбор маршрута">
          {routeGroups.map((group) => (
            <div key={group.id} className={styles.group}>
              <span className={styles.grpLabel}>{group.label}</span>
              <div className={styles.chips}>
                {routes
                  .filter((route) => route.group === group.id)
                  .map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      className={styles.chip}
                      aria-pressed={route.id === activeId}
                      onClick={() => setActiveId(route.id)}
                    >
                      {route.title} <span className={styles.chipMeta}>{route.chipMeta}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {routes.map((route) => (
        <div key={route.id} className={styles.panel} hidden={route.id !== activeId}>
          <div className={styles.info}>
            <h3>{route.title}</h3>
            <div className={styles.rmeta}>
              <span>{routeGroups.find((g) => g.id === route.group)?.label}</span>
              {route.stats.map((stat) => (
                <span key={`${stat.strong}-${stat.text}`}>
                  <b>{stat.strong}</b> {stat.text}
                </span>
              ))}
            </div>
            <p>{route.description}</p>
            <ul className={styles.legend}>
              {route.legend.map((item) => (
                <li key={item}>
                  <span className={styles.dot} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className={styles.dayBtn}
              aria-haspopup="dialog"
              onClick={() => setItineraryId(route.id)}
            >
              Программа по дням
            </Button>
          </div>
          <figure className={styles.figure}>
            {route.mapImage ? (
              <img src={route.mapImage} alt={route.mapImageAlt ?? route.mapCaption} />
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.pin} aria-hidden="true">
                  📍
                </span>
                <span>{route.mapCaption}</span>
              </div>
            )}
          </figure>
        </div>
      ))}

      <ItineraryDialog
        route={routes.find((r) => r.id === itineraryId) ?? null}
        onClose={() => setItineraryId(null)}
      />

      <Reveal className={styles.builder} delay={0.05}>
        <RouteSketch />
        <div className={styles.builderCopy}>
          <h3 className={cx('display', styles.builderTitle)}>Придумайте свою нитку</h3>
          <p className={styles.builderText}>
            Готовые маршруты — не предел. В конструкторе на карте можно ставить точки, соединять
            переходы и сразу видеть мили. Соберите маршрут мечты и отправьте нам на рассмотрение
            прямо с карты: проверим стоянки, посчитаем дни и вернёмся с датами и ценой.
          </p>
        </div>
        <div className={styles.builderCta}>
          <Button href="/map/">Собрать свой маршрут</Button>
          <p className={styles.builderNote}>Кнопка «Отправить капитанам» уже на карте</p>
        </div>
      </Reveal>
    </section>
  )
}
