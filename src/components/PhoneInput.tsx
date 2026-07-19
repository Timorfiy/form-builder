import type { PhoneMaskId } from '../types'
import { extractNationalDigits, formatPhone, getMask, maskPlaceholder } from '../lib/masks'

export function PhoneInput({
  id,
  value,
  onChange,
  maskId,
  placeholder,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  maskId: PhoneMaskId
  placeholder?: string
  'aria-labelledby': string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}) {
  const def = getMask(maskId)

  if (!def) {
    return (
      <input
        id={id}
        className="pv-input"
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      />
    )
  }

  return (
    <input
      id={id}
      className="pv-input"
      type="tel"
      inputMode="tel"
      placeholder={maskPlaceholder(def)}
      value={value}
      onChange={(e) => {
        const digits = extractNationalDigits(e.target.value, def)
        onChange(formatPhone(digits, def))
      }}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
    />
  )
}
