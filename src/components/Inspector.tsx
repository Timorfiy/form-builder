import type { ReactNode } from 'react'
import { useBuilder } from '../store'
import type { Block, NumberBlock, OptionsBlock, RatingBlock } from '../types'
import { ACCENT_PRESETS } from '../types'
import { getMeta } from '../blocks/registry'
import { Icon } from './Icon'

/* ---------- small form controls ---------- */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="insp-field">
      <span className="insp-label">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`insp-toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="insp-toggle-track">
        <span className="insp-toggle-knob" />
      </span>
      <span className="insp-toggle-label">{label}</span>
    </button>
  )
}

/* ---------- options list editor ---------- */

function OptionsEditor({ block }: { block: OptionsBlock }) {
  const { dispatch } = useBuilder()
  const setOptions = (options: string[]) =>
    dispatch({ type: 'update-block', id: block.id, patch: { options } })

  return (
    <div className="insp-field">
      <span className="insp-label">Options</span>
      <div className="opt-list">
        {block.options.map((opt, i) => (
          <div key={i} className="opt-row">
            <span className="opt-grip">
              <Icon name={block.kind === 'radio' ? 'radio' : block.kind === 'checkboxes' ? 'checkbox' : 'chevronDown'} size={12} />
            </span>
            <input
              className="insp-input"
              value={opt}
              onChange={(e) => {
                const next = [...block.options]
                next[i] = e.target.value
                setOptions(next)
              }}
            />
            <button
              className="opt-remove"
              title="Remove option"
              disabled={block.options.length <= 1}
              onClick={() => setOptions(block.options.filter((_, j) => j !== i))}
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        ))}
        <button
          className="opt-add"
          onClick={() => setOptions([...block.options, `Option ${block.options.length + 1}`])}
        >
          <Icon name="plus" size={13} />
          Add option
        </button>
      </div>
    </div>
  )
}

/* ---------- per-kind settings ---------- */

function BlockSettings({ block }: { block: Block }) {
  const { dispatch } = useBuilder()
  const meta = getMeta(block.kind)
  const patch = (p: Partial<Block>) => dispatch({ type: 'update-block', id: block.id, patch: p })

  const hasLabel =
    block.kind !== 'heading' && block.kind !== 'paragraph' && block.kind !== 'divider'
  const hasPlaceholder =
    block.kind === 'shortText' ||
    block.kind === 'longText' ||
    block.kind === 'email' ||
    block.kind === 'phone' ||
    block.kind === 'url' ||
    block.kind === 'number'
  const hasRequired =
    hasLabel && block.kind !== 'switch'
  const hasHelp = block.kind !== 'divider'

  return (
    <>
      <div className="insp-block-head">
        <span className="insp-block-chip">
          <Icon name={meta.icon} size={13} />
          {meta.label}
        </span>
        <div className="insp-block-actions">
          <button
            className="btn-icon"
            title="Duplicate block"
            onClick={() => dispatch({ type: 'duplicate-block', id: block.id })}
          >
            <Icon name="copy" size={15} />
          </button>
          <button
            className="btn-icon is-danger"
            title="Delete block"
            onClick={() => dispatch({ type: 'remove-block', id: block.id })}
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>

      {(block.kind === 'heading' || block.kind === 'paragraph') && (
        <Field label="Text">
          <textarea
            className="insp-input insp-textarea"
            rows={block.kind === 'paragraph' ? 4 : 2}
            value={block.text}
            onChange={(e) => patch({ text: e.target.value })}
          />
        </Field>
      )}

      {hasLabel && (
        <Field label="Label">
          <input
            className="insp-input"
            value={block.label}
            onChange={(e) => patch({ label: e.target.value })}
          />
        </Field>
      )}

      {hasPlaceholder && 'placeholder' in block && (
        <Field label="Placeholder">
          <input
            className="insp-input"
            value={block.placeholder}
            onChange={(e) => patch({ placeholder: e.target.value })}
          />
        </Field>
      )}

      {hasHelp && 'helpText' in block && (
        <Field label="Help text">
          <input
            className="insp-input"
            value={block.helpText}
            placeholder="Optional hint under the field"
            onChange={(e) => patch({ helpText: e.target.value })}
          />
        </Field>
      )}

      {block.kind === 'longText' && (
        <Field label={`Rows — ${block.rows}`}>
          <input
            type="range"
            min={2}
            max={12}
            value={block.rows}
            className="insp-range"
            onChange={(e) => patch({ rows: Number(e.target.value) })}
          />
        </Field>
      )}

      {block.kind === 'number' && (
        <div className="insp-row">
          <Field label="Min">
            <input
              className="insp-input"
              type="number"
              value={(block as NumberBlock).min ?? ''}
              placeholder="—"
              onChange={(e) =>
                patch({ min: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Max">
            <input
              className="insp-input"
              type="number"
              value={(block as NumberBlock).max ?? ''}
              placeholder="—"
              onChange={(e) =>
                patch({ max: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </Field>
        </div>
      )}

      {(block.kind === 'dropdown' || block.kind === 'radio' || block.kind === 'checkboxes') && (
        <OptionsEditor block={block as OptionsBlock} />
      )}

      {block.kind === 'rating' && (
        <Field label={`Stars — ${(block as RatingBlock).max}`}>
          <input
            type="range"
            min={3}
            max={10}
            value={(block as RatingBlock).max}
            className="insp-range"
            onChange={(e) => patch({ max: Number(e.target.value) })}
          />
        </Field>
      )}

      {block.kind === 'switch' && (
        <Toggle
          label="On by default"
          checked={block.defaultOn}
          onChange={(v) => patch({ defaultOn: v })}
        />
      )}

      {hasRequired && 'required' in block && (
        <Toggle
          label="Required field"
          checked={block.required}
          onChange={(v) => patch({ required: v })}
        />
      )}
    </>
  )
}

/* ---------- form settings ---------- */

function FormSettings() {
  const { state, dispatch } = useBuilder()
  const { doc } = state
  const patch = (p: Partial<typeof doc>) => dispatch({ type: 'update-form', patch: p })

  return (
    <>
      <div className="panel-head">
        <span className="panel-title">Form settings</span>
      </div>

      <Field label="Title">
        <input
          className="insp-input"
          value={doc.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Field>

      <Field label="Description">
        <textarea
          className="insp-input insp-textarea"
          rows={3}
          value={doc.description}
          placeholder="Shown under the title"
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>

      <Field label="Submit button label">
        <input
          className="insp-input"
          value={doc.submitLabel}
          onChange={(e) => patch({ submitLabel: e.target.value })}
        />
      </Field>

      <div className="insp-field">
        <span className="insp-label">Accent color</span>
        <div className="swatch-row">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              className={`swatch ${doc.accent === preset.value ? 'is-active' : ''}`}
              style={{ background: preset.value }}
              title={preset.name}
              onClick={() => patch({ accent: preset.value })}
            >
              {doc.accent === preset.value && <Icon name="check" size={12} strokeWidth={2.2} />}
            </button>
          ))}
        </div>
      </div>

      <div className="insp-stats">
        <div className="insp-stat">
          <span className="insp-stat-num">{doc.blocks.length}</span>
          <span className="insp-stat-label">blocks</span>
        </div>
        <div className="insp-stat">
          <span className="insp-stat-num">
            {doc.blocks.filter((b) => 'required' in b && b.required).length}
          </span>
          <span className="insp-stat-label">required</span>
        </div>
        <div className="insp-stat">
          <span className="insp-stat-num">{doc.title.length + doc.description.length}</span>
          <span className="insp-stat-label">chars of copy</span>
        </div>
      </div>

      <div className="insp-danger">
        <button
          className="btn-danger"
          onClick={() => {
            if (window.confirm('Remove all blocks? This can be undone with Ctrl+Z.')) {
              dispatch({
                type: 'load-doc',
                doc: { ...doc, blocks: [] },
              })
            }
          }}
        >
          <Icon name="trash" size={14} />
          Clear all blocks
        </button>
      </div>
    </>
  )
}

/* ---------- inspector shell ---------- */

export function Inspector() {
  const { state, dispatch } = useBuilder()
  const block = state.doc.blocks.find((b) => b.id === state.selectedId) ?? null

  return (
    <aside className={`inspector ${block ? 'has-selection' : ''}`} aria-label="Inspector">
      <button
        className="inspector-close btn-icon"
        title="Close"
        onClick={() => dispatch({ type: 'select', id: null })}
      >
        <Icon name="x" size={15} />
      </button>
      <div className="inspector-scroll">
        {block ? (
          <>
            <div className="panel-head">
              <span className="panel-title">Block settings</span>
            </div>
            <BlockSettings block={block} />
          </>
        ) : (
          <FormSettings />
        )}
      </div>
    </aside>
  )
}
