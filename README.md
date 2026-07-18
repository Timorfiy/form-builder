# FormForge — Visual Form Builder

A block-based form builder that runs entirely in the browser. Drag blocks onto the page, tune every detail in the inspector, preview the live form with real validation, and export a clean, portable JSON definition.

**Live demo:** https://timorfiy.github.io/form-builder/

## Features

- **15 block types** — heading, paragraph, divider (3 styles), short/long text, email, phone, URL, number, date, dropdown, single choice, multiple choice, switch, rating
- **3 form styles** — Classic, Noir and Soft themes restyle the whole form (paper, fields, accents) in one click
- **Drag & drop** — drag blocks from the palette to the canvas, drag to reorder (HTML5 DnD, no dependencies)
- **Inspector** — edit labels, placeholders, help text, required flags, options, min/max, star counts
- **Custom form controls** — hand-built date picker with month calendar, animated dropdown listbox, and phone inputs with country masks (RU +7, US +1, UK +44, DE +49, FR +33)
- **Live preview** — the form as end users see it: working inputs, validation (required, email/URL/phone formats, number ranges, mask completeness), animated success screen with the submitted JSON payload
- **Export / import** — copy or download the form as JSON; import it back with full validation and coercion
- **Templates** — contact form, event RSVP, job application, product feedback, or blank
- **Undo / redo** — full history with coalesced keystroke edits (`Ctrl+Z` / `Ctrl+Shift+Z`)
- **Keyboard shortcuts** — `Del` remove block, `Ctrl+D` duplicate, `Esc` deselect
- **Autosave** — the form persists to `localStorage`
- **Zero backend** — 100% client-side, deployable to any static host

## Tech stack

- React 19 + TypeScript (strict, discriminated-union block model)
- Vite 8, oxlint
- Plain CSS with a custom design system (Geist / Geist Mono, dark glass shell + light paper canvas)

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # serve the production build
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages automatically via `.github/workflows/deploy.yml`. The site is served under the `/form-builder/` base path (configured in `vite.config.ts`).

## Form JSON schema

```jsonc
{
  "$formforge": 1,
  "title": "Get in touch",
  "description": "We usually reply within one business day.",
  "submitLabel": "Send message",
  "style": "classic",           // "classic" | "noir" | "soft"
  "blocks": [
    {
      "id": "a1b2c3",
      "kind": "email",          // one of 15 block kinds
      "label": "Email address",
      "placeholder": "you@example.com",
      "helpText": "",
      "required": true
    }
    // option blocks add "options": [...], number blocks add "min"/"max",
    // phone blocks add "mask": "ru"|"us"|"uk"|"de"|"fr"|"none",
    // dividers add "variant": "line"|"dashed"|"dots"
  ]
}
```
