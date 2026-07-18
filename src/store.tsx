import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Block, BlockKind, FormDoc } from './types'
import { uid } from './types'
import { createBlock } from './blocks/registry'

const STORAGE_KEY = 'formforge-doc-v1'
const HISTORY_LIMIT = 80
const COALESCE_MS = 900

export type Mode = 'build' | 'preview'
export type ModalKind = 'export' | 'import' | null

interface HistoryEntry {
  doc: FormDoc
  coalesceKey: string | null
  time: number
}

export interface BuilderState {
  doc: FormDoc
  past: HistoryEntry[]
  future: FormDoc[]
  selectedId: string | null
  mode: Mode
  modal: ModalKind
}

export type Action =
  | { type: 'add-block'; kind: BlockKind; index?: number }
  | { type: 'move-block'; id: string; toIndex: number }
  | { type: 'update-block'; id: string; patch: Partial<Block> }
  | { type: 'remove-block'; id: string }
  | { type: 'duplicate-block'; id: string }
  | { type: 'update-form'; patch: Partial<Omit<FormDoc, 'blocks'>> }
  | { type: 'load-doc'; doc: FormDoc }
  | { type: 'select'; id: string | null }
  | { type: 'set-mode'; mode: Mode }
  | { type: 'set-modal'; modal: ModalKind }
  | { type: 'undo' }
  | { type: 'redo' }

function loadInitial(): FormDoc {
  const fallback: FormDoc = {
    title: 'Untitled form',
    description: '',
    submitLabel: 'Submit',
    style: 'classic',
    blocks: [],
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FormDoc>
      if (parsed && Array.isArray(parsed.blocks)) {
        return {
          title: typeof parsed.title === 'string' ? parsed.title : fallback.title,
          description:
            typeof parsed.description === 'string' ? parsed.description : fallback.description,
          submitLabel:
            typeof parsed.submitLabel === 'string' ? parsed.submitLabel : fallback.submitLabel,
          style:
            parsed.style === 'noir' || parsed.style === 'soft' ? parsed.style : 'classic',
          // backfill fields introduced after the doc was saved
          blocks: parsed.blocks.map((b) => {
            if (b.kind === 'phone' && (b as { mask?: unknown }).mask === undefined) {
              return { ...b, mask: 'none' as const }
            }
            if (b.kind === 'divider' && (b as { variant?: unknown }).variant === undefined) {
              return { ...b, variant: 'line' as const }
            }
            return b
          }),
        }
      }
    }
  } catch {
    /* corrupted storage — fall through to default */
  }
  return fallback
}

const initialState: BuilderState = {
  doc: loadInitial(),
  past: [],
  future: [],
  selectedId: null,
  mode: 'build',
  modal: null,
}

/** Push current doc onto the undo stack, coalescing rapid edits of the same field. */
function commit(state: BuilderState, nextDoc: FormDoc, coalesceKey: string | null): BuilderState {
  const now = Date.now()
  const last = state.past[state.past.length - 1]
  const coalesce =
    coalesceKey !== null &&
    last !== undefined &&
    last.coalesceKey === coalesceKey &&
    now - last.time < COALESCE_MS

  const past = coalesce
    ? state.past
    : [...state.past.slice(-(HISTORY_LIMIT - 1)), { doc: state.doc, coalesceKey, time: now }]

  return { ...state, doc: nextDoc, past, future: [] }
}

function updateBlockIn(doc: FormDoc, id: string, patch: Partial<Block>): FormDoc {
  return {
    ...doc,
    blocks: doc.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
  }
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'add-block': {
      const block = createBlock(action.kind)
      const index = action.index ?? state.doc.blocks.length
      const blocks = [...state.doc.blocks]
      blocks.splice(Math.max(0, Math.min(index, blocks.length)), 0, block)
      const next = commit(state, { ...state.doc, blocks }, null)
      return { ...next, selectedId: block.id }
    }

    case 'move-block': {
      const from = state.doc.blocks.findIndex((b) => b.id === action.id)
      if (from === -1) return state
      let to = Math.max(0, Math.min(action.toIndex, state.doc.blocks.length - 1))
      if (from === to) return state
      const blocks = [...state.doc.blocks]
      const [moved] = blocks.splice(from, 1)
      blocks.splice(to, 0, moved)
      return commit(state, { ...state.doc, blocks }, null)
    }

    case 'update-block':
      return commit(
        state,
        updateBlockIn(state.doc, action.id, action.patch),
        `block:${action.id}:${Object.keys(action.patch).join(',')}`,
      )

    case 'remove-block': {
      const next = commit(
        state,
        { ...state.doc, blocks: state.doc.blocks.filter((b) => b.id !== action.id) },
        null,
      )
      return { ...next, selectedId: state.selectedId === action.id ? null : state.selectedId }
    }

    case 'duplicate-block': {
      const from = state.doc.blocks.findIndex((b) => b.id === action.id)
      if (from === -1) return state
      const copy = { ...state.doc.blocks[from], id: uid() }
      const blocks = [...state.doc.blocks]
      blocks.splice(from + 1, 0, copy)
      const next = commit(state, { ...state.doc, blocks }, null)
      return { ...next, selectedId: copy.id }
    }

    case 'update-form':
      return commit(
        state,
        { ...state.doc, ...action.patch },
        `form:${Object.keys(action.patch).join(',')}`,
      )

    case 'load-doc': {
      const next = commit(state, action.doc, null)
      return { ...next, selectedId: null }
    }

    case 'select':
      return { ...state, selectedId: action.id }

    case 'set-mode':
      return { ...state, mode: action.mode, selectedId: null }

    case 'set-modal':
      return { ...state, modal: action.modal }

    case 'undo': {
      const entry = state.past[state.past.length - 1]
      if (!entry) return state
      return {
        ...state,
        doc: entry.doc,
        past: state.past.slice(0, -1),
        future: [state.doc, ...state.future].slice(0, HISTORY_LIMIT),
        selectedId: null,
      }
    }

    case 'redo': {
      const [next, ...rest] = state.future
      if (!next) return state
      return {
        ...state,
        doc: next,
        past: [...state.past, { doc: state.doc, coalesceKey: null, time: Date.now() }],
        future: rest,
        selectedId: null,
      }
    }
  }
}

interface BuilderContextValue {
  state: BuilderState
  dispatch: React.Dispatch<Action>
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.doc))
    } catch {
      /* storage full or unavailable — editing still works */
    }
  }, [state.doc])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export function useBuilder(): BuilderContextValue {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used inside BuilderProvider')
  return ctx
}
