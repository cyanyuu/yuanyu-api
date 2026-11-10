/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'

type GlobePoint = readonly [number, number, number]

// Simplified silhouettes, solely for the decorative globe (not a geographic map).
const LAND = [
  [
    [-168, 70],
    [-130, 72],
    [-105, 78],
    [-55, 52],
    [-63, 43],
    [-82, 25],
    [-96, 16],
    [-117, 30],
    [-132, 52],
    [-168, 60],
  ],
  [
    [-81, 12],
    [-61, 10],
    [-35, -6],
    [-43, -23],
    [-54, -55],
    [-71, -48],
    [-81, -9],
  ],
  [
    [-53, 60],
    [-22, 70],
    [-30, 83],
    [-61, 80],
  ],
  [
    [-18, 35],
    [10, 38],
    [37, 31],
    [51, 12],
    [41, -13],
    [22, -35],
    [12, -20],
    [-3, 4],
    [-17, 15],
  ],
  [
    [-11, 36],
    [-10, 59],
    [10, 72],
    [37, 68],
    [57, 53],
    [41, 38],
    [27, 36],
    [13, 44],
  ],
  [
    [33, 70],
    [100, 78],
    [179, 66],
    [162, 52],
    [139, 36],
    [121, 23],
    [109, 2],
    [97, 5],
    [79, 8],
    [67, 25],
    [45, 30],
    [32, 42],
  ],
  [
    [112, -11],
    [137, -11],
    [154, -24],
    [148, -39],
    [116, -33],
  ],
  [
    [46, -13],
    [51, -17],
    [47, -26],
    [43, -23],
  ],
  [
    [130, 31],
    [142, 45],
    [145, 43],
    [138, 32],
  ],
] as const

function globePoint(latitude: number, longitude: number): GlobePoint {
  const lat = (latitude * Math.PI) / 180
  const lon = (longitude * Math.PI) / 180
  return [
    Math.cos(lat) * Math.sin(lon),
    -Math.sin(lat),
    Math.cos(lat) * Math.cos(lon),
  ]
}

const GLOBE_DOTS: { point: GlobePoint; land: boolean }[] = []
for (let latitude = -78; latitude <= 80; latitude += 3) {
  const step = 3 / Math.cos((latitude * Math.PI) / 180)
  for (let longitude = -180; longitude < 180; longitude += step) {
    const land = LAND.some((polygon) => {
      let inside = false
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [x, y] = polygon[i]
        const [previousX, previousY] = polygon[j]
        if (
          y > latitude !== previousY > latitude &&
          longitude < ((previousX - x) * (latitude - y)) / (previousY - y) + x
        ) {
          inside = !inside
        }
      }
      return inside
    })
    GLOBE_DOTS.push({ point: globePoint(latitude, longitude), land })
  }
}

const GRID_LINES = [
  ...[-60, -30, 0, 30, 60].map((latitude) =>
    Array.from({ length: 97 }, (_, index) =>
      globePoint(latitude, -180 + index * 3.75)
    )
  ),
  ...Array.from({ length: 8 }, (_, longitude) =>
    Array.from({ length: 49 }, (_, index) =>
      globePoint(-90 + index * 3.75, longitude * 45)
    )
  ),
]

// Illustrative connections; these do not claim actual server locations.
const HUBS = [
  globePoint(31, 121),
  globePoint(1, 104),
  globePoint(35, 140),
  globePoint(51, 0),
  globePoint(50, 9),
  globePoint(38, -122),
  globePoint(41, -74),
  globePoint(-34, 151),
  globePoint(25, 55),
  globePoint(19, 73),
  globePoint(-6, 107),
  globePoint(-26, 28),
  globePoint(-23, -46),
  globePoint(-32, 116),
  globePoint(-37, 174),
]
const ROUTES = [
  [0, 1],
  [0, 2],
  [0, 4],
  [1, 8],
  [3, 6],
  [4, 8],
  [2, 5],
  [1, 7],
  [8, 9],
  [9, 10],
  [10, 13],
  [13, 7],
  [7, 14],
  [8, 11],
  [11, 12],
  [4, 11],
  [10, 11],
].map(([from, to]) =>
  Array.from({ length: 49 }, (_, index): GlobePoint => {
    const progress = index / 48
    const start = HUBS[from]
    const end = HUBS[to]
    const x = start[0] * (1 - progress) + end[0] * progress
    const y = start[1] * (1 - progress) + end[1] * progress
    const z = start[2] * (1 - progress) + end[2] * progress
    const scale =
      (1 + Math.sin(progress * Math.PI) * 0.18) / Math.hypot(x, y, z)
    return [x * scale, y * scale, z * scale]
  })
)

