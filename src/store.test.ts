import { beforeEach, describe, expect, it } from 'vitest'
import type { FormDoc } from './types'
import {
  createBuilderState,
  createDefaultDoc,
  loadInitial,
  reducer,
  STORAGE_KEY,
} from './store'

function doc(title: string): FormDoc {
  return { ...createDefaultDoc(), title }
}

describe('builder reducer document replacement', () => {
  beforeEach(() => localStorage.clear())

  it('loads a document into Build, clears selection, and closes the modal', () => {
    const state = {
      ...createBuilderState(doc('Before')),
      mode: 'preview' as const,
      selectedId: 'old-block',
      modal: 'import' as const,
    }

    expect(reducer(state, { type: 'load-doc', doc: doc('After') })).toMatchObject({
      doc: { title: 'After' },
      mode: 'build',
      selectedId: null,
      modal: null,
    })
  })

  it('returns to Build and clears selection on undo and redo', () => {
    const changed = reducer(createBuilderState(doc('Before')), {
      type: 'update-form',
      patch: { title: 'After' },
    })
    const undone = reducer(
      { ...changed, mode: 'preview', selectedId: 'selected' },
      { type: 'undo' },
    )
    const redone = reducer(
      { ...undone, mode: 'preview', selectedId: 'selected-again' },
      { type: 'redo' },
    )

    expect(undone).toMatchObject({ doc: { title: 'Before' }, mode: 'build', selectedId: null })
    expect(redone).toMatchObject({ doc: { title: 'After' }, mode: 'build', selectedId: null })
  })

  it('falls back to the default form for corrupted or unsupported saved data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ $formforge: 99, blocks: [] }))
    expect(loadInitial()).toEqual(createDefaultDoc())

    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadInitial()).toEqual(createDefaultDoc())
  })
})
