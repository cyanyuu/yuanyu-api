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
import { useEffect, useRef, type CSSProperties } from 'react'

const currencySymbols = [
  <path key='yuan' d='m18 15 6 8 6-8M18 24h12M18 28h12M24 23v11' />,
  <path
    key='dollar'
    d='M30 17c-2-4-13-4-13 2 0 6 14 3 14 9 0 6-11 6-14 2M24 12v24'
  />,
  <path key='euro' d='M31 16a10 10 0 1 0 0 16M13 22h14M13 27h12' />,
  <path key='pound' d='M30 17c-1-4-10-5-11 1-1 5 3 10-3 15h16M15 24h12' />,
]

const coins = currencySymbols.map((symbol) => (
  <svg key={symbol.key} viewBox='0 0 48 48' fill='none' focusable='false'>
    <circle cx='24' cy='24' r='21' />
    <circle cx='24' cy='24' r='17' strokeWidth='0.7' />
    <g strokeWidth='1.8'>{symbol}</g>
  </svg>
))

const banknoteSymbols = [
  ...currencySymbols,
  <path
    key='fifty'
    d='M13 15H5v8h5a5 5 0 1 1-5 7M22 15c-6 0-6 18 0 18s6-18 0-18Z'
    transform='translate(8)'
  />,
  <path
    key='hundred'
    d='m9 18 4-3v18M23 15c-6 0-6 18 0 18s6-18 0-18ZM37 15c-6 0-6 18 0 18s6-18 0-18Z'
  />,
]

const banknotes = banknoteSymbols.map((symbol) => (
  <svg key={symbol.key} viewBox='0 0 64 36' fill='none' focusable='false'>
    <rect x='2' y='2' width='60' height='32' rx='2' />
    <path
      d='M12 6h40a6 6 0 0 0 6 6v12a6 6 0 0 0-6 6H12a6 6 0 0 0-6-6V12a6 6 0 0 0 6-6Z'
      strokeWidth='0.7'
    />
    <ellipse cx='32' cy='18' rx='13' ry='12' strokeWidth='0.7' />
    <g transform='translate(16 2) scale(.667)' strokeWidth='2'>
      {symbol}
    </g>
    <path d='M14 16v4m36-4v4' />
  </svg>
))

const fallDuration = 24
const mobileParticleCount = 12

// A shared period and evenly spaced phases prevent arrivals from bunching up.
// Shuffle phases across columns so the stream doesn't sweep from left to right.
const particles = [
  {
    x: 4,
    size: 34,
    turn: -28,
    drift: 22,
    note: false,
  },
  {
    x: 18,
    size: 48,
    turn: 38,
    drift: -26,
    note: true,
  },
  {
    x: 32,
    size: 28,
    turn: 65,
    drift: 30,
    note: false,
  },
  {
    x: 49,
    size: 38,
    turn: -48,
    drift: -18,
    note: false,
  },
  {
    x: 70,
    size: 30,
    turn: 22,
    drift: 24,
    note: false,
  },
  {
    x: 92,
    size: 50,
    turn: -60,
    drift: -30,
    note: true,
  },
  { x: 9, size: 44, turn: 48, drift: 16, note: true },
  {
    x: 25,
    size: 36,
    turn: -32,
    drift: -22,
    note: false,
  },
  {
    x: 41,
    size: 30,
    turn: 18,
    drift: 26,
    note: false,
  },
  {
    x: 57,
    size: 46,
    turn: -56,
    drift: -28,
    note: true,
  },
  {
    x: 79,
    size: 34,
    turn: 42,
    drift: 18,
    note: false,
  },
  {
    x: 96,
    size: 28,
    turn: -20,
    drift: -24,
    note: false,
  },
  {
    x: 2,
    size: 26,
    turn: 56,
    drift: 14,
    note: false,
  },
  {
    x: 87,
    size: 40,
    turn: -38,
    drift: -20,
    note: false,
  },
  { x: 6, size: 32, turn: 34, drift: 20, note: false },
  {
    x: 13,
    size: 46,
    turn: -42,
    drift: -16,
    note: true,
  },
  {
    x: 22,
    size: 28,
    turn: 58,
    drift: 24,
    note: false,
  },
  {
    x: 37,
    size: 36,
    turn: -24,
    drift: -20,
    note: false,
  },
  {
    x: 53,
    size: 44,
    turn: 46,
    drift: 18,
    note: true,
  },
  {
    x: 64,
    size: 30,
    turn: -54,
    drift: -26,
    note: false,
  },
  {
    x: 83,
    size: 38,
    turn: 28,
    drift: 22,
    note: false,
  },
  {
    x: 94,
    size: 42,
    turn: -36,
    drift: -18,
    note: true,
  },
  { x: 8, size: 48, turn: 24, drift: 16, note: true },
  {
    x: 15,
    size: 32,
    turn: -46,
    drift: -20,
    note: false,
  },
  {
    x: 28,
    size: 38,
    turn: 58,
    drift: 24,
    note: false,
  },
  {
    x: 45,
    size: 28,
    turn: -32,
    drift: -18,
    note: false,
  },
  { x: 61, size: 46, turn: 42, drift: 20, note: true },
  {
    x: 73,
    size: 34,
    turn: -54,
    drift: -22,
    note: false,
  },
  {
    x: 90,
    size: 40,
    turn: 36,
    drift: 14,
    note: true,
  },
  {
    x: 98,
    size: 26,
    turn: -28,
    drift: -28,
    note: false,
  },
  { x: 1, size: 30, turn: 48, drift: 18, note: false },
  {
    x: 85,
    size: 44,
    turn: -40,
    drift: -16,
    note: true,
  },
]

export function WalletMoneyRain() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let inView = !('IntersectionObserver' in window)
    const syncPlayback = () => {
      element.dataset.paused = String(document.hidden || !inView)
    }
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting
            syncPlayback()
          })
        : undefined

    observer?.observe(element)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [])

  return (
    <div
      ref={ref}
      className='wallet-money-rain'
      data-paused='true'
      aria-hidden='true'
    >
      {particles.map((particle, index) => (
        <span
          key={particle.x}
          className='wallet-money-particle'
          style={
            {
              left: `${particle.x}%`,
              width: particle.size,
              '--fall-duration': `${fallDuration}s`,
              '--fall-delay': `${(-fallDuration * ((index * 13) % particles.length)) / particles.length}s`,
              '--fall-mobile-delay': `${(-fallDuration * ((index * 5) % mobileParticleCount)) / mobileParticleCount}s`,
              '--fall-turn': `${particle.turn}deg`,
              '--fall-drift': `${particle.drift}px`,
            } as CSSProperties
          }
        >
          {particle.note
            ? banknotes[index % banknotes.length]
            : coins[Math.floor(index / 2) % coins.length]}
        </span>
      ))}
    </div>
  )
}
