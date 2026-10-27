// Схемы контента. Единственный источник правды для JSON-файлов в /content:
// по ним Vite-плагин проверяет файлы при сборке, из них выводятся TS-типы.
// Из кода приложения импортировать ТОЛЬКО типы (import type), чтобы zod
// не попадал в бандл.
import { z } from 'zod'

const text = z.string().trim().min(1)
const sitePath = z.string().regex(/^\/[^\s]+$/, 'путь от корня сайта, например /photos/x.webp')

export const photoSchema = z.object({
  src: sitePath,
  alt: text,
  caption: text.optional(),
})

export const tripGroupSchema = z.enum(['travel', 'race'])

export const itineraryDaySchema = z.object({
  label: text,
  title: text,
  text: text,
})

export const itinerarySchema = z.object({
  title: text,
  intro: text,
  days: z.array(itineraryDaySchema),
  note: text,
})

export const routeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: text,
  duration: text,
  extent: text,
  mapCaption: text,
  mapImage: sitePath.optional(),
  mapImageAlt: text.optional(),
  mapPoints: z
    .array(z.object({ ll: z.tuple([z.number(), z.number()]), caption: text.optional() }))
    .optional(),
  mapClosed: z.boolean().optional(),
  itinerary: itinerarySchema,
})

export const departureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  dates: text,
  routeId: z.string(),
})

export const harborSchema = z.object({
  port: text,
  coords: text,
  season: text,
  crew: text,
  note: text,
})

export const tripSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    order: z.number(),
    published: z.boolean().default(true),
    group: tripGroupSchema,
    geo: text,
    year: text,
    price: text,
    priceUnit: z.string(),
    priceNote: text.optional(),
    tagline: text,
    cover: sitePath,
    coverAlt: text,
    photos: z.array(photoSchema),
    included: z.array(text).optional(),
    video: z.object({ href: z.string().url(), label: text }).optional(),
    reviewIds: z.array(z.string()).default([]),
    harbor: harborSchema,
    routes: z.array(routeSchema).min(1),
    departures: z.array(departureSchema).min(1),
  })
  .superRefine((trip, ctx) => {
    const routeIds = new Set(trip.routes.map((r) => r.id))
    trip.departures.forEach((d, i) => {
      if (!routeIds.has(d.routeId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['departures', i, 'routeId'],
          message: `нет маршрута «${d.routeId}» в routes`,
        })
      }
    })
  })

export const programSchema = z.object({
  id: tripGroupSchema,
  order: z.number(),
  eyebrow: text,
  title: text,
  hint: text,
  cover: sitePath,
  flip: z.boolean(),
  detail: z.object({
    title: text,
    description: text,
    image: sitePath,
    imageAlt: text,
    imageCaption: text,
    included: z.array(z.object({ label: text, text: text })),
    price: text,
    priceUnit: text,
  }),
})

export const captainSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number(),
  name: text,
  role: text,
  bio: text,
  photo: sitePath.optional(),
  photoAlt: text.optional(),
  photoPosition: text.optional(),
  photoRatio: z.number().positive().optional(),
})

export const reviewSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().default(0),
  photo: sitePath,
  photoAlt: text,
  author: text,
  meta: text,
  text: text,
  screenshot: sitePath.optional(),
  screenshotAlt: text.optional(),
})

export const chronicleSchema = z.object({
  photos: z.array(photoSchema.required({ caption: true })),
})

const link = z.object({ href: text, label: text })

export const siteSchema = z.object({
  brand: text,
  contacts: z.object({
    telegram: z.string().url(),
    telegramLabel: text,
    instagram: z.string().url(),
    instagramLabel: text,
  }),
  header: z.object({
    links: z.array(link.extend({ wide: z.boolean().optional() })),
    cta: text,
  }),
  trips: z.object({ kicker: text, title: text, lead: text }),
  intro: z.object({ kicker: text, title: text, titleAccent: text, lead: text }),
  chronicle: z.object({ kicker: text, title: text, lead: text }),
  captains: z.object({
    kicker: text,
    title: text,
    lead: text,
    noteLead: text,
    noteBody: z.array(text),
  }),
  reviews: z.object({ kicker: text, title: text, lead: text }),
  builder: z.object({ title: text, text: text, cta: text, note: text }),
  booking: z.object({
    kicker: text,
    title: text,
    lead: text,
    contactTitle: text,
    contactTag: text,
    contactLead: text,
    telegramCta: text,
  }),
  footer: z.object({
    links: z.array(link),
    copyright: text,
    credits: text,
  }),
})

export type PhotoContent = z.infer<typeof photoSchema>
export type TripContent = z.infer<typeof tripSchema>
export type RouteContent = z.infer<typeof routeSchema>
export type ProgramContent = z.infer<typeof programSchema>
export type CaptainContent = z.infer<typeof captainSchema>
export type ReviewContent = z.infer<typeof reviewSchema>
export type ChronicleContent = z.infer<typeof chronicleSchema>
export type SiteContent = z.infer<typeof siteSchema>

/** Какая схема проверяет какой файл в /content. */
export const contentCollections = {
  'trips/*.json': tripSchema,
  'programs/*.json': programSchema,
  'captains/*.json': captainSchema,
  'reviews/*.json': reviewSchema,
  'chronicle.json': chronicleSchema,
  'site.json': siteSchema,
} as const
