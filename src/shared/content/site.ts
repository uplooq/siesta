import type { ChronicleContent, SiteContent } from './schema'
import { byLang } from '../i18n'
import siteJson from '../../../content/site.json'
import chronicleJson from '../../../content/chronicle.json'
import siteEnJson from '../../../content/en/site.json'
import chronicleEnJson from '../../../content/en/chronicle.json'

// Английская версия лежит в content/en/ с той же структурой файлов
export const site = byLang(siteJson, siteEnJson) as SiteContent
export const chronicle = byLang(chronicleJson, chronicleEnJson) as ChronicleContent
export const contacts = site.contacts
