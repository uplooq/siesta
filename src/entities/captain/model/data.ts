import { collect } from '@/shared/content/collection'
import type { CaptainContent } from '@/shared/content/schema'
import { byLang } from '@/shared/i18n'

export type Captain = CaptainContent

export const captains: Captain[] = collect<CaptainContent>(
  byLang(
    import.meta.glob('/content/captains/*.json', { eager: true, import: 'default' }),
    import.meta.glob('/content/en/captains/*.json', { eager: true, import: 'default' }),
  ),
)
