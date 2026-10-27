import { collect } from '@/shared/content/collection'
import type { ProgramContent } from '@/shared/content/schema'

export type Program = ProgramContent
export type ProgramId = Program['id']

export const programs: Program[] = collect<ProgramContent>(
  import.meta.glob('/content/programs/*.json', { eager: true, import: 'default' }),
)
