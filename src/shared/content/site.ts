import type { ChronicleContent, SiteContent } from './schema'
import siteJson from '../../../content/site.json'
import chronicleJson from '../../../content/chronicle.json'

export const site = siteJson as SiteContent
export const chronicle = chronicleJson as ChronicleContent
export const contacts = site.contacts
