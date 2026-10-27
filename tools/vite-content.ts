import type { Plugin } from 'vite'
import { formatIssues, validateContent } from './validate-content.ts'

// При сборке падаем на невалидном контенте; в dev — пишем ошибку в консоль
// при старте и при каждом сохранении файла в /content.
export const contentPlugin = (contentDir: string): Plugin => {
  const check = (fatal: boolean) => {
    const issues = validateContent(contentDir)
    if (issues.length === 0) return
    const text = `Контент не прошёл проверку (${issues.length}):\n${formatIssues(issues)}`
    if (fatal) throw new Error(text)
    console.error(`\n${text}\n`)
  }
  let isBuild = false
  return {
    name: 'siesta-content',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    buildStart() {
      check(isBuild)
    },
    configureServer(server) {
      server.watcher.add(contentDir)
      server.watcher.on('change', (file) => {
        if (file.startsWith(contentDir) && file.endsWith('.json')) check(false)
      })
    },
  }
}
