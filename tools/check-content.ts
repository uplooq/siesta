import { fileURLToPath } from 'node:url'
import { formatIssues, validateContent } from './validate-content.ts'

const contentDir = fileURLToPath(new URL('../content', import.meta.url))
const issues = validateContent(contentDir)
if (issues.length > 0) {
  console.error(`Контент не прошёл проверку (${issues.length}):\n${formatIssues(issues)}`)
  process.exit(1)
}
console.log('Контент в порядке')
