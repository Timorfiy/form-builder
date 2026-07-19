import { extractNationalDigits, getMask, nationalDigitCount } from './masks'
import type { Block, FormDoc } from '../types'
import { isFieldKind } from '../types'

export type Value = string | number | boolean | string[]
export type Values = Record<string, Value>
export type Errors = Record<string, string>
export type FieldValidity = Record<string, boolean>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/

export function initialValueForBlock(block: Block): Value {
  switch (block.kind) {
    case 'checkboxes':
      return []
    case 'switch':
      return block.defaultOn
    case 'rating':
      return 0
    default:
      return ''
  }
}

export function initValues(doc: FormDoc): Values {
  const values: Values = {}
  for (const block of doc.blocks) {
    values[block.id] = initialValueForBlock(block)
  }
  return values
}

export function validate(
  doc: FormDoc,
  values: Values,
  fieldValidity: FieldValidity = {},
): Errors {
  const errors: Errors = {}

  for (const block of doc.blocks) {
    if (!isFieldKind(block.kind)) continue
    const value = values[block.id] ?? initialValueForBlock(block)

    if (block.kind === 'date' && fieldValidity[block.id] === false) {
      errors[block.id] = 'Enter a valid date.'
      continue
    }

    if ('required' in block && block.required) {
      const empty =
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0) ||
        (block.kind === 'rating' && typeof value === 'number' && value === 0)
      if (empty) {
        errors[block.id] = 'This field is required.'
        continue
      }
    }

    if (typeof value !== 'string' || value.trim() === '') continue

    if (block.kind === 'email' && !EMAIL_RE.test(value)) {
      errors[block.id] = 'Enter a valid email address.'
    } else if (block.kind === 'url' && !URL_RE.test(value.trim())) {
      errors[block.id] = 'Enter a valid URL.'
    } else if (block.kind === 'phone') {
      const definition = getMask(block.mask)
      if (definition) {
        if (extractNationalDigits(value, definition).length !== nationalDigitCount(definition)) {
          errors[block.id] = 'Enter a complete phone number.'
        }
      } else if (!PHONE_RE.test(value)) {
        errors[block.id] = 'Enter a valid phone number.'
      }
    } else if (block.kind === 'number') {
      const number = Number(value)
      if (Number.isNaN(number)) errors[block.id] = 'Enter a number.'
      else if (block.min !== null && number < block.min) {
        errors[block.id] = `Must be at least ${block.min}.`
      } else if (block.max !== null && number > block.max) {
        errors[block.id] = `Must be at most ${block.max}.`
      }
    }
  }

  return errors
}

export function buildPayload(doc: FormDoc, values: Values): Record<string, Value> {
  const payload: Record<string, Value> = {}

  for (const block of doc.blocks) {
    if (!isFieldKind(block.kind) || !('label' in block)) continue

    const label = block.label
    let key = label
    let suffix = 2
    while (Object.hasOwn(payload, key)) {
      key = `${label} (${suffix})`
      suffix += 1
    }

    const value = values[block.id] ?? initialValueForBlock(block)
    payload[key] =
      block.kind === 'number' && typeof value === 'string' && value !== ''
        ? Number(value)
        : value
  }

  return payload
}
