import { collect } from '@/shared/content/collection'
import type { CaptainContent } from '@/shared/content/schema'

export type Captain = CaptainContent

export const captains: Captain[] = collect<CaptainContent>(
  import.meta.glob('/content/captains/*.json', { eager: true, import: 'default' }),
)
