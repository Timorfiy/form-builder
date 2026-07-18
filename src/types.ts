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

/** Overall visual style of the rendered form */
export type FormStyle = 'classic' | 'noir' | 'soft'

export type DividerVariant = 'line' | 'dashed' | 'dots'

export type PhoneMaskId = 'none' | 'ru' | 'us' | 'uk' | 'de' | 'fr'

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
  variant: DividerVariant
}

export interface InputBlock extends BlockBase {
  kind: 'shortText' | 'email' | 'url' | 'date'
  label: string
  placeholder: string
  helpText: string
  required: boolean
}

export interface PhoneBlock extends BlockBase {
  kind: 'phone'
  label: string
  placeholder: string
  helpText: string
  required: boolean
  mask: PhoneMaskId
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
  | PhoneBlock
  | LongTextBlock
  | NumberBlock
  | OptionsBlock
  | SwitchBlock
  | RatingBlock

export interface FormDoc {
  title: string
  description: string
  submitLabel: string
  style: FormStyle
  blocks: Block[]
}

export const FORM_STYLES: { id: FormStyle; name: string; tagline: string }[] = [
  { id: 'classic', name: 'Classic', tagline: 'Clean white sheet, ink accents' },
  { id: 'noir', name: 'Noir', tagline: 'Dark card, glowing lime accents' },
  { id: 'soft', name: 'Soft', tagline: 'Warm paper, rounded, violet accents' },
]

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
