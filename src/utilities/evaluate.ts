import type { Choice, FullDice, ScoreSheet } from '../types'
import { createDiceTable } from './dice-table'
import {
  createE1Prime,
  createE2,
  createE2Prime,
  createE3,
  createE3Prime,
  createEFromBinary,
  type E1Prime,
  type E2Prime,
  type E3Prime,
} from './expected-value'
import { createProbTable } from './probability'
import type { DiceSet } from './types'

export type Evaluators = {
  e1Prime: E1Prime
  e2Prime: E2Prime
  e3Prime: E3Prime
}

export const createEvaluators = async (binaryFilePath: string) => {
  const probTable = createProbTable()
  const diceTable = createDiceTable()
  const e = await createEFromBinary(binaryFilePath)
  const e3Prime = createE3Prime(e)
  const e3 = createE3(e3Prime)
  const e2Prime = createE2Prime(e3, probTable, diceTable)
  const e2 = createE2(e2Prime, diceTable)
  const e1Prime = createE1Prime(e2, probTable, diceTable)
  return {
    e1Prime,
    e2Prime,
    e3Prime,
  }
}

export const evaluate = (
  scoreSheet: ScoreSheet,
  fullDice: FullDice,
  rollCount: number,
  evaluators: Evaluators
): Choice[] => {
  return []
}
