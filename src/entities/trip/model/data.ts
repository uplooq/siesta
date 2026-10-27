import { collect } from '@/shared/content/collection'
import type { TripContent, RouteContent } from '@/shared/content/schema'

export type TripGroup = TripContent['group']
export type TripRoute = RouteContent
export type TripPhoto = TripContent['photos'][number]
export type TripHarbor = TripContent['harbor']
export type ItineraryDay = RouteContent['itinerary']['days'][number]

export interface Departure {
  id: string
  dates: string
  route: TripRoute
}

/** Путешествие в том виде, в котором его потребляют виджеты:
 *  у каждого выхода уже подставлен объект маршрута. */
export interface Trip extends Omit<TripContent, 'routes' | 'departures'> {
  routes: TripRoute[]
  departures: Departure[]
}

export const tripGroups: { id: TripGroup; label: string; noun: string }[] = [
  { id: 'travel', label: 'Путешествия', noun: 'Путешествие' },
  { id: 'race', label: 'Гонки', noun: 'Регата' },
]

const resolveTrip = (content: TripContent): Trip => {
  const byId = new Map(content.routes.map((route) => [route.id, route]))
  return {
    ...content,
    departures: content.departures.map((d) => {
      const route = byId.get(d.routeId)
      if (!route) throw new Error(`Путешествие «${content.id}»: нет маршрута «${d.routeId}»`)
      return { id: d.id, dates: d.dates, route }
    }),
  }
}

// Каждое путешествие — отдельный файл content/trips/<id>.json.
// Порядок на сайте задаёт поле order, черновики помечаются published: false.
export const trips: Trip[] = collect<TripContent>(
  import.meta.glob('/content/trips/*.json', { eager: true, import: 'default' }),
).map(resolveTrip)
