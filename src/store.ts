import { createBlock } from './blocks/registry'
import { parseDoc } from './lib/serialize'
import type { Block, BlockKind, FormDoc } from './types'
import { uid } from './types'

export const STORAGE_KEY = 'formforge-doc-v1'
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

export function createDefaultDoc(): FormDoc {
  return {
    title: 'Untitled form',
    description: '',
    submitLabel: 'Submit',
    style: 'classic',
    blocks: [],
  }
}

export function loadInitial(): FormDoc {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return parseDoc(JSON.parse(raw))
  } catch {
    // Corrupted or unavailable storage is replaced with a fresh document.
  }
  return createDefaultDoc()
}

export function createBuilderState(doc: FormDoc = loadInitial()): BuilderState {
  return {
    doc,
    past: [],
    future: [],
    selectedId: null,
    mode: 'build',
    modal: null,
  }
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
    blocks: doc.blocks.map((block) =>
      block.id === id ? ({ ...block, ...patch } as Block) : block,
    ),
  }
}

export function reducer(state: BuilderState, action: Action): BuilderState {
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
      const from = state.doc.blocks.findIndex((block) => block.id === action.id)
      if (from === -1) return state
      const to = Math.max(0, Math.min(action.toIndex, state.doc.blocks.length - 1))
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
        { ...state.doc, blocks: state.doc.blocks.filter((block) => block.id !== action.id) },
        null,
      )
      return { ...next, selectedId: state.selectedId === action.id ? null : state.selectedId }
    }

    case 'duplicate-block': {
      const from = state.doc.blocks.findIndex((block) => block.id === action.id)
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
      return { ...next, selectedId: null, mode: 'build', modal: null }
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
        mode: 'build',
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
        mode: 'build',
      }
    }
  }
}
