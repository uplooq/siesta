import { useSyncExternalStore } from 'react'
import { trips, type Trip } from './data'

let selectedId = trips[0].id
const listeners = new Set<() => void>()

export const selectTrip = (id: string) => {
  if (id === selectedId || !trips.some((trip) => trip.id === id)) return
  selectedId = id
  listeners.forEach((notify) => notify())
}

const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

const getSelectedId = () => selectedId

export const useSelectedTrip = (): Trip => {
  const id = useSyncExternalStore(subscribe, getSelectedId)
  return trips.find((trip) => trip.id === id) ?? trips[0]
}
