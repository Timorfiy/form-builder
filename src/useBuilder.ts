import { useContext } from 'react'
import { BuilderContext, type BuilderContextValue } from './builder-context'

export function useBuilder(): BuilderContextValue {
  const context = useContext(BuilderContext)
  if (!context) throw new Error('useBuilder must be used inside BuilderProvider')
  return context
}
