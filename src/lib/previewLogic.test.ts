import { describe, expect, it } from 'vitest'
import type { FormDoc } from '../types'
import { buildPayload, initValues, validate } from './previewLogic'

describe('preview form logic', () => {
  it('allocates collision-free payload keys while preserving labels verbatim', () => {
    const doc: FormDoc = {
      title: 'Payload',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'email-1',
          kind: 'email',
          label: 'Email',
          placeholder: '',
          helpText: '',
          required: false,
        },
        {
          id: 'email-2',
          kind: 'email',
          label: 'Email (2)',
          placeholder: '',
          helpText: '',
          required: false,
        },
        {
          id: 'email-3',
          kind: 'email',
          label: 'Email',
          placeholder: '',
          helpText: '',
          required: false,
        },
      ],
    }

    expect(
      buildPayload(doc, {
        'email-1': 'first@example.com',
        'email-2': 'second@example.com',
        'email-3': 'third@example.com',
      }),
    ).toEqual({
      Email: 'first@example.com',
      'Email (2)': 'second@example.com',
      'Email (3)': 'third@example.com',
    })
  })

  it('blocks a non-empty invalid optional date but allows an empty date', () => {
    const doc: FormDoc = {
      title: 'Date',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'date',
          kind: 'date',
          label: 'Event date',
          placeholder: '',
          helpText: '',
          required: false,
        },
      ],
    }
    const values = initValues(doc)

    expect(validate(doc, values)).toEqual({})
    expect(validate(doc, values, { date: false })).toEqual({ date: 'Enter a valid date.' })
    expect(validate(doc, { date: '2026-02-28' }, { date: true })).toEqual({})
  })

  it('uses type-safe initial values when a values entry is absent', () => {
    const doc: FormDoc = {
      title: 'Defaults',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'choices',
          kind: 'checkboxes',
          label: 'Choices',
          helpText: '',
          required: false,
          options: ['A'],
        },
        {
          id: 'enabled',
          kind: 'switch',
          label: 'Enabled',
          helpText: '',
          defaultOn: true,
        },
      ],
    }

    expect(buildPayload(doc, {})).toEqual({ Choices: [], Enabled: true })
  })
})
