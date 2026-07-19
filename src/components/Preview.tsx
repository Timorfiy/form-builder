import { useMemo, useState } from 'react'
import { useBuilder } from '../useBuilder'
import type { Block } from '../types'
import { isFieldKind } from '../types'
import {
  buildPayload,
  initValues,
  initialValueForBlock,
  validate,
  type Errors,
  type FieldValidity,
  type Value,
  type Values,
} from '../lib/previewLogic'
import { Icon } from './Icon'
import { DatePicker } from './DatePicker'
import { CustomSelect } from './CustomSelect'
import { PhoneInput } from './PhoneInput'

/* ---------- field renderers ---------- */

interface FieldProps {
  block: Block
  value: Value
  error?: string
  set: (v: Value) => void
  onValidityChange: (valid: boolean) => void
}

interface ControlA11yProps {
  id: string
  'aria-labelledby': string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

function FieldFrame({
  block,
  error,
  children,
}: {
  block: Block & { label: string; helpText?: string }
  error?: string
  children: (a11y: ControlA11yProps) => React.ReactNode
}) {
  const fieldId = `pf-${block.id}`
  const labelId = `${fieldId}-label`
  const helpId = `${fieldId}-help`
  const errorId = `${fieldId}-error`
  const describedBy = [block.helpText ? helpId : '', error ? errorId : '']
    .filter(Boolean)
    .join(' ') || undefined
  const a11y: ControlA11yProps = {
    id: `${fieldId}-control`,
    'aria-labelledby': labelId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': 'required' in block && block.required ? true : undefined,
  }

  return (
    <div className={`pv-field ${error ? 'has-error' : ''}`} id={fieldId}>
      <span className="pv-label">
        <label id={labelId} htmlFor={a11y.id}>
          {block.label}
        </label>
        {'required' in block && block.required && (
          <span className="pv-required" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {children(a11y)}
      {block.helpText && (
        <span className="pv-help" id={helpId}>
          {block.helpText}
        </span>
      )}
      {error && (
        <span className="pv-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function PreviewField({ block, value, error, set, onValidityChange }: FieldProps) {
  const [hoverStar, setHoverStar] = useState(0)

  switch (block.kind) {
    case 'heading':
      return <h3 className="pv-heading">{block.text}</h3>
    case 'paragraph':
      return <p className="pv-paragraph">{block.text}</p>
    case 'divider':
      if (block.variant === 'dashed') return <hr className="pv-divider is-dashed" />
      if (block.variant === 'dots')
        return (
          <div className="pv-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )
      return <hr className="pv-divider" />

    case 'longText':
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <textarea
              {...a11y}
              className="pv-input"
              rows={block.rows}
              placeholder={block.placeholder}
              value={value as string}
              onChange={(e) => set(e.target.value)}
            />
          )}
        </FieldFrame>
      )

    case 'date':
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <DatePicker
              {...a11y}
              value={value as string}
              onChange={set}
              onValidityChange={onValidityChange}
            />
          )}
        </FieldFrame>
      )

    case 'phone':
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <PhoneInput
              {...a11y}
              value={value as string}
              onChange={set}
              maskId={block.mask}
              placeholder={block.placeholder}
            />
          )}
        </FieldFrame>
      )

    case 'dropdown':
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <CustomSelect
              {...a11y}
              value={value as string}
              options={block.options}
              onChange={set}
            />
          )}
        </FieldFrame>
      )

    case 'radio':
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <div
              id={a11y.id}
              className="pv-options"
              role="radiogroup"
              aria-labelledby={a11y['aria-labelledby']}
              aria-describedby={a11y['aria-describedby']}
              aria-invalid={a11y['aria-invalid']}
              aria-required={a11y['aria-required']}
            >
              {block.options.map((option, index) => {
                const optionId = `${a11y.id}-${index}`
                return (
                  <label
                    key={index}
                    htmlFor={optionId}
                    className={`pv-choice ${value === option ? 'is-checked' : ''}`}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={block.id}
                      checked={value === option}
                      onChange={() => set(option)}
                      aria-describedby={a11y['aria-describedby']}
                      aria-invalid={a11y['aria-invalid']}
                    />
                    <span className="pv-choice-mark" />
                    <span>{option}</span>
                  </label>
                )
              })}
            </div>
          )}
        </FieldFrame>
      )

    case 'checkboxes': {
      const selected = value as string[]
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <div
              id={a11y.id}
              className="pv-options"
              role="group"
              aria-labelledby={a11y['aria-labelledby']}
              aria-describedby={a11y['aria-describedby']}
              aria-invalid={a11y['aria-invalid']}
              aria-required={a11y['aria-required']}
            >
              {block.options.map((option, index) => {
                const checked = selected.includes(option)
                const optionId = `${a11y.id}-${index}`
                return (
                  <label
                    key={index}
                    htmlFor={optionId}
                    className={`pv-choice is-box ${checked ? 'is-checked' : ''}`}
                  >
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        set(
                          checked
                            ? selected.filter((item) => item !== option)
                            : [...selected, option],
                        )
                      }
                      aria-describedby={a11y['aria-describedby']}
                      aria-invalid={a11y['aria-invalid']}
                    />
                    <span className="pv-choice-mark">
                      <Icon name="check" size={11} strokeWidth={2.4} />
                    </span>
                    <span>{option}</span>
                  </label>
                )
              })}
            </div>
          )}
        </FieldFrame>
      )
    }

    case 'switch': {
      const on = value as boolean
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <button
              {...a11y}
              type="button"
              role="switch"
              aria-checked={on}
              className={`pv-switch ${on ? 'is-on' : ''}`}
              onClick={() => set(!on)}
            >
              <span className="pv-switch-knob" />
            </button>
          )}
        </FieldFrame>
      )
    }

    case 'rating': {
      const current = value as number
      const shown = hoverStar || current
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <div
              id={a11y.id}
              className="pv-stars"
              role="radiogroup"
              aria-labelledby={a11y['aria-labelledby']}
              aria-describedby={a11y['aria-describedby']}
              aria-invalid={a11y['aria-invalid']}
              aria-required={a11y['aria-required']}
              onMouseLeave={() => setHoverStar(0)}
            >
              {Array.from({ length: block.max }, (_, index) => {
                const rating = index + 1
                return (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={rating === current}
                    className={`pv-star ${rating <= shown ? 'is-lit' : ''}`}
                    onMouseEnter={() => setHoverStar(rating)}
                    onClick={() => set(rating === current ? 0 : rating)}
                    aria-label={`${rating} of ${block.max}`}
                  >
                    <svg viewBox="0 0 24 24" width="26" height="26">
                      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
                    </svg>
                  </button>
                )
              })}
            </div>
          )}
        </FieldFrame>
      )
    }

    default: {
      const type =
        block.kind === 'email'
          ? 'email'
          : block.kind === 'url'
            ? 'url'
            : block.kind === 'number'
              ? 'number'
              : 'text'
      return (
        <FieldFrame block={block} error={error}>
          {(a11y) => (
            <input
              {...a11y}
              className="pv-input"
              type={type}
              placeholder={block.placeholder}
              value={value as string}
              min={block.kind === 'number' ? (block.min ?? undefined) : undefined}
              max={block.kind === 'number' ? (block.max ?? undefined) : undefined}
              onChange={(e) => set(e.target.value)}
            />
          )}
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
  const [fieldValidity, setFieldValidity] = useState<FieldValidity>({})
  const [payload, setPayload] = useState<Record<string, Value> | null>(null)

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

  const setValidity = (id: string, valid: boolean) => {
    setFieldValidity((previous) => {
      if (previous[id] === valid) return previous
      return { ...previous, [id]: valid }
    })
  }

  const focusField = (id: string) => {
    const control = document.getElementById(`pf-${id}-control`)
    const target =
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLButtonElement
        ? control
        : control?.querySelector<HTMLElement>('input, textarea, button, [tabindex]:not([tabindex="-1"])')
    target?.focus({ preventScroll: true })
    document
      .getElementById(`pf-${id}`)
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(doc, values, fieldValidity)
    setErrors(errs)
    const firstErrorId = Object.keys(errs)[0]
    if (firstErrorId) {
      focusField(firstErrorId)
      return
    }
    setPayload(buildPayload(doc, values))
  }

  const reset = () => {
    setValues(initValues(doc))
    setErrors({})
    setFieldValidity({})
    setPayload(null)
  }

  return (
    <main className={`preview form-style-${doc.style}`}>
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
                  {doc.blocks.map((b, index) => (
                    <PreviewField
                      key={b.id || `${b.kind}-${index}`}
                      block={b}
                      value={values[b.id] ?? initialValueForBlock(b)}
                      error={errors[b.id]}
                      set={(v) => setValue(b.id, v)}
                      onValidityChange={(valid) => setValidity(b.id, valid)}
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
          </form>
        )}
      </div>
    </main>
  )
}
