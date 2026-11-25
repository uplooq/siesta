import { otherLang } from '@/shared/i18n'
import { cx } from '@/shared/lib/cx'
import styles from './LangSwitch.module.css'

interface LangSwitchProps {
  // на тёмном фоне (первый экран, подвал)
  onDark?: boolean
  className?: string
}

/** Ссылка на эту же страницу на другом языке; открытый раздел (якорь) сохраняется. */
export const LangSwitch = ({ onDark, className }: LangSwitchProps) => (
  <a
    className={cx(styles.switch, onDark && styles.onDark, className)}
    href={otherLang.href}
    hrefLang={otherLang.lang}
    lang={otherLang.lang}
    title={otherLang.title}
    aria-label={otherLang.title}
    onClick={(e) => {
      e.currentTarget.href = otherLang.href + window.location.hash
    }}
  >
    {otherLang.label}
  </a>
)
