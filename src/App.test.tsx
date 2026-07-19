import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const affectedTemplates = [
  {
    templateName: 'Event RSVP',
    title: 'Summer rooftop party',
    checkboxGroup: 'Dietary preferences',
  },
  {
    templateName: 'Job application',
    title: 'Senior Frontend Engineer',
    checkboxGroup: 'Technologies you know well',
  },
  {
    templateName: 'Product feedback',
    title: 'How are we doing?',
    checkboxGroup: 'What do you use most?',
  },
] as const

describe('template selection from Preview', () => {
  beforeEach(() => localStorage.clear())

  it.each(affectedTemplates)(
    'renders $title after selecting the template in Preview',
    async ({ templateName, title, checkboxGroup }) => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getByRole('tab', { name: 'Preview' }))
      await user.click(screen.getByRole('button', { name: 'Templates' }))
      const templateButton = screen
        .getByText(templateName, { selector: '.menu-item-name' })
        .closest('button')
      if (!templateButton) throw new Error(`Template button not found: ${templateName}`)
      await user.click(templateButton)

      expect(screen.getByRole('tab', { name: 'Build' })).toHaveAttribute(
        'aria-selected',
        'true',
      )

      await user.click(screen.getByRole('tab', { name: 'Preview' }))

      expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: checkboxGroup })).toBeInTheDocument()
    },
  )
})
