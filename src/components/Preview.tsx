import { useMemo, useState, type CSSProperties } from 'react'
import { useBuilder } from '../store'
import type { Block, FormDoc } from '../types'
import { isFieldKind } from '../types'
import { Icon } from './Icon'

type Value = string | number | boolean | string[]
type Values = Record<string, Value>
type Errors = Record<string, string>

function initValues(doc: FormDoc): Values {
  const values: Values = {}
  for (const b of doc.blocks) {
    switch (b.kind) {
      case 'checkboxes':
        values[b.id] = []
        break
      case 'switch':
        values[b.id] = b.defaultOn
        break
      case 'rating':
        values[b.id] = 0
        break
      default:
        values[b.id] = ''
    }
  }
  return values
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/

function validate(doc: FormDoc, values: Values): Errors {
  const errors: Errors = {}
  for (const b of doc.blocks) {
    if (!isFieldKind(b.kind)) continue
    const v = values[b.id]

    if ('required' in b && b.required) {
      const empty =
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0) ||
        (b.kind === 'rating' && typeof v === 'number' && v === 0)
      if (empty) {
        errors[b.id] = 'This field is required.'
        continue
      }
    }

    if (typeof v === 'string' && v.trim() !== '') {
      if (b.kind === 'email' && !EMAIL_RE.test(v)) errors[b.id] = 'Enter a valid email address.'
      else if (b.kind === 'url' && !URL_RE.test(v.trim())) errors[b.id] = 'Enter a valid URL.'
      else if (b.kind === 'phone' && !PHONE_RE.test(v)) errors[b.id] = 'Enter a valid phone number.'
      else if (b.kind === 'number') {
        const n = Number(v)
        if (Number.isNaN(n)) errors[b.id] = 'Enter a number.'
        else if (b.min !== null && n < b.min) errors[b.id] = `Must be at least ${b.min}.`
        else if (b.max !== null && n > b.max) errors[b.id] = `Must be at most ${b.max}.`
      }
    }
  }
  return errors
}

function buildPayload(doc: FormDoc, values: Values): Record<string, Value> {
  const payload: Record<string, Value> = {}
  const seen = new Map<string, number>()
  for (const b of doc.blocks) {
    if (!isFieldKind(b.kind) || !('label' in b)) continue
    let key = b.label
    const count = seen.get(key) ?? 0
    seen.set(key, count + 1)
    if (count > 0) key = `${key} (${count + 1})`
    const v = values[b.id]
    payload[key] = b.kind === 'number' && typeof v === 'string' && v !== '' ? Number(v) : v
  }
  return payload
}

/* ---------- field renderers ---------- */

interface FieldProps {
  block: Block
  value: Value
  error?: string
  set: (v: Value) => void
}

function FieldFrame({
  block,
  error,
  children,
}: {
  block: Block & { label: string; helpText?: string }
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className={`pv-field ${error ? 'has-error' : ''}`} id={`pf-${block.id}`}>
      <span className="pv-label">
        {block.label}
        {'required' in block && block.required && <span className="pv-required">*</span>}
      </span>
      {children}
      {error ? (
        <span className="pv-error">{error}</span>
      ) : (
        block.helpText && <span className="pv-help">{block.helpText}</span>
      )}
    </div>
  )
}

