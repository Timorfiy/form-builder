import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type ViewMode = 'days' | 'months' | 'years'

interface YMD {
  y: number
  m: number
  d: number
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}

function parseISO(value: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2]) - 1
  const d = Number(match[3])
  if (m < 0 || m > 11 || d < 1 || d > daysInMonth(y, m)) return null
  return { y, m, d }
}

function toISO({ y, m, d }: YMD): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** ISO → DD.MM.YYYY (empty string for empty/invalid input) */
function isoToDisplay(value: string): string {
  const p = parseISO(value)
  if (!p) return ''
  return `${String(p.d).padStart(2, '0')}.${String(p.m + 1).padStart(2, '0')}.${p.y}`
}

/** 'DD.MM.YYYY' → YMD, validating real calendar dates and a sane year range */
function parseDisplay(text: string): YMD | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text)
  if (!match) return null
  const d = Number(match[1])
  const m = Number(match[2]) - 1
  const y = Number(match[3])
  if (y < 1900 || y > 2100 || m < 0 || m > 11 || d < 1 || d > daysInMonth(y, m)) return null
  return { y, m, d }
}

/** Progressive digit mask: '1508' → '15.08' */
function dotMask(digits: string): string {
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter((part) => part.length > 0)
    .join('.')
}

interface DayCell extends YMD {
  inMonth: boolean
}

function buildGrid(y: number, m: number): DayCell[] {
  // Monday-first grid, always 6 rows × 7 columns
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7
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
  placeholder = 'DD.MM.YYYY',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const selected = parseISO(value)
  const today = new Date()
  const todayYMD: YMD = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() }

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ViewMode>('days')
  const [view, setView] = useState<{ y: number; m: number }>({
    y: selected?.y ?? todayYMD.y,
    m: selected?.m ?? todayYMD.m,
  })
  const [text, setText] = useState(() => isoToDisplay(value))
  const [invalid, setInvalid] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // keep the text field in sync when the value changes from the calendar
  useEffect(() => {
    setText(isoToDisplay(value))
    setInvalid(false)
  }, [value])

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

  const openCalendar = () => {
    const base = parseISO(value)
    setView({ y: base?.y ?? todayYMD.y, m: base?.m ?? todayYMD.m })
    setMode('days')
    setOpen(true)
  }

  /** prev/next adapts to the active view: month → year → 12-year page */
  const shift = (delta: number) => {
    if (mode === 'days') {
      setView((v) => {
        const next = new Date(v.y, v.m + delta, 1)
        return { y: next.getFullYear(), m: next.getMonth() }
      })
    } else if (mode === 'months') {
      setView((v) => ({ ...v, y: v.y + delta }))
    } else {
      setView((v) => ({ ...v, y: v.y + delta * 12 }))
    }
  }

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    setText(dotMask(digits))
    if (digits.length === 0) {
      setInvalid(false)
      onChange('')
      return
    }
    if (digits.length === 8) {
      const parsed = parseDisplay(dotMask(digits))
      if (parsed) {
        setInvalid(false)
        onChange(toISO(parsed))
        setView({ y: parsed.y, m: parsed.m })
      } else {
        setInvalid(true)
      }
    } else {
      setInvalid(false)
    }
  }

  const onBlur = () => {
    // discard incomplete/invalid partial input
    setText(isoToDisplay(value))
    setInvalid(false)
  }

  const pick = (ymd: YMD) => {
    onChange(toISO(ymd))
    setOpen(false)
  }

  const yearPageStart = Math.floor(view.y / 12) * 12
  const todayISO = toISO(todayYMD)

  return (
    <div className="dp" ref={rootRef}>
      <div className={`dp-input-wrap ${open ? 'is-open' : ''} ${invalid ? 'is-invalid' : ''}`}>
        <input
          className="dp-input"
          value={text}
          onChange={onTextChange}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          aria-label="Date (DD.MM.YYYY)"
        />
        <button
          type="button"
          className="dp-cal-btn"
          onClick={() => (open ? setOpen(false) : openCalendar())}
          aria-label="Toggle calendar"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Icon name="calendar" size={15} />
        </button>
      </div>

      {open && (
        <div className="dp-pop" role="dialog" aria-label="Choose date">
          <div className="dp-head">
            <button type="button" className="dp-nav" onClick={() => shift(-1)} aria-label="Previous">
              <Icon name="chevronDown" size={13} className="rot-90" />
            </button>
            <div className="dp-head-titles">
              <button
                type="button"
                className={`dp-title-btn ${mode === 'months' ? 'is-active' : ''}`}
                onClick={() => setMode(mode === 'months' ? 'days' : 'months')}
              >
                {MONTHS[view.m]}
              </button>
              <button
                type="button"
                className={`dp-title-btn ${mode === 'years' ? 'is-active' : ''}`}
                onClick={() => setMode(mode === 'years' ? 'days' : 'years')}
              >
                {mode === 'years' ? `${yearPageStart} – ${yearPageStart + 11}` : view.y}
              </button>
            </div>
            <button type="button" className="dp-nav" onClick={() => shift(1)} aria-label="Next">
              <Icon name="chevronDown" size={13} className="rot-270" />
            </button>
          </div>

          {mode === 'days' && (
            <>
              <div className="dp-weekdays">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="dp-grid">
                {buildGrid(view.y, view.m).map((cell, i) => {
                  const iso = toISO(cell)
                  const isSelected = value === iso
                  const isToday = iso === todayISO
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`dp-day ${cell.inMonth ? '' : 'is-out'} ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                      onClick={() => pick(cell)}
                      aria-pressed={isSelected}
                    >
                      {cell.d}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {mode === 'months' && (
            <div className="dp-cells">
              {MONTHS.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  className={`dp-cell ${i === view.m ? 'is-selected' : ''}`}
                  onClick={() => {
                    setView((v) => ({ ...v, m: i }))
                    setMode('days')
                  }}
                >
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {mode === 'years' && (
            <div className="dp-cells">
              {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`dp-cell ${y === view.y ? 'is-selected' : ''}`}
                  onClick={() => {
                    setView((v) => ({ ...v, y }))
                    setMode('days')
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {mode === 'days' && (
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
              <button type="button" className="dp-mini is-strong" onClick={() => pick(todayYMD)}>
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
