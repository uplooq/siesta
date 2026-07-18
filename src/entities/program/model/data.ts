export type ProgramId = 'travel' | 'race'

export interface Program {
  id: ProgramId
  eyebrow: string
  title: string
  hint: string
  cover: string
  flip: boolean
  detail: {
    title: string
    description: string
    image: string
    imageAlt: string
    imageCaption: string
    included: { label: string; text: string }[]
    price: string
    priceUnit: string
  }
}

export const programs: Program[] = [
  {
    id: 'travel',
    eyebrow: 'Релакс',
    title: 'Путешествия',
    hint: 'Смотреть программу',
    cover: '/program-travel.webp',
    flip: false,
    detail: {
      title: 'Релакс и эстетика',
      description:
        'Уединённые бухты, неспешные завтраки на палубе и полное единение с морем. Авторские маршруты для тех, кто ценит комфорт, хорошую еду и закаты в кругу близких. Мы не гонимся за расстоянием — мы даём морю распорядиться днём.',
      image: '/photos/cove-anchorage.webp',
      imageAlt: 'Гулеты на якоре в сосновой бухте, зеркальная вода и зелёные склоны',
      imageCaption: 'Стоянка в бухте, до заката',
      included: [
        {
          label: 'Борт',
          text: 'Парусная яхта до 8 гостей, 3–4 каюты, проживание в двухместных комфортабельных каютах',
        },
        {
          label: 'Комфорт',
          text: 'Душ, туалет, кухня и уютное место на палубе для отдыха',
        },
        {
          label: 'Питание',
          text: 'Завтраки на воде, ужины в портовых тавернах, ресторанах и на яхте, местное вино',
        },
        {
          label: 'Ритм',
          text: '2–5 часов переходов в день, остальное — купания, прогулки по городу и шопинг',
        },
      ],
      price: 'от 1 350 €',
      priceUnit: 'за гостя / неделя',
    },
  },
  {
    id: 'race',
    eyebrow: 'Регата',
    title: 'Гонки',
    hint: 'Смотреть программу',
    cover: '/program-race.webp',
    flip: true,
    detail: {
      title: 'Драйв и адреналин',
      description:
        'Станьте частью команды. Настоящие спортивные регаты: скорость, ветер и борьба за победу. Опыт не обязателен — два профессиональных капитана обучат вас управлению яхтой в реальных гоночных условиях, от постановки парусов до огибания знака.',
      image: '/photos/under-sail.webp',
      imageAlt: 'Вид с палубы под парусом на глубокую синь открытого моря, вдали второй парусник',
      imageCaption: 'Полный ветер, курс бейдевинд',
      included: [
        {
          label: 'Роль',
          text: 'Место в экипаже, разбор манёвров, работа на лебёдках и руле',
        },
        {
          label: 'Школа',
          text: 'Брифинги перед стартом, теория узлов и тактики гонки',
        },
        {
          label: 'Финиш',
          text: 'Хронометраж, разбор гонки и ужин команды в марине',
        },
      ],
      price: 'от 150 000 ₽',
      priceUnit: 'за гостя / регата',
    },
  },
]
