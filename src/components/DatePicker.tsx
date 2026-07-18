import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function parseISO(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2]) - 1
  const d = Number(match[3])
  if (m < 0 || m > 11 || d < 1 || d > 31) return null
  return { y, m, d }
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(value: string): string {
  const p = parseISO(value)
  if (!p) return value
  return `${MONTHS[p.m].slice(0, 3)} ${p.d}, ${p.y}`
}

interface DayCell {
  y: number
  m: number
  d: number
  inMonth: boolean
}

function buildGrid(y: number, m: number): DayCell[] {
  // Monday-first grid, always 6 rows × 7 columns
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7 // days before the 1st (Mon = 0)
  const cells: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(y, m, 1 - offset + i)
    cells.push({
      y: date.getFullYear(),
      m: date.getMonth(),
      d: date.getDate(),
      inMonth: date.getMonth() === m,
    })
  }
  return cells
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const selected = parseISO(value)
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => ({
    y: selected?.y ?? today.getFullYear(),
    m: selected?.m ?? today.getMonth(),
  }))
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const next = new Date(v.y, v.m + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="dp" ref={rootRef}>
      <button
        type="button"
        className={`pv-input dp-trigger ${value ? '' : 'is-empty'} ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <Icon name="calendar" size={15} />
      </button>

      {open && (
        <div className="dp-pop" role="dialog" aria-label="Choose date">
          <div className="dp-head">
            <button type="button" className="dp-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <Icon name="chevronDown" size={13} className="rot-90" />
            </button>
            <span className="dp-title">
              {MONTHS[view.m]} {view.y}
            </span>
            <button type="button" className="dp-nav" onClick={() => shiftMonth(1)} aria-label="Next month">
              <Icon name="chevronDown" size={13} className="rot-270" />
            </button>
          </div>

          <div className="dp-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="dp-grid">
            {buildGrid(view.y, view.m).map((cell, i) => {
              const iso = toISO(cell.y, cell.m, cell.d)
              const isSelected = value === iso
              const isToday = iso === todayISO
              return (
                <button
                  key={i}
                  type="button"
                  className={`dp-day ${cell.inMonth ? '' : 'is-out'} ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => {
                    onChange(iso)
                    setOpen(false)
                  }}
                  aria-pressed={isSelected}
                >
                  {cell.d}
                </button>
              )
            })}
          </div>

          <div className="dp-foot">
            <button
              type="button"
              className="dp-mini"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="dp-mini is-strong"
              onClick={() => {
                onChange(todayISO)
                setOpen(false)
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
