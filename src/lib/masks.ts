import type { PhoneMaskId } from '../types'

export interface MaskDef {
  id: Exclude<PhoneMaskId, 'none'>
  name: string
  /** country calling code without '+' */
  dial: string
  /** pattern for the national number; '#' is a digit slot */
  pattern: string
}

export const PHONE_MASKS: MaskDef[] = [
  { id: 'ru', name: 'Russia', dial: '7', pattern: '(###) ###-##-##' },
  { id: 'us', name: 'USA / Canada', dial: '1', pattern: '(###) ###-####' },
  { id: 'uk', name: 'United Kingdom', dial: '44', pattern: '## #### ####' },
  { id: 'de', name: 'Germany', dial: '49', pattern: '### #######' },
  { id: 'fr', name: 'France', dial: '33', pattern: '# ## ## ## ##' },
]

export function getMask(id: PhoneMaskId): MaskDef | null {
  return PHONE_MASKS.find((m) => m.id === id) ?? null
}

export function nationalDigitCount(def: MaskDef): number {
  return (def.pattern.match(/#/g) ?? []).length
}

/** Digits-only national part (without country code, RU trunk '8' normalized). */
export function extractNationalDigits(raw: string, def: MaskDef): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith(def.dial)) {
    digits = digits.slice(def.dial.length)
  } else if (def.id === 'ru' && digits.startsWith('8')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, nationalDigitCount(def))
}

/** Format national digits into the mask pattern (supports partial input). */
export function formatNational(digits: string, def: MaskDef): string {
  let out = ''
  let i = 0
  for (let p = 0; p < def.pattern.length && i < digits.length; p++) {
    const ch = def.pattern[p]
    if (ch === '#') {
      out += digits[i]
      i++
    } else if (i < digits.length) {
      // a literal is only emitted when more digits will follow it
      out += ch
    }
  }
  return out
}

/** Full display value including the dial prefix. */
export function formatPhone(digits: string, def: MaskDef): string {
  const national = formatNational(digits, def)
  return national ? `+${def.dial} ${national}` : ''
}

/** Placeholder preview of the mask, e.g. +7 (___) ___-__-__ */
export function maskPlaceholder(def: MaskDef): string {
  return `+${def.dial} ${def.pattern.replace(/#/g, '_')}`
}
