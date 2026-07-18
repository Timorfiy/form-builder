import type { Block, BlockKind } from '../types'
import { uid } from '../types'
import type { IconName } from '../components/Icon'

export interface BlockMeta {
  kind: BlockKind
  label: string
  hint: string
  icon: IconName
  group: 'Content' | 'Inputs' | 'Choices'
}

export const BLOCK_REGISTRY: BlockMeta[] = [
  { kind: 'heading', label: 'Heading', hint: 'Section title', icon: 'heading', group: 'Content' },
  { kind: 'paragraph', label: 'Paragraph', hint: 'Explanatory text', icon: 'paragraph', group: 'Content' },
  { kind: 'divider', label: 'Divider', hint: 'Visual separator', icon: 'divider', group: 'Content' },
  { kind: 'shortText', label: 'Short text', hint: 'Single-line answer', icon: 'text', group: 'Inputs' },
  { kind: 'longText', label: 'Long text', hint: 'Multi-line answer', icon: 'textarea', group: 'Inputs' },
  { kind: 'email', label: 'Email', hint: 'Validated email', icon: 'mail', group: 'Inputs' },
  { kind: 'phone', label: 'Phone', hint: 'Phone number', icon: 'phone', group: 'Inputs' },
  { kind: 'url', label: 'Website', hint: 'URL address', icon: 'link', group: 'Inputs' },
  { kind: 'number', label: 'Number', hint: 'Numeric value', icon: 'hash', group: 'Inputs' },
  { kind: 'date', label: 'Date', hint: 'Date picker', icon: 'calendar', group: 'Inputs' },
  { kind: 'dropdown', label: 'Dropdown', hint: 'Pick one, collapsed', icon: 'chevronDown', group: 'Choices' },
  { kind: 'radio', label: 'Single choice', hint: 'Pick one, visible', icon: 'radio', group: 'Choices' },
  { kind: 'checkboxes', label: 'Multiple choice', hint: 'Pick several', icon: 'checkbox', group: 'Choices' },
  { kind: 'switch', label: 'Switch', hint: 'Yes / no toggle', icon: 'toggle', group: 'Choices' },
  { kind: 'rating', label: 'Rating', hint: 'Star score', icon: 'star', group: 'Choices' },
]

export const PALETTE_GROUPS: BlockMeta['group'][] = ['Content', 'Inputs', 'Choices']

export function getMeta(kind: BlockKind): BlockMeta {
  const meta = BLOCK_REGISTRY.find((m) => m.kind === kind)
  if (!meta) throw new Error(`Unknown block kind: ${kind}`)
  return meta
}

export function createBlock(kind: BlockKind): Block {
  const id = uid()
  switch (kind) {
    case 'heading':
      return { id, kind, text: 'New section' }
    case 'paragraph':
      return { id, kind, text: 'Add a short explanation for the people filling out this form.' }
    case 'divider':
      return { id, kind, variant: 'line' }
    case 'shortText':
      return { id, kind, label: 'Your answer', placeholder: 'Type here…', helpText: '', required: false }
    case 'longText':
      return { id, kind, label: 'Your answer', placeholder: 'Type here…', helpText: '', required: false, rows: 4 }
    case 'email':
      return { id, kind, label: 'Email address', placeholder: 'you@example.com', helpText: '', required: true }
    case 'phone':
      return { id, kind, label: 'Phone number', placeholder: '+1 555 000 0000', helpText: '', required: false, mask: 'none' }
    case 'url':
      return { id, kind, label: 'Website', placeholder: 'https://…', helpText: '', required: false }
    case 'number':
      return { id, kind, label: 'Number', placeholder: '0', helpText: '', required: false, min: null, max: null }
    case 'date':
      return { id, kind, label: 'Pick a date', placeholder: '', helpText: '', required: false }
    case 'dropdown':
      return { id, kind, label: 'Choose one', helpText: '', required: false, options: ['Option 1', 'Option 2', 'Option 3'] }
    case 'radio':
      return { id, kind, label: 'Choose one', helpText: '', required: false, options: ['Option 1', 'Option 2', 'Option 3'] }
    case 'checkboxes':
      return { id, kind, label: 'Choose all that apply', helpText: '', required: false, options: ['Option 1', 'Option 2', 'Option 3'] }
    case 'switch':
      return { id, kind, label: 'Enable option', helpText: '', defaultOn: false }
    case 'rating':
      return { id, kind, label: 'Rate your experience', helpText: '', required: false, max: 5 }
  }
}
