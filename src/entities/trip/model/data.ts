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

export interface Trip {
  id: string
  group: TripGroup
  geo: string
  year: string
  price: string
  priceUnit: string
  tagline: string
  cover: string
  coverAlt: string
  photos: TripPhoto[]
  video?: { href: string; label: string }
  reviewIds: string[]
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
  mapImage: '/routes/osenniy-briz-2609.png',
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

const raceLegend = ['Линия старта', 'Поворотные знаки', 'Финиш и хронометраж']

const cupRoute: TripRoute = {
  name: 'Кубок залива',
  duration: '3 дня',
  extent: '4 гонки',
  legend: raceLegend,
  mapCaption: 'Карта дистанции «Кубок залива»',
  mapPoints: [
    { ll: [29.078, 36.64], caption: 'СТАРТ' },
    { ll: [29.005, 36.612], caption: 'ЗНАК 1' },
    { ll: [29.058, 36.572], caption: 'ЗНАК 2' },
  ],
  mapClosed: true,
  itinerary: {
    title: 'Три дня Кубка залива',
    intro:
      'Короткая серия в закрытой акватории: хороший вход в регаты, если вы ещё не стояли на старте.',
    days: [
      {
        label: 'День 1',
        title: 'Тренировка и первые старты',
        text: 'Знакомство с лодкой и экипажем, распределение ролей. Отрабатываем постановку парусов и повороты, после обеда тренировочный старт и первая зачётная гонка.',
      },
      {
        label: 'День 2',
        title: 'Гоночный день',
        text: 'Утром брифинг, днём две-три короткие гонки. Вечером разбор манёвров с капитанами: что получилось и где потеряли время на дистанции.',
      },
      {
        label: 'День 3',
        title: 'Финал и награждение',
        text: 'Решающие гонки и подсчёт очков серии. Вечером награждение и командный ужин в марине.',
      },
    ],
    note: 'Опыт не обязателен: роли распределяем под каждого участника, капитаны подстрахуют на манёврах.',
  },
}

const autumnRoute: TripRoute = {
  name: 'Осенняя регата',
  duration: '5 дней',
  extent: 'вокруг островов',
  legend: raceLegend,
  mapCaption: 'Карта дистанции «Осенняя регата»',
  mapPoints: [
    { ll: [29.11, 36.621], caption: 'СТАРТ · ФЕТХИЕ' },
    { ll: [29.056, 36.549], caption: 'ГЕМИЛЕР' },
    { ll: [28.915, 36.672], caption: 'БУХТА КАПЫ' },
    { ll: [28.94, 36.749], caption: 'ФИНИШ · ГЁЧЕК' },
  ],
  itinerary: {
    title: 'Пять дней осенней регаты',
    intro:
      'Длинная дистанция вокруг островов с ночным этапом. Для тех, кто уже стоял на руле и хочет борьбы.',
    days: [
      {
        label: 'День 1',
        title: 'Слаживание экипажа',
        text: 'Тренировка, распределение ролей и настройка лодки: впереди длинная дистанция, и здесь решает слаженность, а не только скорость.',
      },
      {
        label: 'Дни 2–3',
        title: 'Этапы вокруг островов',
        text: 'Гонки с полноценной тактикой: ветровые зоны, огибания знаков и борьба на длинных галсах. Вечером разбор этапов с капитанами.',
      },
      {
        label: 'День 4',
        title: 'Ночной переход',
        text: 'Этап с ночными вахтами: огни на горизонте, звёзды и совсем другое море. Тот самый день, о котором потом рассказывают чаще всего.',
      },
      {
        label: 'День 5',
        title: 'Финиш и награждение',
        text: 'Финальный этап, подведение итогов и награждение. Вечером ужин, за которым регату разбирают до мелочей.',
      },
    ],
    note: 'Для участия нужен базовый опыт: хотя бы одна регата или выход под парусом с нами.',
  },
}

export const trips: Trip[] = [
  {
    id: 'gocek',
    group: 'travel',
    geo: 'Гёчек, Турция',
    year: '2026',
    price: 'от 1 350 €',
    priceUnit: 'за гостя',
    tagline:
      'Сосновые бухты залива Гёчек и цепочка островов: короткие переходы, купания в бирюзовых заводях и стоянки у самого берега.',
    cover: '/photos/cove-anchorage.webp',
    coverAlt: 'Гулеты на якоре в сосновой бухте, зеркальная вода и зелёные склоны',
    photos: [
      {
        src: '/photos/cove-anchorage.webp',
        alt: 'Гулеты на якоре в сосновой бухте, зеркальная вода и зелёные склоны',
        caption: 'Стоянка в бухте, до заката',
      },
      {
        src: '/photos/horseshoe-bay.webp',
        alt: 'Подковообразная бухта с бирюзовыми отмелями и одинокой яхтой, вид сверху',
        caption: 'Бухта-подкова, вид с дрона',
      },
      {
        src: '/photos/archipelago-aerial.webp',
        alt: 'Аэросъёмка архипелага на золотом часе: острова, песчаная коса и десятки яхт на якоре',
        caption: 'Острова залива на золотом часе',
      },
      {
        src: '/photos/catamaran-cove.webp',
        alt: 'Катамаран и гулет у каменного пирса в тихой зелёной бухте',
        caption: 'Тихая стоянка у пирса',
      },
    ],
    reviewIds: ['marina-oleg', 'daria', 'lena-pasha'],
    departures: [
      { id: 'gocek-1', dates: '26.09–3.10', route: breezeRoute2609 },
      { id: 'gocek-2', dates: '3.10–10.10', route: pendingRoute },
      { id: 'gocek-3', dates: '10.10–17.10', route: breezeRoute1010 },
    ],
  },
  {
    id: 'cup',
    group: 'race',
    geo: 'Фетхие, Турция',
    year: '2026',
    price: 'от 150 000 ₽',
    priceUnit: 'за гостя',
    tagline:
      'Короткие гонки в закрытой акватории залива: старты каждый день, разбор манёвров вечером. Хороший вход в регаты для новичков.',
    cover: '/photos/sunset-regatta.webp',
    coverAlt: 'Оранжевый закат над морем, силуэты парусников у гористого берега',
    photos: [
      {
        src: '/photos/sunset-regatta.webp',
        alt: 'Оранжевый закат над морем, силуэты парусников у гористого берега',
        caption: 'Финиш последней гонки, на закате',
      },
      {
        src: '/photos/under-sail.webp',
        alt: 'Вид с палубы под парусом на глубокую синь открытого моря, вдали второй парусник',
        caption: 'На дистанции, борт к борту',
      },
    ],
    reviewIds: ['nastya'],
    departures: [{ id: 'cup-1', dates: '18–20.09', route: cupRoute }],
  },
  {
    id: 'autumn',
    group: 'race',
    geo: 'Фетхие — Гёчек, Турция',
    year: '2026',
    price: 'от 150 000 ₽',
    priceUnit: 'за гостя',
    tagline:
      'Длинная дистанция вокруг островов с ночными переходами и настоящей тактикой. Для тех, кто уже стоял на руле и хочет борьбы.',
    cover: '/photos/under-sail.webp',
    coverAlt: 'Вид с палубы под парусом на глубокую синь открытого моря, вдали второй парусник',
    photos: [
      {
        src: '/photos/under-sail.webp',
        alt: 'Вид с палубы под парусом на глубокую синь открытого моря, вдали второй парусник',
        caption: 'Полный ветер, курс бейдевинд',
      },
      {
        src: '/photos/sunset-regatta.webp',
        alt: 'Оранжевый закат над морем, силуэты парусников у гористого берега',
        caption: 'Вечер после этапа',
      },
      {
        src: '/photos/archipelago-aerial.webp',
        alt: 'Аэросъёмка архипелага на золотом часе: острова, песчаная коса и десятки яхт на якоре',
        caption: 'Острова, вокруг которых идёт дистанция',
      },
    ],
    reviewIds: ['kirill'],
    departures: [{ id: 'autumn-1', dates: '5–9.10', route: autumnRoute }],
  },
]
