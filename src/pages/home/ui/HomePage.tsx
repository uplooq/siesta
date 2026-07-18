import { Hero } from '@/widgets/hero'
import { Intro } from '@/widgets/intro'
import { Programs } from '@/widgets/programs'
import { Routes } from '@/widgets/routes'
import { Chronicle } from '@/widgets/chronicle'
import { Captains } from '@/widgets/captains'
import { Voice } from '@/widgets/voice'
import { Booking } from '@/widgets/booking'
import { Footer } from '@/widgets/footer'

export const HomePage = () => (
  <>
    <Hero />
    <Intro />
    <Programs />
    <Routes />
    <Chronicle />
    <Captains />
    <Voice />
    <Booking />
    <Footer />
  </>
)
