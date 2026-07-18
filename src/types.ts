export type BlockKind =
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'shortText'
  | 'longText'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkboxes'
  | 'switch'
  | 'rating'

interface BlockBase {
  id: string
  kind: BlockKind
}

export interface HeadingBlock extends BlockBase {
  kind: 'heading'
  text: string
}

export interface ParagraphBlock extends BlockBase {
  kind: 'paragraph'
  text: string
}

export interface DividerBlock extends BlockBase {
  kind: 'divider'
}

export interface InputBlock extends BlockBase {
  kind: 'shortText' | 'email' | 'phone' | 'url' | 'date'
  label: string
  placeholder: string
  helpText: string
  required: boolean
}

export interface LongTextBlock extends BlockBase {
  kind: 'longText'
  label: string
  placeholder: string
  helpText: string
  required: boolean
  rows: number
}

export interface NumberBlock extends BlockBase {
  kind: 'number'
  label: string
  placeholder: string
  helpText: string
  required: boolean
  min: number | null
  max: number | null
}

export interface OptionsBlock extends BlockBase {
  kind: 'dropdown' | 'radio' | 'checkboxes'
  label: string
  helpText: string
  required: boolean
  options: string[]
}

export interface SwitchBlock extends BlockBase {
  kind: 'switch'
  label: string
  helpText: string
  defaultOn: boolean
}

export interface RatingBlock extends BlockBase {
  kind: 'rating'
  label: string
  helpText: string
  required: boolean
  max: number
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | DividerBlock
  | InputBlock
  | LongTextBlock
  | NumberBlock
  | OptionsBlock
  | SwitchBlock
  | RatingBlock

export interface FormDoc {
  title: string
  description: string
  submitLabel: string
  accent: string
  blocks: Block[]
}

export const ACCENT_PRESETS = [
  { name: 'Ink', value: '#17171C' },
  { name: 'Violet', value: '#6C5CE7' },
  { name: 'Ember', value: '#E1552F' },
  { name: 'Forest', value: '#1F7A5C' },
  { name: 'Ocean', value: '#2E6BE6' },
] as const

export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)
  )
}

/** Kinds that participate in submission / validation */
export function isFieldKind(kind: BlockKind): boolean {
  return (
    kind !== 'heading' && kind !== 'paragraph' && kind !== 'divider'
  )
}
