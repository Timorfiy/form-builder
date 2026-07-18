import type { Block, BlockKind, FormDoc } from '../types'
import { uid } from '../types'
import { createBlock, BLOCK_REGISTRY } from '../blocks/registry'

const VALID_KINDS = new Set<BlockKind>(BLOCK_REGISTRY.map((m) => m.kind))

export function serializeDoc(doc: FormDoc): string {
  return JSON.stringify({ $formforge: 1, ...doc }, null, 2)
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function strArray(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback
  const items = v.filter((x): x is string => typeof x === 'string')
  return items.length > 0 ? items : fallback
}

/** Coerce an untrusted parsed JSON value into a valid FormDoc. Throws on unusable input. */
export function parseDoc(raw: unknown): FormDoc {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('File is not a form definition.')
  }
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.blocks)) {
    throw new Error('Missing "blocks" array.')
  }

  const blocks: Block[] = []
  for (const rawBlock of obj.blocks as unknown[]) {
    if (typeof rawBlock !== 'object' || rawBlock === null) continue
    const b = rawBlock as Record<string, unknown>
    const kind = b.kind as BlockKind
    if (!VALID_KINDS.has(kind)) continue

    const base = createBlock(kind)
    const id = uid() // always regenerate ids to avoid collisions
    switch (base.kind) {
      case 'heading':
      case 'paragraph':
        blocks.push({ ...base, id, text: str(b.text, base.text) })
        break
      case 'divider':
        blocks.push({ ...base, id })
        break
      case 'shortText':
      case 'email':
      case 'phone':
      case 'url':
      case 'date':
      case 'longText':
        blocks.push({
          ...base,
          id,
          label: str(b.label, base.label),
          placeholder: str(b.placeholder, base.placeholder),
          helpText: str(b.helpText, base.helpText),
          required: bool(b.required, base.required),
          ...(base.kind === 'longText'
            ? { rows: numOrNull(b.rows) ?? base.rows }
            : {}),
        })
        break
      case 'number':
        blocks.push({
          ...base,
          id,
          label: str(b.label, base.label),
          placeholder: str(b.placeholder, base.placeholder),
          helpText: str(b.helpText, base.helpText),
          required: bool(b.required, base.required),
          min: numOrNull(b.min),
          max: numOrNull(b.max),
        })
        break
      case 'dropdown':
      case 'radio':
      case 'checkboxes':
        blocks.push({
          ...base,
          id,
          label: str(b.label, base.label),
          helpText: str(b.helpText, base.helpText),
          required: bool(b.required, base.required),
          options: strArray(b.options, base.options),
        })
        break
      case 'switch':
        blocks.push({
          ...base,
          id,
          label: str(b.label, base.label),
          helpText: str(b.helpText, base.helpText),
          defaultOn: bool(b.defaultOn, base.defaultOn),
        })
        break
      case 'rating':
        blocks.push({
          ...base,
          id,
          label: str(b.label, base.label),
          helpText: str(b.helpText, base.helpText),
          required: bool(b.required, base.required),
          max: Math.min(10, Math.max(3, numOrNull(b.max) ?? base.max)),
        })
        break
    }
  }

  return {
    title: str(obj.title, 'Untitled form'),
    description: str(obj.description, ''),
    submitLabel: str(obj.submitLabel, 'Submit'),
    accent: str(obj.accent, '#17171C'),
    blocks,
  }
}
