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

/** Выбрать значение под язык страницы. */
export const byLang = <T>(ru: T, en: T): T => (lang === 'en' ? en : ru)
