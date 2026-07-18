<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="FormForge logo" />

# FormForge

**A visual, block-based form builder — right in your browser.**<br/>
Drag blocks, tune every detail, preview instantly, export clean JSON. No backend, no sign-up.

<a href="https://timorfiy.github.io/FormForge/"><strong>▸ Open the live app</strong></a>

[![Deploy](https://github.com/Timorfiy/FormForge/actions/workflows/deploy.yml/badge.svg)](https://github.com/Timorfiy/FormForge/actions/workflows/deploy.yml)
[![React 19](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8-a855f7?logo=vite&logoColor=white)](https://vite.dev)

</div>

---

## Features

<table>
<tr>
<td width="50%">

**15 block types** — headings, paragraphs, dividers (3 styles), short/long text, email, phone, URL, number, date, dropdown, single & multiple choice, switch, star rating

**3 form styles** — Classic, Noir and Soft themes restyle the whole form in one click

**Drag & drop** — pull blocks from the palette, reorder with live drop indicators; zero DnD dependencies

**Inspector** — labels, placeholders, help text, required flags, options, min/max, star counts

</td>
<td width="50%">

**Hand-built controls** — calendar date picker with month/year jump views and keyboard entry, animated dropdown listbox, phone masks for RU / US / UK / DE / FR

**Live preview** — real validation (required, formats, ranges, masks), animated success screen with the submitted JSON payload

**Export / import** — portable form JSON with full validation and coercion on load

**Comfort** — undo/redo history, keyboard shortcuts, templates, autosave to `localStorage`

</td>
</tr>
</table>

## How it works

1. **Pick blocks** from the palette — click or drag them onto the paper.
2. **Tune everything** in the inspector — or restyle the whole form with one style card.
3. **Preview & export** — test the live form, then copy or download its JSON definition.

Start fast with a template: *Contact form · Event RSVP · Job application · Product feedback*.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl / ⌘ + Z` | Undo |
| `Ctrl / ⌘ + Shift + Z` · `Ctrl + Y` | Redo |
| `Delete` / `Backspace` | Remove selected block |
| `Ctrl / ⌘ + D` | Duplicate selected block |
| `Esc` | Deselect / close dialog |

## Tech stack

- **React 19 + TypeScript** — strict mode, discriminated-union block model
- **Vite 8** + oxlint
- **Plain CSS** — custom design system (Geist / Geist Mono, dark glass shell, spring motion)
- **No UI libraries** — every control (calendar, listbox, masks, DnD) is hand-rolled

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

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # serve the production build
```

<details>
<summary><b>Project structure</b></summary>

```
src/
├── types.ts              # discriminated-union block model + form styles
├── store.tsx             # reducer, undo/redo history, localStorage persistence
├── templates.ts          # 5 starter templates
├── blocks/
│   └── registry.ts       # block metadata + default factories
├── lib/
│   ├── masks.ts          # phone country masks (format / validate)
│   └── serialize.ts      # JSON export / import with coercion
└── components/
    ├── TopBar.tsx        # brand, mode switch, templates, export
    ├── Palette.tsx       # draggable block palette
    ├── Canvas.tsx        # builder paper, HTML5 drag & drop
    ├── Inspector.tsx     # block + form settings
    ├── Preview.tsx       # live form, validation, success screen
    ├── DatePicker.tsx    # calendar with month/year views, keyboard entry
    ├── CustomSelect.tsx  # animated listbox with keyboard navigation
    ├── PhoneInput.tsx    # masked phone input
    └── ExportModal.tsx   # export / import dialog
```

</details>

## Deployment

Pushes to `main` build and deploy to GitHub Pages automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
The site is served under the `/FormForge/` base path (set in `vite.config.ts`).

---

<div align="center">
Built by <a href="https://github.com/Timorfiy">Timorfiy</a> · <a href="https://timorfiy.github.io/FormForge/">timorfiy.github.io/FormForge</a>
</div>
