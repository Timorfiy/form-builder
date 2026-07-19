import { useEffect } from 'react'
import { BuilderProvider } from './BuilderProvider'
import { useBuilder } from './useBuilder'
import { TopBar } from './components/TopBar'
import { Palette } from './components/Palette'
import { Canvas } from './components/Canvas'
import { Inspector } from './components/Inspector'
import { Preview } from './components/Preview'
import { ExportModal } from './components/ExportModal'
import './App.css'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

function KeyboardShortcuts() {
  const { state, dispatch } = useBuilder()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      if (mod && key === 'z') {
        e.preventDefault()
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' })
        return
      }
      if (mod && key === 'y') {
        e.preventDefault()
        dispatch({ type: 'redo' })
        return
      }
      if (mod && key === 'd' && state.selectedId && !isEditableTarget(e.target)) {
        e.preventDefault()
        dispatch({ type: 'duplicate-block', id: state.selectedId })
        return
      }
      if (isEditableTarget(e.target)) return

      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId && state.mode === 'build') {
        e.preventDefault()
        dispatch({ type: 'remove-block', id: state.selectedId })
      } else if (e.key === 'Escape' && !state.modal) {
        dispatch({ type: 'select', id: null })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.selectedId, state.mode, state.modal, dispatch])

  return null
}

function Shell() {
  const { state } = useBuilder()

  return (
    <div className="app">
      <TopBar />
      {state.mode === 'build' ? (
        <div className="workspace">
          <Palette />
          <Canvas />
          <Inspector />
        </div>
      ) : (
        <Preview />
      )}
      <ExportModal />
      <KeyboardShortcuts />
    </div>
  )
}

export default function App() {
  return (
    <BuilderProvider>
      <Shell />
    </BuilderProvider>
  )
}
