import type { Category, ScoreSheet } from '../types'
import type { DiceSet } from './types'

export type E3Prime = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet, category: Category) => number
}

export const createE3Prime = (): E3Prime => {
  return {
    get: (scoreSheet, dice, category) => 0.0,
  }
}

export type E3 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

export type E2Prime = {
  get: (scoreSheet: ScoreSheet, partialDice: DiceSet) => number
}

export type E2 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

export type E1Prime = {
  get: (scoreSheet: ScoreSheet, partialDice: DiceSet) => number
}

export type E1 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

type E = {
  get: (scoreSheet: ScoreSheet) => number
}
