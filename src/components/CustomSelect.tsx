import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return
    listRef.current.children[highlight]?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const openList = () => {
    setHighlight(Math.max(0, options.indexOf(value)))
    setOpen(true)
  }

  const choose = (opt: string) => {
    onChange(opt)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setHighlight((h) => Math.min(options.length - 1, h + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlight((h) => Math.max(0, h - 1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (highlight >= 0 && options[highlight] !== undefined) choose(options[highlight])
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className="cs" ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={`pv-input cs-trigger ${value ? '' : 'is-empty'} ${open ? 'is-open' : ''}`}
        onClick={() => (open ? setOpen(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cs-value">{value || placeholder}</span>
        <Icon name="chevronDown" size={15} className={`cs-chevron ${open ? 'rot-180' : ''}`} />
      </button>

      {open && (
        <ul className="cs-list" role="listbox" ref={listRef} tabIndex={-1}>
          {options.map((opt, i) => {
            const isSelected = opt === value
            return (
              <li
                key={i}
                role="option"
                aria-selected={isSelected}
                className={`cs-option ${isSelected ? 'is-selected' : ''} ${i === highlight ? 'is-highlight' : ''}`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  choose(opt)
                }}
              >
                <span>{opt}</span>
                {isSelected && <Icon name="check" size={14} strokeWidth={2.2} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