export function GlobalNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let dark = document.documentElement.classList.contains('dark')
    let color = '0,0,0'
    let linkColor = '0,0,0'
    const dotOpacity = [0.07, 0.12, 0.18, 0.26, 0.43, 0.62]
    const projectedDots = new Float32Array(GLOBE_DOTS.length * 2)
    const dotLayers = new Int8Array(GLOBE_DOTS.length)
    const projectedPoint: [number, number, number] = [0, 0, 0]
    const packetPoint: [number, number, number] = [0, 0, 0]
    let width = 0
    let height = 0
    let phase = 0
    let previousTime = 0
    let elapsedSinceDraw = 0
    let frame = 0
    let visible = false

    // Resolve semantic CSS colors only on theme changes, never in the frame loop.
    const paletteCanvas = document.createElement('canvas')
    paletteCanvas.width = paletteCanvas.height = 1
    const paletteContext = paletteCanvas.getContext('2d', {
      willReadFrequently: true,
    })
    function syncPalette() {
      if (!paletteContext || !canvas) return
      dark = document.documentElement.classList.contains('dark')
      const style = getComputedStyle(canvas)
      const colors = ['--home-network-dot', '--home-network-link'].map(
        (name) => {
          paletteContext.clearRect(0, 0, 1, 1)
          paletteContext.fillStyle = style.getPropertyValue(name).trim()
          paletteContext.fillRect(0, 0, 1, 1)
          return [...paletteContext.getImageData(0, 0, 1, 1).data]
            .slice(0, 3)
            .join(',')
        }
      )
      ;[color, linkColor] = colors
      if (visible && !document.hidden) draw()
    }

    function draw() {
      if (!context) return
      context.clearRect(0, 0, width, height)
      const radius =
        2 * Math.min(width * (width < 600 ? 0.55 : 0.28), height * 0.4)
      const centerX = width - radius * 0.12
      const centerY = radius * 0.12
      const angle = -2.9 + phase * 0.035
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)

      function project(point: GlobePoint): GlobePoint {
        const x = point[0] * cos + point[2] * sin
        const depth = point[2] * cos - point[0] * sin
        const y = point[1] * 0.98 - depth * 0.2
        projectedPoint[0] = centerX + x * radius
        projectedPoint[1] = centerY + y * radius
        projectedPoint[2] = depth * 0.98 + point[1] * 0.2
        return projectedPoint
      }

      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(${linkColor},${dark ? 0.035 : 0.045})`
      context.fill()
      context.lineWidth = 0.8
      context.strokeStyle = `rgba(${color},${dark ? 0.26 : 0.2})`
      context.stroke()

      // Precomputed surface geometry adds depth without new DOM or per-frame arrays.
      context.beginPath()
      for (const line of GRID_LINES) {
        let connected = false
        for (const point of line) {
          const [x, y, depth] = project(point)
          if (depth < 0) {
            connected = false
            continue
          }
          if (connected) context.lineTo(x, y)
          else context.moveTo(x, y)
          connected = true
        }
      }
      context.lineWidth = 0.6
      context.strokeStyle = `rgba(${linkColor},${dark ? 0.16 : 0.14})`
      context.stroke()

      // Project once per frame into reused buffers; group fills by depth.
      for (let index = 0; index < GLOBE_DOTS.length; index++) {
        dotLayers[index] = -1
        if (width < 600 && index % 2) continue
        const dot = GLOBE_DOTS[index]
        const [x, y, depth] = project(dot.point)
        if (
          depth < -0.12 ||
          x < -4 ||
          x > width + 4 ||
          y < -4 ||
          y > height + 4
        ) {
          continue
        }
        projectedDots[index * 2] = x
        projectedDots[index * 2 + 1] = y
        dotLayers[index] =
          Math.min(2, Math.floor(Math.max(0, depth) * 3)) + (dot.land ? 3 : 0)
      }
      for (let layer = 0; layer < 6; layer++) {
        context.beginPath()
        for (let index = 0; index < GLOBE_DOTS.length; index++) {
          if (dotLayers[index] !== layer) continue
          const x = projectedDots[index * 2]
          const y = projectedDots[index * 2 + 1]
          const size = GLOBE_DOTS[index].land ? 1.7 : 0.85
          context.moveTo(x + size, y)
          context.arc(x, y, size, 0, Math.PI * 2)
        }
        context.fillStyle = `rgba(${layer < 3 ? linkColor : color},${dotOpacity[layer]})`
        context.fill()
      }

      context.lineWidth = 1
      for (const [routeIndex, route] of ROUTES.entries()) {
        const routeColor = routeIndex % 3 === 0 ? linkColor : color
        context.beginPath()
        let connected = false
        for (const point of route) {
          const [x, y, depth] = project(point)
          if (depth < 0) {
            connected = false
            continue
          }
          if (connected) context.lineTo(x, y)
          else context.moveTo(x, y)
          connected = true
        }
        if (dark) {
          context.lineWidth = 5
          context.strokeStyle = `rgba(${routeColor},0.055)`
          context.stroke()
        }
        context.lineWidth = 1
        context.strokeStyle = `rgba(${routeColor},${dark ? 0.65 : 0.48})`
        context.stroke()
        for (let tail = 2; tail >= 0; tail--) {
          const progress =
            ((phase * 0.16 + routeIndex / ROUTES.length + 1 - tail * 0.018) %
              1) *
            (route.length - 1)
          const index = Math.floor(progress)
          const fraction = progress - index
          const start = route[index]
          const end = route[index + 1]
          for (let axis = 0; axis < 3; axis++) {
            packetPoint[axis] =
              start[axis] + (end[axis] - start[axis]) * fraction
          }
          const [x, y, depth] = project(packetPoint)
          if (depth <= 0) continue
          context.beginPath()
          context.arc(x, y, 2.6 - tail * 0.65, 0, Math.PI * 2)
          context.fillStyle = `rgba(${routeColor},${0.95 - tail * 0.3})`
          context.fill()
        }
      }
      for (const [hubIndex, hub] of HUBS.entries()) {
        const [x, y, depth] = project(hub)
        if (depth <= 0) continue
        const pulse = (phase * 0.45 + hubIndex / HUBS.length) % 1
        context.beginPath()
        context.arc(x, y, 5 + pulse * 10, 0, Math.PI * 2)
        context.strokeStyle = `rgba(${linkColor},${(1 - pulse) * 0.32})`
        context.stroke()
        context.beginPath()
        context.arc(x, y, 5, 0, Math.PI * 2)
        context.strokeStyle = `rgba(${color},0.6)`
        context.stroke()
        context.beginPath()
        context.arc(x, y, 1.6, 0, Math.PI * 2)
        context.fillStyle = `rgba(${color},0.95)`
        context.fill()
      }
    }

    function animate(time: number) {
      const elapsed = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0
      phase += elapsed
      elapsedSinceDraw += elapsed
      previousTime = time
      // Keep smooth 60 Hz playback without redrawing hundreds of times on unlocked displays.
      if (elapsedSinceDraw >= 1 / 60 - 0.0005) {
        elapsedSinceDraw = Math.max(0, elapsedSinceDraw - 1 / 60)
        draw()
      }
      frame = requestAnimationFrame(animate)
    }

    function syncPlayback() {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      elapsedSinceDraw = 0
      if (!visible || document.hidden) return
      draw()
      if (!motion.matches) frame = requestAnimationFrame(animate)
    }

    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
      height = entry.contentRect.height
      const resolution = Math.min(
        window.devicePixelRatio || 1,
        width < 600 ? 1 : 1.5
      )
      canvas.width = Math.round(width * resolution)
      canvas.height = Math.round(height * resolution)
      context.setTransform(resolution, 0, 0, resolution, 0, 0)
      if (visible && !document.hidden) draw()
    })
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    })
    const paletteObserver = new MutationObserver(syncPalette)
    paletteObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme-preset'],
    })
    paletteObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    syncPalette()
    resize.observe(canvas)
    intersection.observe(canvas)
    document.addEventListener('visibilitychange', syncPlayback)
    motion.addEventListener('change', syncPlayback)

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      paletteObserver.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      motion.removeEventListener('change', syncPlayback)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className='home-global-network'
      aria-hidden='true'
    />
  )
}