function PreviewField({ block, value, error, set }: FieldProps) {
  const [hoverStar, setHoverStar] = useState(0)

  switch (block.kind) {
    case 'heading':
      return <h3 className="pv-heading">{block.text}</h3>
    case 'paragraph':
      return <p className="pv-paragraph">{block.text}</p>
    case 'divider':
      return <hr className="pv-divider" />

    case 'longText':
      return (
        <FieldFrame block={block} error={error}>
          <textarea
            className="pv-input"
            rows={block.rows}
            placeholder={block.placeholder}
            value={value as string}
            onChange={(e) => set(e.target.value)}
          />
        </FieldFrame>
      )

    case 'dropdown':
      return (
        <FieldFrame block={block} error={error}>
          <div className="pv-select-wrap">
            <select
              className={`pv-input pv-select ${value === '' ? 'is-empty' : ''}`}
              value={value as string}
              onChange={(e) => set(e.target.value)}
            >
              <option value="" disabled>
                Select…
              </option>
              {block.options.map((o, i) => (
                <option key={i} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={15} className="pv-select-icon" />
          </div>
        </FieldFrame>
      )

    case 'radio':
      return (
        <FieldFrame block={block} error={error}>
          <div className="pv-options">
            {block.options.map((o, i) => (
              <label key={i} className={`pv-choice ${value === o ? 'is-checked' : ''}`}>
                <input
                  type="radio"
                  name={block.id}
                  checked={value === o}
                  onChange={() => set(o)}
                />
                <span className="pv-choice-mark" />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </FieldFrame>
      )

    case 'checkboxes': {
      const arr = value as string[]
      return (
        <FieldFrame block={block} error={error}>
          <div className="pv-options">
            {block.options.map((o, i) => {
              const checked = arr.includes(o)
              return (
                <label key={i} className={`pv-choice is-box ${checked ? 'is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      set(checked ? arr.filter((x) => x !== o) : [...arr, o])
                    }
                  />
                  <span className="pv-choice-mark">
                    <Icon name="check" size={11} strokeWidth={2.4} />
                  </span>
                  <span>{o}</span>
                </label>
              )
            })}
          </div>
        </FieldFrame>
      )
    }

    case 'switch': {
      const on = value as boolean
      return (
        <FieldFrame block={block} error={error}>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            className={`pv-switch ${on ? 'is-on' : ''}`}
            onClick={() => set(!on)}
          >
            <span className="pv-switch-knob" />
          </button>
        </FieldFrame>
      )
    }

    case 'rating': {
      const current = value as number
      const shown = hoverStar || current
      return (
        <FieldFrame block={block} error={error}>
          <div className="pv-stars" onMouseLeave={() => setHoverStar(0)}>
            {Array.from({ length: block.max }, (_, i) => {
              const n = i + 1
              return (
                <button
                  key={n}
                  type="button"
                  className={`pv-star ${n <= shown ? 'is-lit' : ''}`}
                  onMouseEnter={() => setHoverStar(n)}
                  onClick={() => set(n === current ? 0 : n)}
                  aria-label={`${n} of ${block.max}`}
                >
                  <svg viewBox="0 0 24 24" width="26" height="26">
                    <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
                  </svg>
                </button>
              )
            })}
          </div>
        </FieldFrame>
      )
    }

    default: {
      const type =
        block.kind === 'email'
          ? 'email'
          : block.kind === 'phone'
            ? 'tel'
            : block.kind === 'url'
              ? 'url'
              : block.kind === 'number'
                ? 'number'
                : block.kind === 'date'
                  ? 'date'
                  : 'text'
      return (
        <FieldFrame block={block} error={error}>
          <input
            className="pv-input"
            type={type}
            placeholder={block.placeholder}
            value={value as string}
            min={block.kind === 'number' ? (block.min ?? undefined) : undefined}
            max={block.kind === 'number' ? (block.max ?? undefined) : undefined}
            onChange={(e) => set(e.target.value)}
          />
        </FieldFrame>
      )
    }
  }
}

/* ---------- preview shell ---------- */

export function Preview() {
  const { state, dispatch } = useBuilder()
  const { doc } = state
  const [values, setValues] = useState<Values>(() => initValues(doc))
  const [errors, setErrors] = useState<Errors>({})
  const [payload, setPayload] = useState<Record<string, Value> | null>(null)

  const accentStyle = { '--form-accent': doc.accent } as CSSProperties
  const fieldCount = useMemo(
    () => doc.blocks.filter((b) => isFieldKind(b.kind)).length,
    [doc.blocks],
  )

  const setValue = (id: string, v: Value) => {
    setValues((prev) => ({ ...prev, [id]: v }))
    setErrors((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(doc, values)
    setErrors(errs)
    const firstErrorId = Object.keys(errs)[0]
    if (firstErrorId) {
      document
        .getElementById(`pf-${firstErrorId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setPayload(buildPayload(doc, values))
  }

  const reset = () => {
    setValues(initValues(doc))
    setErrors({})
    setPayload(null)
  }

  return (
    <main className="preview" style={accentStyle}>
      <div className="preview-page">
        {payload ? (
          <div className="pv-success">
            <div className="pv-success-check">
              <Icon name="check" size={30} strokeWidth={2.2} />
            </div>
            <h2 className="pv-success-title">Response recorded</h2>
            <p className="pv-success-sub">
              This is a front-end demo — nothing was sent anywhere. Here’s the payload your form
              produced:
            </p>
            <pre className="pv-payload">{JSON.stringify(payload, null, 2)}</pre>
            <div className="pv-success-actions">
              <button className="pv-btn is-accent" onClick={reset}>
                Submit another response
              </button>
              <button
                className="pv-btn"
                onClick={() => dispatch({ type: 'set-mode', mode: 'build' })}
              >
                <Icon name="build" size={15} />
                Back to building
              </button>
            </div>
          </div>
        ) : (
          <form className="paper pv-paper" onSubmit={submit} noValidate>
            <div className="paper-accent" style={{ background: doc.accent }} />
            <header className="paper-head">
              <h1 className="paper-title">{doc.title || 'Untitled form'}</h1>
              {doc.description && <p className="paper-desc">{doc.description}</p>}
            </header>

            {doc.blocks.length === 0 ? (
              <div className="pv-empty">
                <p>This form has no blocks yet.</p>
                <button
                  type="button"
                  className="pv-btn is-accent"
                  onClick={() => dispatch({ type: 'set-mode', mode: 'build' })}
                >
                  <Icon name="build" size={15} />
                  Add some blocks
                </button>
              </div>
            ) : (
              <>
                <div className="pv-fields">
                  {doc.blocks.map((b) => (
                    <PreviewField
                      key={b.id}
                      block={b}
                      value={values[b.id]}
                      error={errors[b.id]}
                      set={(v) => setValue(b.id, v)}
                    />
                  ))}
                </div>
                <div className="paper-submit-row">
                  <button type="submit" className="paper-submit pv-submit">
                    {doc.submitLabel || 'Submit'}
                    <span className="paper-submit-orb">
                      <Icon name="send" size={13} strokeWidth={1.8} />
                    </span>
                  </button>
                  <span className="pv-meta">
                    {fieldCount} {fieldCount === 1 ? 'question' : 'questions'}
                  </span>
                </div>
              </>
            )}

            <footer className="paper-foot">
              <span className="paper-foot-mark">made with FormForge</span>
            </footer>
          </form>
        )}
      </div>
    </main>
  )
}
