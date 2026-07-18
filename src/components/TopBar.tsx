import { useEffect, useRef, useState } from 'react'
import { useBuilder } from '../store'
import { TEMPLATES } from '../templates'
import { Icon } from './Icon'

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#CDF463" />
      <path
        d="M20 16h26a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H26v8h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H26v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2z"
        fill="#14160A"
      />
    </svg>
  )
}

export function TopBar() {
  const { state, dispatch } = useBuilder()
  const { doc, mode, past, future } = state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <header className="topbar">
      <div className="topbar-side">
        <a className="brand" href="./" title="FormForge">
          <BrandMark />
          <span className="brand-name">FormForge</span>
        </a>
        <div className="topbar-divider" />
        <input
          className="form-title-input"
          value={doc.title}
          size={Math.max(8, doc.title.length)}
          maxLength={80}
          spellCheck={false}
          onChange={(e) => dispatch({ type: 'update-form', patch: { title: e.target.value } })}
          aria-label="Form title"
        />
        <span className="save-hint">saved locally</span>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Editor mode">
        <div className={`mode-thumb ${mode === 'preview' ? 'is-preview' : ''}`} />
        <button
          role="tab"
          aria-selected={mode === 'build'}
          className={`mode-btn ${mode === 'build' ? 'is-active' : ''}`}
          onClick={() => dispatch({ type: 'set-mode', mode: 'build' })}
        >
          <Icon name="build" size={15} />
          Build
        </button>
        <button
          role="tab"
          aria-selected={mode === 'preview'}
          className={`mode-btn ${mode === 'preview' ? 'is-active' : ''}`}
          onClick={() => dispatch({ type: 'set-mode', mode: 'preview' })}
        >
          <Icon name="eye" size={15} />
          Preview
        </button>
      </div>

      <div className="topbar-side is-right">
        <button
          className="btn-icon is-optional"
          title="Undo (Ctrl+Z)"
          disabled={past.length === 0}
          onClick={() => dispatch({ type: 'undo' })}
        >
          <Icon name="undo" size={16} />
        </button>
        <button
          className="btn-icon is-optional"
          title="Redo (Ctrl+Shift+Z)"
          disabled={future.length === 0}
          onClick={() => dispatch({ type: 'redo' })}
        >
          <Icon name="redo" size={16} />
        </button>

        <div className="topbar-divider" />

        <div className="menu-wrap" ref={menuRef}>
          <button
            className="btn-ghost"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <Icon name="sparkle" size={15} />
            <span className="btn-ghost-label">Templates</span>
            <Icon name="chevronDown" size={13} className={menuOpen ? 'rot-180' : ''} />
          </button>
          {menuOpen && (
            <div className="menu" role="menu">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  role="menuitem"
                  className="menu-item"
                  onClick={() => {
                    dispatch({ type: 'load-doc', doc: t.make() })
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-name">{t.name}</span>
                  <span className="menu-item-tagline">{t.tagline}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn-ghost" onClick={() => dispatch({ type: 'set-modal', modal: 'import' })}>
          <Icon name="import" size={15} />
          <span className="btn-ghost-label">Import</span>
        </button>

        <button
          className="btn-primary"
          onClick={() => dispatch({ type: 'set-modal', modal: 'export' })}
        >
          <span>Export JSON</span>
          <span className="btn-primary-orb">
            <Icon name="export" size={14} strokeWidth={1.8} />
          </span>
        </button>

        <a
          className="btn-icon is-optional"
          href="https://github.com/Timorfiy/FormForge"
          target="_blank"
          rel="noreferrer"
          title="View on GitHub"
        >
          <Icon name="github" size={17} />
        </a>
      </div>
    </header>
  )
}
