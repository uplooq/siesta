import { useEffect, useRef, useState } from 'react'
import type { Route } from '@/entities/route'
import styles from './RouteMap.module.css'

export const RouteMap = ({ route }: { route: Route }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let map: { remove: () => void } | undefined

    const boot = async () => {
      try {
        const [{ default: maplibregl }] = await Promise.all([
          import('maplibre-gl'),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ])
        if (cancelled || !containerRef.current) return

        const points = route.mapPoints
        const coords = route.mapClosed
          ? [...points.map((p) => p.ll), points[0].ll]
          : points.map((p) => p.ll)

        const m = new maplibregl.Map({
          container: containerRef.current,
          style: 'https://tiles.openfreemap.org/styles/positron',
          interactive: false,
          attributionControl: { compact: true },
        })
        map = m

        m.on('load', () => {
          m.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          })
          m.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#2b4f50',
              'line-width': 1.8,
              'line-dasharray': [0.4, 2.4],
            },
          })
        })

        points.forEach((point, index) => {
          const el = document.createElement('div')
          el.className = styles.marker
          const node = document.createElement('span')
          node.className = index === 0 ? `${styles.markerNode} ${styles.markerStart}` : styles.markerNode
          node.textContent = String(index + 1)
          el.appendChild(node)
          if (point.caption) {
            const cap = document.createElement('span')
            cap.className = styles.markerCap
            cap.textContent = point.caption
            el.appendChild(cap)
          }
          new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(point.ll).addTo(m)
        })

        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new maplibregl.LngLatBounds(coords[0], coords[0]),
        )
        m.fitBounds(bounds, { padding: 52, duration: 0 })
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    boot()
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [route])

  if (failed) {
    return (
      <div className={styles.fallback}>
        <span aria-hidden="true">📍</span>
        <span>{route.mapCaption}</span>
      </div>
    )
  }

  return <div ref={containerRef} className={styles.map} aria-label={route.mapCaption} />
}
