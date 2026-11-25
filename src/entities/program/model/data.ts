import { collect } from '@/shared/content/collection'
import type { ProgramContent } from '@/shared/content/schema'
import { byLang } from '@/shared/i18n'

export type Program = ProgramContent
export type ProgramId = Program['id']

export const programs: Program[] = collect<ProgramContent>(
  byLang(
    import.meta.glob('/content/programs/*.json', { eager: true, import: 'default' }),
    import.meta.glob('/content/en/programs/*.json', { eager: true, import: 'default' }),
  ),
)
