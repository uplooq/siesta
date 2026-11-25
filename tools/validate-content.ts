// Проверка JSON-контента по zod-схемам. Используется Vite-плагином при сборке
// и в dev, а также как отдельная команда `npm run check:content`.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { contentCollections } from '../src/shared/content/schema.ts'

export interface ContentIssue {
  file: string
  message: string
}

const listJson = (dir: string): string[] => {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => join(dir, name))
}

const validateLocale = (contentDir: string, prefix = ''): ContentIssue[] => {
  const issues: ContentIssue[] = []
  const seenIds = new Map<string, Set<string>>()

  for (const [pattern, schema] of Object.entries(contentCollections)) {
    const files = pattern.endsWith('/*.json')
      ? listJson(join(contentDir, pattern.replace('/*.json', '')))
      : [join(contentDir, pattern)]
    const collection = pattern.split('/')[0]
    const ids = seenIds.get(collection) ?? new Set<string>()
    seenIds.set(collection, ids)

    for (const file of files) {
      const rel = prefix + relative(contentDir, file)
      let data: unknown
      try {
        data = JSON.parse(readFileSync(file, 'utf8'))
      } catch (e) {
        issues.push({ file: rel, message: `невалидный JSON: ${(e as Error).message}` })
        continue
      }
      const result = schema.safeParse(data)
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({ file: rel, message: `${issue.path.join('.') || '(корень)'}: ${issue.message}` })
        }
        continue
      }
      const id = (result.data as { id?: string }).id
      if (id) {
        if (ids.has(id)) issues.push({ file: rel, message: `id «${id}» уже занят другим файлом` })
        ids.add(id)
      }
    }
  }
  return issues
}

// Переводы лежат в content/<язык>/ с той же структурой файлов, что и русский контент.
const LOCALES = ['en']

const relFiles = (contentDir: string): string[] =>
  Object.keys(contentCollections).flatMap((pattern) =>
    pattern.endsWith('/*.json')
      ? listJson(join(contentDir, pattern.replace('/*.json', ''))).map((f) => relative(contentDir, f))
      : [pattern],
  )

export const validateContent = (contentDir: string): ContentIssue[] => {
  const issues = validateLocale(contentDir)
  for (const locale of LOCALES) {
    const dir = join(contentDir, locale)
    issues.push(...validateLocale(dir, `${locale}/`))
    const base = new Set(relFiles(contentDir))
    const translated = new Set(relFiles(dir))
    for (const file of base) {
      if (!translated.has(file)) issues.push({ file: `${locale}/${file}`, message: 'нет перевода этого файла' })
    }
    for (const file of translated) {
      if (!base.has(file)) issues.push({ file: `${locale}/${file}`, message: 'нет русского оригинала' })
    }
  }
  return issues
}

export const formatIssues = (issues: ContentIssue[]) =>
  issues.map((i) => `  content/${i.file}: ${i.message}`).join('\n')
