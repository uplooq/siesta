import { Header } from '@/widgets/header'
import { Hero } from '@/widgets/hero'
import { Trips } from '@/widgets/trips'
import { Intro } from '@/widgets/intro'
import { Chronicle } from '@/widgets/chronicle'
import { Captains } from '@/widgets/captains'
import { Reviews } from '@/widgets/reviews'
import { Builder } from '@/widgets/builder'
import { Booking } from '@/widgets/booking'
import { Footer } from '@/widgets/footer'

export const HomePage = () => (
  <>
    <Header />
    <main>
      <Hero />
      <Trips />
      <Intro />
      <Chronicle />
      <Captains />
      <Reviews />
      <Builder />
      <Booking />
    </main>
    <Footer />
  </>
)
