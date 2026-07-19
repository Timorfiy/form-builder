import { createContext, type Dispatch } from 'react'
import type { Action, BuilderState } from './store'

export interface BuilderContextValue {
  state: BuilderState
  dispatch: Dispatch<Action>
}

export const BuilderContext = createContext<BuilderContextValue | null>(null)
