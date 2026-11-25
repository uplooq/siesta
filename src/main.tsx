import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import { redirecting } from '@/shared/i18n'

// при автопереходе на /en/ русскую страницу не рисуем, чтобы она не мелькала
if (!redirecting) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
