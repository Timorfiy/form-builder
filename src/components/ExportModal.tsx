import { useEffect, useMemo, useRef, useState } from 'react'
import { useBuilder } from '../useBuilder'
import { serializeDoc, parseDoc } from '../lib/serialize'
import { Icon } from './Icon'

export function ExportModal() {
  const { state, dispatch } = useBuilder()
  const [tab, setTab] = useState<'export' | 'import'>(state.modal === 'import' ? 'import' : 'export')
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const json = useMemo(() => serializeDoc(state.doc), [state.doc])

  useEffect(() => {
    setTab(state.modal === 'import' ? 'import' : 'export')
  }, [state.modal])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'set-modal', modal: null })
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dispatch])

  if (!state.modal) return null

  const close = () => dispatch({ type: 'set-modal', modal: null })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'form'}.formforge.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (text: string) => {
    try {
      const doc = parseDoc(JSON.parse(text))
      dispatch({ type: 'load-doc', doc })
      setImportText('')
      setImportError('')
      close()
    } catch (err) {
      setImportError(err instanceof SyntaxError ? 'Invalid JSON — check for typos.' : (err as Error).message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Export or import form">
        <div className="modal-head">
          <div className="modal-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'export'}
              className={`modal-tab ${tab === 'export' ? 'is-active' : ''}`}
              onClick={() => setTab('export')}
            >
              <Icon name="export" size={14} />
              Export
            </button>
            <button
              role="tab"
              aria-selected={tab === 'import'}
              className={`modal-tab ${tab === 'import' ? 'is-active' : ''}`}
              onClick={() => setTab('import')}
            >
              <Icon name="import" size={14} />
              Import
            </button>
          </div>
          <button className="btn-icon" onClick={close} title="Close (Esc)">
            <Icon name="x" size={15} />
          </button>
        </div>

        {tab === 'export' ? (
          <div className="modal-body">
            <p className="modal-note">
              Your form as portable JSON — version it, share it, or feed it to your own renderer.
            </p>
            <pre className="code-block">{json}</pre>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={copy}>
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <button className="btn-primary" onClick={download}>
                <span>Download .json</span>
                <span className="btn-primary-orb">
                  <Icon name="export" size={13} strokeWidth={1.8} />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p className="modal-note">
              Paste a FormForge JSON definition, or open a <code>.json</code> file. This replaces the
              current form (undo with <kbd>Ctrl+Z</kbd>).
            </p>
            <textarea
              className="code-block is-editable"
              placeholder='{"title": "My form", "blocks": [ … ]}'
              value={importText}
              spellCheck={false}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError('')
              }}
            />
            {importError && <p className="import-error">{importError}</p>}
            <div className="modal-actions">
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  file.text().then(doImport)
                  e.target.value = ''
                }}
              />
              <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
                <Icon name="import" size={14} />
                Open file…
              </button>
              <button
                className="btn-primary"
                disabled={importText.trim() === ''}
                onClick={() => doImport(importText)}
              >
                <span>Import form</span>
                <span className="btn-primary-orb">
                  <Icon name="check" size={13} strokeWidth={2} />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
