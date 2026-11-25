// Язык страницы задаёт её HTML: index.html — <html lang="ru">, en/index.html — <html lang="en">.
// Читаем его один раз при загрузке: переключение языка — это переход на другую страницу.
export type Lang = 'ru' | 'en'

export const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'ru'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Адрес этой же страницы на другом языке (якорь добавляется при клике). */
export const otherLang: { lang: Lang; label: string; href: string; title: string } =
  lang === 'en'
    ? { lang: 'ru', label: 'RU', href: `${base}/`, title: 'Русская версия' }
    : { lang: 'en', label: 'EN', href: `${base}/en/`, title: 'English version' }

const STORAGE_KEY = 'siesta-lang'

/** Запомнить язык, который посетитель выбрал сам: автопереход его больше не трогает. */
export const rememberLang = (chosen: Lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, chosen)
  } catch {
    // хранилище недоступно (приватный режим) — просто не запоминаем
  }
}

// Языки, для которых оставляем русскую версию
const RU_AUDIENCE = ['ru', 'uk', 'be', 'kk', 'ky', 'uz', 'tg', 'tk', 'hy', 'az', 'ka', 'mo']

const wantsEnglish = (): boolean => {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    // нет доступа к хранилищу — решаем по языку браузера
  }
  if (stored === 'en' || stored === 'ru') return stored === 'en'
  // поисковых роботов не перекидываем: русская страница должна индексироваться как русская
  if (/bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent)) return false
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  return !preferred.some((l) => RU_AUDIENCE.includes(l.toLowerCase().split('-')[0]))
}

/** Автопереход: с русской главной на /en/, если браузер не на русском или языке СНГ
 *  (или посетитель раньше сам выбрал английский). С английской страницы никуда не уводим —
 *  прямая ссылка на /en/ всегда открывает /en/. */
export const redirecting = lang === 'ru' && wantsEnglish()

if (redirecting) {
  window.location.replace(`${base}/en/${window.location.search}${window.location.hash}`)
}

/** Выбрать значение под язык страницы. */
export const byLang = <T>(ru: T, en: T): T => (lang === 'en' ? en : ru)
