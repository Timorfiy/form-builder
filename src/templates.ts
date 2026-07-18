import type { FormDoc, FormStyle } from './types'
import { uid } from './types'

export interface Template {
  id: string
  name: string
  tagline: string
  make: () => FormDoc
}

function base(partial: Partial<FormDoc> & { title: string }): FormDoc {
  return {
    description: '',
    submitLabel: 'Submit',
    style: 'classic' as FormStyle,
    blocks: [],
    ...partial,
  }
}

export const TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: 'Blank form',
    tagline: 'Start from scratch',
    make: () =>
      base({
        title: 'Untitled form',
        description: '',
        blocks: [],
      }),
  },
  {
    id: 'contact',
    name: 'Contact form',
    tagline: 'Name, email, message',
    make: () =>
      base({
        title: 'Get in touch',
        description: 'We usually reply within one business day.',
        submitLabel: 'Send message',
        style: 'classic',
        blocks: [
          { id: uid(), kind: 'shortText', label: 'Full name', placeholder: 'Ada Lovelace', helpText: '', required: true },
          { id: uid(), kind: 'email', label: 'Email address', placeholder: 'you@example.com', helpText: '', required: true },
          { id: uid(), kind: 'dropdown', label: 'Topic', helpText: '', required: false, options: ['General question', 'Project inquiry', 'Feedback', 'Something else'] },
          { id: uid(), kind: 'longText', label: 'Message', placeholder: 'Tell us what’s on your mind…', helpText: '', required: true, rows: 5 },
        ],
      }),
  },
  {
    id: 'rsvp',
    name: 'Event RSVP',
    tagline: 'Attendance + preferences',
    make: () =>
      base({
        title: 'Summer rooftop party',
        description: 'Saturday, August 15 · 7 PM · 21 Mercer St. Let us know if you’re coming.',
        submitLabel: 'Send RSVP',
        style: 'soft',
        blocks: [
          { id: uid(), kind: 'shortText', label: 'Your name', placeholder: 'Grace Hopper', helpText: '', required: true },
          { id: uid(), kind: 'email', label: 'Email address', placeholder: 'you@example.com', helpText: '', required: true },
          { id: uid(), kind: 'radio', label: 'Will you attend?', helpText: '', required: true, options: ['Yes, I’ll be there', 'Maybe', 'Can’t make it'] },
          { id: uid(), kind: 'number', label: 'Guests you’re bringing', placeholder: '0', helpText: 'Not counting yourself.', required: false, min: 0, max: 4 },
          { id: uid(), kind: 'checkboxes', label: 'Dietary preferences', helpText: '', required: false, options: ['Vegetarian', 'Vegan', 'Gluten-free', 'No restrictions'] },
          { id: uid(), kind: 'longText', label: 'Anything we should know?', placeholder: 'Allergies, song requests, +1 names…', helpText: '', required: false, rows: 3 },
        ],
      }),
  },
  {
    id: 'job',
    name: 'Job application',
    tagline: 'Candidate screening',
    make: () =>
      base({
        title: 'Senior Frontend Engineer',
        description: 'Remote · Full-time. We review every application within a week.',
        submitLabel: 'Apply now',
        style: 'noir',
        blocks: [
          { id: uid(), kind: 'heading', text: 'About you' },
          { id: uid(), kind: 'shortText', label: 'Full name', placeholder: 'Alan Turing', helpText: '', required: true },
          { id: uid(), kind: 'email', label: 'Email address', placeholder: 'you@example.com', helpText: '', required: true },
          { id: uid(), kind: 'url', label: 'Portfolio or LinkedIn', placeholder: 'https://…', helpText: '', required: false },
          { id: uid(), kind: 'divider', variant: 'dots' },
          { id: uid(), kind: 'heading', text: 'Experience' },
          { id: uid(), kind: 'dropdown', label: 'Years of experience', helpText: '', required: true, options: ['0–2', '3–5', '6–9', '10+'] },
          { id: uid(), kind: 'checkboxes', label: 'Technologies you know well', helpText: '', required: false, options: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Design systems'] },
          { id: uid(), kind: 'longText', label: 'Why this role?', placeholder: 'A few sentences are plenty…', helpText: '', required: true, rows: 4 },
          { id: uid(), kind: 'switch', label: 'I’m open to relocation', helpText: '', defaultOn: false },
        ],
      }),
  },
  {
    id: 'feedback',
    name: 'Product feedback',
    tagline: 'Rating + NPS style',
    make: () =>
      base({
        title: 'How are we doing?',
        description: 'Two minutes of your time makes the product better for everyone.',
        submitLabel: 'Send feedback',
        style: 'classic',
        blocks: [
          { id: uid(), kind: 'rating', label: 'Overall experience', helpText: '', required: true, max: 5 },
          { id: uid(), kind: 'radio', label: 'How likely are you to recommend us?', helpText: '', required: true, options: ['Very likely', 'Likely', 'Not sure', 'Unlikely'] },
          { id: uid(), kind: 'checkboxes', label: 'What do you use most?', helpText: '', required: false, options: ['Dashboard', 'Reports', 'Integrations', 'Mobile app', 'API'] },
          { id: uid(), kind: 'longText', label: 'What should we improve?', placeholder: 'Be honest — we can take it…', helpText: '', required: false, rows: 4 },
        ],
      }),
  },
]
