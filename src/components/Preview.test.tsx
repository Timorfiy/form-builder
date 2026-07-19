import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BuilderContext } from '../builder-context'
import { createBuilderState } from '../store'
import type { FormDoc } from '../types'
import { Preview } from './Preview'

function renderPreview(doc: FormDoc) {
  const state = { ...createBuilderState(doc), mode: 'preview' as const }
  const dispatch = vi.fn()
  render(
    <BuilderContext.Provider value={{ state, dispatch }}>
      <Preview />
    </BuilderContext.Provider>,
  )
  return { dispatch }
}

describe('Preview accessibility and date validation', () => {
  it('exposes the main controls through their visible labels and accessible groups', () => {
    renderPreview({
      title: 'Accessible form',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'email',
          kind: 'email',
          label: 'Email',
          placeholder: '',
          helpText: 'We will only use this to reply.',
          required: false,
        },
        {
          id: 'date',
          kind: 'date',
          label: 'Event date',
          placeholder: '',
          helpText: '',
          required: false,
        },
        {
          id: 'phone',
          kind: 'phone',
          label: 'Phone',
          placeholder: '',
          helpText: '',
          required: false,
          mask: 'none',
        },
        {
          id: 'topic',
          kind: 'dropdown',
          label: 'Topic',
          helpText: '',
          required: false,
          options: ['Question'],
        },
        {
          id: 'attendance',
          kind: 'radio',
          label: 'Will you attend?',
          helpText: '',
          required: false,
          options: ['Yes', 'No'],
        },
        {
          id: 'features',
          kind: 'checkboxes',
          label: 'Useful features',
          helpText: '',
          required: false,
          options: ['Reports'],
        },
      ],
    })

    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-describedby',
      'pf-email-help',
    )
    expect(screen.getByLabelText('Event date')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Topic')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Will you attend?' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Useful features' })).toBeInTheDocument()
  })

  it('keeps an invalid optional date editable, blocks submit, and focuses it', async () => {
    const user = userEvent.setup()
    renderPreview({
      title: 'Date form',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'date',
          kind: 'date',
          label: 'Event date',
          placeholder: '',
          helpText: 'Use DD.MM.YYYY.',
          required: false,
        },
      ],
    })

    const date = screen.getByLabelText('Event date')
    await user.type(date, '31022026')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(date).toHaveValue('31.02.2026')
    expect(date).toHaveAttribute('aria-invalid', 'true')
    expect(date).toHaveAttribute(
      'aria-describedby',
      'pf-date-help pf-date-error',
    )
    expect(screen.getByText('Enter a valid date.')).toBeInTheDocument()
    expect(date).toHaveFocus()
    expect(screen.queryByText('Response recorded')).not.toBeInTheDocument()

    await user.clear(date)
    await user.type(date, '28022026')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Response recorded')).toBeInTheDocument()
    expect(
      screen.getByText((_, element) =>
        Boolean(element?.tagName === 'PRE' && element.textContent?.includes('"Event date": "2026-02-28"')),
      ),
    ).toBeInTheDocument()
  })

  it('marks and focuses the first required control after submit', async () => {
    const user = userEvent.setup()
    renderPreview({
      title: 'Required form',
      description: '',
      submitLabel: 'Submit',
      style: 'classic',
      blocks: [
        {
          id: 'name',
          kind: 'shortText',
          label: 'Full name',
          placeholder: '',
          helpText: '',
          required: true,
        },
        {
          id: 'email',
          kind: 'email',
          label: 'Email',
          placeholder: '',
          helpText: '',
          required: true,
        },
      ],
    })

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    const name = screen.getByLabelText('Full name')

    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAttribute('aria-required', 'true')
    expect(name).toHaveAttribute('aria-describedby', 'pf-name-error')
  })
})
