export type TripGroup = 'travel' | 'race'

export interface ItineraryDay {
  label: string
  title: string
  text: string
}

export interface TripItinerary {
  title: string
  intro: string
  days: ItineraryDay[]
  note: string
}

export interface TripPoint {
  ll: [number, number]
  caption?: string
}

export interface TripPhoto {
  src: string
  alt: string
  caption?: string
}

export interface TripRoute {
  name: string
  duration: string
  extent: string
  legend: string[]
  mapCaption: string
  mapImage?: string
  mapImageAlt?: string
  mapPoints: TripPoint[]
  mapClosed?: boolean
  itinerary: TripItinerary
}

export interface Departure {
  id: string
  dates: string
  route: TripRoute
}

export interface TripHarbor {
  port: string
  coords: string
  season: string
  crew: string
  note: string
}

export interface Trip {
  id: string
  group: TripGroup
  geo: string
  year: string
  price: string
  priceUnit: string
  priceNote?: string
  tagline: string
  cover: string
  coverAlt: string
  photos: TripPhoto[]
  video?: { href: string; label: string }
  reviewIds: string[]
  harbor: TripHarbor
  departures: Departure[]
}

export const tripGroups: { id: TripGroup; label: string; noun: string }[] = [
  { id: 'travel', label: 'Путешествия', noun: 'Путешествие' },
  { id: 'race', label: 'Гонки', noun: 'Регата' },
]

const travelLegend = ['Порт старта и финиша', 'Стоянки и бухты для купания', 'Точки схода на берег']

const breezeItinerary: TripItinerary = {
  title: 'Неделя «Осеннего бриза», день за днём',
  intro:
    'Нитка идёт из Гёчека на запад к Дальяну и возвращается восточными бухтами. Порядок стоянок зависит от ветра и настроения команды.',
  days: [
    {
      label: 'День 1',
      title: 'Посадка в Гёчеке',
      text: 'Встречаемся в марине после обеда: размещение по каютам, знакомство с лодкой и брифинг по безопасности. Вечером первый ужин всей командой и планы на неделю.',
    },
    {
      label: 'День 2',
      title: 'Бухта Сарсала',
      text: 'Короткий переход на юг залива: якорная стоянка в Сарсале, купание в бирюзовой воде и обед на борту. Вечером тихий берег и звёзды.',
    },
    {
      label: 'День 3',
      title: 'Дальян',
      text: 'Самый длинный переход недели — на запад, к Дальяну. По пути открытое море и ветер, вечером прогулка по берегу и ужин в ресторане.',
    },
    {
      label: 'Дни 4–5',
      title: 'Олюдениз и Гемилер',
      text: 'Возвращаемся восточными бухтами: знаменитая лагуна Олюдениз и остров Гемилер с византийскими руинами. Купания, прогулки и закаты, о которых потом рассказывают.',
    },
    {
      label: 'День 6',
      title: 'Бойнуз Боку',
      text: 'Тихая сосновая бухта на входе в залив Гёчек — последняя стоянка нитки. Долгое купание, кофе на палубе и прощальный ужин.',
    },
    {
      label: 'День 7',
      title: 'Высадка',
      text: 'Завтрак на борту, неспешный переход в марину Гёчека, сборы и высадка до полудня. Помогаем с трансфером и делимся фотографиями недели.',
    },
  ],
  note: 'Расписание живое: море и прогноз могут поменять порядок дней, но не сам отдых.',
}

const breezeRoute2609: TripRoute = {
  name: 'Осенний бриз',
  duration: '7 дней',
  extent: '6 стоянок',
  legend: travelLegend,
  mapCaption: 'Карта маршрута «Осенний бриз»',
  mapImage: '/routes/osenniy-briz-1010.png',
  mapImageAlt:
    'Схема маршрута «Осенний бриз»: Гёчек — Сарсала — Дальян — Олюдениз — Гемилер — Бойнуз Боку',
  mapPoints: [],
  itinerary: breezeItinerary,
}

