import type { PhoneMaskId } from '../types'
import { extractNationalDigits, formatPhone, getMask, maskPlaceholder } from '../lib/masks'

export function PhoneInput({
  value,
  onChange,
  maskId,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  maskId: PhoneMaskId
  placeholder?: string
}) {
  const def = getMask(maskId)

  if (!def) {
    return (
      <input
        className="pv-input"
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <input
      className="pv-input"
      type="tel"
      inputMode="tel"
      placeholder={maskPlaceholder(def)}
      value={value}
      onChange={(e) => {
        const digits = extractNationalDigits(e.target.value, def)
        onChange(formatPhone(digits, def))
      }}
    />
  )
}
