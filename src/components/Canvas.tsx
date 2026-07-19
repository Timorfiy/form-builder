import { useState, type DragEvent } from 'react'
import { useBuilder } from '../useBuilder'
import type { Block, BlockKind } from '../types'
import { getMeta } from '../blocks/registry'
import { getMask, maskPlaceholder } from '../lib/masks'
import { TEMPLATES } from '../templates'
import { DND_MIME } from './Palette'
import { Icon } from './Icon'

interface DragPayload {
  source: 'palette' | 'canvas'
  kind?: BlockKind
  id?: string
}

function readPayload(e: DragEvent): DragPayload | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME)
    return raw ? (JSON.parse(raw) as DragPayload) : null
  } catch {
    return null
  }
}

/** Static, non-interactive rendering of a block inside the builder paper. */
function BlockMock({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className="mock-heading">{block.text}</h3>
    case 'paragraph':
      return <p className="mock-paragraph">{block.text}</p>
    case 'divider':
      if (block.variant === 'dashed') return <hr className="mock-divider is-dashed" />
      if (block.variant === 'dots')
        return (
          <div className="mock-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )
      return <hr className="mock-divider" />
    case 'phone': {
      const def = getMask(block.mask)
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-input">
            <span className="mock-placeholder">
              {def ? maskPlaceholder(def) : block.placeholder || 'Type here…'}
            </span>
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    }
    case 'rating':
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-stars">
            {Array.from({ length: block.max }, (_, i) => (
              <svg key={i} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
              </svg>
            ))}
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    case 'switch':
      return (
        <div className="mock-field">
          <div className="mock-switch-row">
            <FieldLabel label={block.label} required={false} />
            <span className={`mock-toggle ${block.defaultOn ? 'is-on' : ''}`}>
              <span className="mock-toggle-knob" />
            </span>
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    case 'dropdown':
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-input mock-select">
            <span className="mock-placeholder">{block.options[0] ?? 'Select…'}</span>
            <Icon name="chevronDown" size={15} />
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    case 'radio':
    case 'checkboxes':
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-options">
            {block.options.map((opt, i) => (
              <span key={i} className="mock-option">
                <span className={block.kind === 'radio' ? 'mock-radio' : 'mock-checkbox'} />
                {opt}
              </span>
            ))}
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    case 'longText':
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-input mock-textarea" style={{ minHeight: block.rows * 22 }}>
            <span className="mock-placeholder">{block.placeholder || 'Type here…'}</span>
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
    default:
      return (
        <div className="mock-field">
          <FieldLabel label={block.label} required={block.required} />
          <div className="mock-input">
            <span className="mock-placeholder">{block.placeholder || 'Type here…'}</span>
          </div>
          <HelpText text={block.helpText} />
        </div>
      )
  }
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="mock-label">
      {label}
      {required && <span className="mock-required">*</span>}
    </span>
  )
}

function HelpText({ text }: { text: string }) {
  if (!text) return null
  return <span className="mock-help">{text}</span>
}

interface ShellProps {
  block: Block
  index: number
  isSelected: boolean
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragOverShell: (index: number, e: DragEvent) => void
}

function BlockShell({ block, index, isSelected, isDragging, onDragStart, onDragEnd, onDragOverShell }: ShellProps) {
  const { state, dispatch } = useBuilder()
  const total = state.doc.blocks.length
  const meta = getMeta(block.kind)

  return (
    <div
      className={`block-shell ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DND_MIME, JSON.stringify({ source: 'canvas', id: block.id }))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(block.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOverShell(index, e)}
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'select', id: block.id })
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          dispatch({ type: 'select', id: block.id })
        }
      }}
      aria-label={`${meta.label} block`}
    >
      <div className="block-grip" title="Drag to reorder">
        <Icon name="grip" size={15} />
      </div>

      <div className="block-type-chip">
        <Icon name={meta.icon} size={11} />
        {meta.label}
      </div>

      <div className="block-content">
        <BlockMock block={block} />
      </div>

      <div className="block-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="block-tool"
          title="Move up"
          disabled={index === 0}
          onClick={() => dispatch({ type: 'move-block', id: block.id, toIndex: index - 1 })}
        >
          <Icon name="arrowUp" size={13} />
        </button>
        <button
          className="block-tool"
          title="Move down"
          disabled={index === total - 1}
          onClick={() => dispatch({ type: 'move-block', id: block.id, toIndex: index + 1 })}
        >
          <Icon name="arrowDown" size={13} />
        </button>
        <button
          className="block-tool"
          title="Duplicate"
          onClick={() => dispatch({ type: 'duplicate-block', id: block.id })}
        >
          <Icon name="copy" size={13} />
        </button>
        <button
          className="block-tool is-danger"
          title="Delete (Del)"
          onClick={() => dispatch({ type: 'remove-block', id: block.id })}
        >
          <Icon name="trash" size={13} />
        </button>
      </div>
    </div>
  )
}

export function Canvas() {
  const { state, dispatch } = useBuilder()
  const { doc, selectedId } = state
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const clearDrag = () => {
    setDropIndex(null)
    setDragId(null)
  }

  const onDragOverShell = (index: number, e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const before = e.clientY < rect.top + rect.height / 2
    const target = before ? index : index + 1
    if (target !== dropIndex) setDropIndex(target)
    e.dataTransfer.dropEffect = dragId ? 'move' : 'copy'
  }

  const onContainerDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (dropIndex === null && doc.blocks.length > 0) {
      setDropIndex(doc.blocks.length)
    }
  }

  const onContainerDragLeave = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndex(null)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const payload = readPayload(e)
    const at = dropIndex ?? doc.blocks.length
    if (payload?.source === 'palette' && payload.kind) {
      dispatch({ type: 'add-block', kind: payload.kind, index: at })
    } else if (payload?.source === 'canvas' && payload.id) {
      const from = doc.blocks.findIndex((b) => b.id === payload.id)
      if (from !== -1) {
        const to = at > from ? at - 1 : at
        dispatch({ type: 'move-block', id: payload.id, toIndex: to })
      }
    }
    clearDrag()
  }

  const isEmpty = doc.blocks.length === 0

  return (
    <main className="canvas" onClick={() => dispatch({ type: 'select', id: null })}>
      <div
        className="paper-tray"
        onDragOver={onContainerDragOver}
        onDragLeave={onContainerDragLeave}
        onDrop={onDrop}
      >
        <div className={`paper form-style-${doc.style}`}>
          <header className="paper-head">
            <h1 className="paper-title">{doc.title || 'Untitled form'}</h1>
            {doc.description && <p className="paper-desc">{doc.description}</p>}
          </header>

          {isEmpty ? (
            <div
              className={`empty-state ${dropIndex !== null ? 'is-hot' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDropIndex(0)
              }}
            >
              <div className="empty-icon">
                <Icon name="build" size={22} />
              </div>
              <p className="empty-title">Start building your form</p>
              <p className="empty-sub">
                Drag blocks from the palette, click any block to add it — or begin with a template.
              </p>
              <div className="empty-templates" onClick={(e) => e.stopPropagation()}>
                {TEMPLATES.filter((t) => t.id !== 'blank').map((t) => (
                  <button
                    key={t.id}
                    className="empty-chip"
                    onClick={() => dispatch({ type: 'load-doc', doc: t.make() })}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="paper-blocks">
              {doc.blocks.map((block, i) => (
                <div key={block.id} className="paper-block-slot">
                  {dropIndex === i && <div className="drop-line" />}
                  <BlockShell
                    block={block}
                    index={i}
                    isSelected={selectedId === block.id}
                    isDragging={dragId === block.id}
                    onDragStart={setDragId}
                    onDragEnd={clearDrag}
                    onDragOverShell={onDragOverShell}
                  />
                </div>
              ))}
              {dropIndex === doc.blocks.length && <div className="drop-line" />}
            </div>
          )}

          {!isEmpty && (
            <div className="paper-submit-row">
              <span className="paper-submit">
                {doc.submitLabel || 'Submit'}
                <span className="paper-submit-orb">
                  <Icon name="send" size={13} strokeWidth={1.8} />
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