const breezeRoute1010: TripRoute = {
  ...breezeRoute2609,
  mapImage: '/routes/osenniy-briz-1010.png',
}

const pendingRoute: TripRoute = {
  name: 'Шьётся',
  duration: '7 дней',
  extent: 'нитка уточняется',
  legend: travelLegend,
  mapCaption: 'Нитку этой недели ещё шьём',
  mapPoints: [],
  itinerary: {
    title: 'Программа этой недели готовится',
    intro:
      'Нитку этой недели капитаны сейчас шьют: сверяют прогноз, бухты и стоянки. Программу по дням пришлём при бронировании.',
    days: [],
    note: 'Всё остальное без изменений: неделя в море, до 8 гостей и два капитана на борту.',
  },
}

const koChangRoute: TripRoute = {
  name: 'Новогодний Таиланд',
  duration: '12 стоянок',
  extent: '8 островов',
  legend: travelLegend,
  mapCaption: 'Карта маршрута «Новогодний Таиланд»',
  mapImage: '/routes/ko-chang.png',
  mapImageAlt:
    'Схема маршрута «Новогодний Таиланд»: Ко Чанг — Ко Нгам — Ко Вай — Ко Ранг — Ко Мак — Ко Кхам — Ко Куд — Ао Салат — Банг Бао — Ко Май Си',
  mapPoints: [],
  itinerary: {
    title: 'Нитка по архипелагу Ко Чанг',
    intro:
      'Кольцо по островам Сиамского залива: старт от Ко Чанга, дальше Ко Нгам, Ко Вай и заповедный Ко Ранг, затем Ко Мак с соседним Ко Кхамом и длинный южный отрезок к Ко Куду — бухта Ао Салат, Банг Бао и Ко Май Си. Возвращаемся тем же архипелагом на север.',
    days: [],
    note: 'Программу по дням и даты выхода пришлём при бронировании.',
  },
}

const raceLegend = ['Линия старта', 'Поворотные знаки', 'Финиш и хронометраж']

const mirwRoute: TripRoute = {
  name: 'Marmaris Race Week',
  duration: '7 дней',
  extent: '2 тренировочных + 5 гоночных',
  legend: raceLegend,
  mapCaption: 'Дистанции недели — залив Мармарис, карту готовим',
  mapPoints: [],
  itinerary: {
    title: 'Неделя Marmaris Race Week, день за днём',
    intro:
      '37-я международная регата Marmaris International Race Week: неделя в акватории залива Мармарис, около 150–200 яхт и участники со всего мира. Идём на гоночной яхте: в экипаже три профессионала, остальные — любители, которые уже ходят под парусом.',
    days: [
      {
        label: 'Дни 1–2',
        title: 'Тренировки',
        text: 'Два полных дня на воде: осваиваем гоночную яхту, распределяем роли, отрабатываем постановку парусов и слаживаем экипаж перед стартами.',
      },
      {
        label: 'Дни 3–7',
        title: 'Гоночные дни',
        text: 'Пять зачётных дней в трёх форматах: inshore — дистанционные гонки в заливе Мармариса, coastal — короткие маршрутные гонки вдоль побережья и offshore — длинная гонка на 35 или 50 морских миль.',
      },
    ],
    note: 'Наши цели: отлично провести время, научить любителей работать с большой яхтой и побороться за призовые места. Яхту бронируем примерно за три месяца до старта. Жить можно на яхте, но удобнее снять гостиницу или дом всей командой на берегу.',
  },
}

