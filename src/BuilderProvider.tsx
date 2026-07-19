import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { BuilderContext } from './builder-context'
import { serializeDoc } from './lib/serialize'
import { createBuilderState, reducer, STORAGE_KEY } from './store'

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createBuilderState())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeDoc(state.doc))
    } catch {
      // Storage may be full or unavailable; editing still works.
    }
  }, [state.doc])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}