export const trips: Trip[] = [
  {
    id: 'gocek',
    group: 'travel',
    geo: 'Гёчек, Турция',
    year: '2026',
    price: '1 350 €',
    priceUnit: 'за гостя',
    priceNote: 'плюс ~300 € на стоянки в маринах, топливо и еду',
    tagline:
      'Сосновые бухты залива Гёчек и цепочка островов: короткие переходы, купания в бирюзовых заводях и стоянки у самого берега.',
    cover: '/photos/covers/marina-sunset.webp',
    coverAlt: 'Розовый закат над мариной Гёчека: сосны на берегу и мачты яхт у причала',
    photos: [
      {
        src: '/photos/covers/marina-sunset.webp',
        alt: 'Розово-сиреневое небо на закате над мариной Гёчека, сосны на переднем плане и мачты яхт у причала',
        caption: 'Закат над мариной Гёчека',
      },
      {
        src: '/photos/turkey/sunset-flags.webp',
        alt: 'Бело-синие флажки вдоль леера яхты, за бортом залив и горы Олюдениза в закатном свете',
        caption: 'Вечер на подходе к Олюденизу',
      },
      {
        src: '/photos/turkey/awning-view.webp',
        alt: 'Вид из-под тента яхты на скалистый мыс и синее море залива',
        caption: 'Переход между бухтами, из-под тента',
      },
      {
        src: '/photos/turkey/hammock-wine.webp',
        alt: 'Гостья отдыхает в гамаке на палубе яхты с бокалом вина, за бортом скалистый берег бухты',
        caption: 'Гамак на палубе, стоянка в бухте',
      },
      {
        src: '/photos/turkey/winch-work.webp',
        alt: 'Капитан в панаме работает со шкотом у лебёдки на кренящейся яхте, за бортом бурун',
        caption: 'Работа с парусами на ходу',
      },
      {
        src: '/photos/turkey/night-mast.webp',
        alt: 'Мачта яхты снизу вверх на фоне звёздного неба с полосой Млечного Пути',
        caption: 'Звёзды над мачтой, ночь на якоре',
      },
      {
        src: '/photos/turkey/swim-platform.webp',
        alt: 'Тиковая корма яхты с купальной лестницей у изумрудной воды, на палубе надувные круги',
        caption: 'Купальная платформа на стоянке',
      },
      {
        src: '/photos/turkey/polaroid.webp',
        alt: 'Полароидный снимок ужина всей команды на палубе, снимок держат в руке над стопперами и бухтами шкотов',
        caption: 'Полароид с ужина на палубе',
      },
    ],
    reviewIds: [],
    harbor: {
      port: 'Гёчек, Турция',
      coords: '36°45′N · 28°57′E',
      season: 'Май — октябрь',
      crew: 'до 8 гостей',
      note: 'Порт приписки — Гёчек, Турция. Навигация с мая по октябрь.',
    },
    departures: [
      { id: 'gocek-1', dates: '26.09–3.10', route: breezeRoute2609 },
      { id: 'gocek-2', dates: '3.10–10.10', route: pendingRoute },
      { id: 'gocek-3', dates: '10.10–17.10', route: breezeRoute1010 },
    ],
  },
  {
    id: 'kochang',
    group: 'travel',
    geo: 'Ко Чанг, Таиланд',
    year: '2026–2027',
    price: 'Цена уточняется',
    priceUnit: '',
    tagline:
      'Новогодняя неделя по архипелагу Сиамского залива: Ко Чанг, заповедный Ко Ранг, тихие Ко Мак и Ко Куд. Тёплая вода в декабре, длинные стоянки и Новый год на палубе.',
    cover: '/photos/thailand/catamaran-aerial.webp',
    coverAlt: 'Белый катамаран на бирюзовой воде, вид сверху',
    photos: [
      {
        src: '/photos/thailand/catamaran-aerial.webp',
        alt: 'Белый катамаран на бирюзово-зелёной глади открытой воды, вид сверху с дрона',
        caption: 'Катамаран на переходе, вид сверху',
      },
      {
        src: '/photos/thailand/pier-palms.webp',
        alt: 'Деревянный пирс уходит в бирюзовое море, кадр снят из-под наклонённых кокосовых пальм',
        caption: 'Пирс на острове, сход на берег',
      },
      {
        src: '/photos/thailand/catamaran-sandbar.webp',
        alt: 'Белый катамаран на якоре у песчаной косы с пальмовым островом на заднем плане',
        caption: 'Стоянка у песчаной косы',
      },
      {
        src: '/photos/thailand/lagoon-aerial.webp',
        alt: 'Вид с дрона на лагуну между зелёными холмами: пальмовая коса отделяет бирюзовую воду от открытого моря',
        caption: 'Лагуна за пальмовой косой, вид с дрона',
      },
    ],
    reviewIds: [],
    harbor: {
      port: 'Ко Чанг, Таиланд',
      coords: '12°03′N · 102°19′E',
      season: 'Новогодняя неделя',
      crew: 'до 8 гостей',
      note: 'Порт старта — Банг Бао, остров Ко Чанг. Новогодний рейс по архипелагу Сиамского залива.',
    },
    departures: [{ id: 'kochang-1', dates: 'даты уточняем', route: koChangRoute }],
  },
  {
    id: 'marmaris',
    group: 'race',
    geo: 'Мармарис, Турция',
    year: '2026',
    price: '150 000 ₽',
    priceUnit: 'за гостя',
    priceNote: 'половина — при бронировании яхты, вторая — на месте',
    tagline:
      '37-я международная Marmaris Race Week: два тренировочных дня, пять гоночных и три формата гонок — от стартов в заливе до offshore на 35–50 миль. Гоночная яхта, три профессионала в экипаже.',
    cover: '/photos/race/heeling.webp',
    coverAlt: 'Гоночная яхта с чёрными парусами идёт в крене, экипаж откренивает на наветренном борту',
    photos: [
      {
        src: '/photos/race/heeling.webp',
        alt: 'Гоночная яхта с чёрными парусами в крене, четыре человека экипажа откренивают на борту',
        caption: 'Полный крен на дистанции',
      },
      {
        src: '/photos/race/start-line.webp',
        alt: 'Флот одинаковых яхт с чёрными парусами выстроился на линии старта вдоль волнолома',
        caption: 'Минуты до старта',
      },
      {
        src: '/photos/race/winch-crew.webp',
        alt: 'Рука в гоночной перчатке заводит шкот на лебёдку, за леерами синяя вода и бурун вдоль борта',
        caption: 'Работа на лебёдке',
      },
      {
        src: '/photos/race/bow-to-bow.webp',
        alt: 'Две гоночные яхты идут вплотную борт к борту, паруса пересекаются',
        caption: 'Борт к борту на дистанции',
      },
      {
        src: '/photos/race/crew-rail.webp',
        alt: 'Семь человек экипажа сидят в ряд на борту яхты, свесив ноги над водой, на фоне зелёный берег',
        caption: 'Экипаж на откренивании',
      },
      {
        src: '/photos/race/fleet.webp',
        alt: 'Три гоночные яхты идут вплотную друг к другу, экипажи сидят на бортах, паруса перекрывают горизонт',
        caption: 'Плотная группа на дистанции',
      },
      {
        src: '/photos/race/foredeck.webp',
        alt: 'Вид с носа яхты вперёд: генуя, леера и палуба, впереди открытое море и берег на горизонте',
        caption: 'Переход под генуей',
      },
      {
        src: '/photos/race/venture.webp',
        alt: 'Гоночная яхта под номером 32 идёт в галфвинд, экипаж сидит на борту, на фоне зелёные горы',
        caption: 'В галфвинд вдоль берега',
      },
    ],
    reviewIds: [],
    harbor: {
      port: 'Мармарис, Турция',
      coords: '36°51′N · 28°16′E',
      season: '24–30 октября',
      crew: 'любители + 3 профи',
      note: 'Порт регаты — Мармарис, Турция. Marmaris Race Week, 24–30 октября 2026.',
    },
    departures: [{ id: 'marmaris-1', dates: '24–30.10', route: mirwRoute }],
  },
]
