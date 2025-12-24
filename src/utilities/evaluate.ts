import {
  categoryChoiceSchema,
  categorySchema,
  diceChoiceSchema,
  partialDiceSchema,
} from '../schemas'
import type { Category, Choice, FullDice, ScoreSheet } from '../types'
import { createDiceTable, type DiceTable } from './dice-table'
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
import { createDiceSetFromFullDice, type DiceSet } from './types'

const BINARY_FILE_PATH = 'data/yacht_exp.bin'
let evaluators: Evaluators | null = null
let loadPromise: Promise<Evaluators> | null = null

export const getEvaluators = async (): Promise<Evaluators> => {
  if (evaluators !== null) return evaluators
  if (loadPromise !== null) return await loadPromise

  loadPromise = createEvaluators(BINARY_FILE_PATH)
  try {
    evaluators = await loadPromise
    return evaluators
  } catch (error) {
    loadPromise = null
    throw error
  }
}

export type Evaluators = {
  e1Prime: E1Prime
  e2Prime: E2Prime
  e3Prime: E3Prime
  diceTable: DiceTable
}

const createEvaluators = async (binaryFilePath: string) => {
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
    diceTable,
  }
}

type Evaluator12 = {
  get(scoreSheet: ScoreSheet, partialDice: DiceSet): number
}

type Evaluator3 = {
  get(
    scoreSheet: ScoreSheet,
    fullDice: DiceSet,
    category: Category
  ): number | undefined
}

export const evaluate = (
  scoreSheet: ScoreSheet,
  fullDice: FullDice,
  rollCount: number,
  evaluators: Evaluators
): Choice[] => {
  const fullDiceSet = createDiceSetFromFullDice(fullDice)
  if (rollCount === 1) {
    return evaluate12(
      scoreSheet,
      fullDiceSet,
      evaluators.e1Prime,
      evaluators.diceTable
    )
  } else if (rollCount === 2) {
    return evaluate12(
      scoreSheet,
      fullDiceSet,
      evaluators.e2Prime,
      evaluators.diceTable
    )
  } else if (rollCount === 3) {
    return evaluate3(scoreSheet, fullDiceSet, evaluators.e3Prime)
  } else {
    throw new Error(`Expect rollcount to be 1, 2 or 3: ${rollCount}`)
  }
}

const evaluate12 = (
  scoreSheet: ScoreSheet,
  fullDice: DiceSet,
  evaluator: Evaluator12,
  diceTable: DiceTable
): Choice[] => {
  const choices: Choice[] = []
  for (const sub of diceTable.getSubDices(fullDice)) {
    const diceToHold = partialDiceSchema.parse(sub.faces)
    const expectedValue = evaluator.get(scoreSheet, sub)
    const choice = diceChoiceSchema.parse({
      choiceType: 'dice',
      diceToHold,
      expectedValue,
    })
    choices.push(choice)
  }
  // 期待値で降順にソート
  choices.sort((choice) => -choice.expectedValue)
  return choices
}

const evaluate3 = (
  scoreSheet: ScoreSheet,
  fullDice: DiceSet,
  evaluator: Evaluator3
): Choice[] => {
  const choices: Choice[] = []
  for (const category of categorySchema.options) {
    const expectedValue = evaluator.get(scoreSheet, fullDice, category)
    if (expectedValue === undefined) continue
    const choice = categoryChoiceSchema.parse({
      choiceType: 'category',
      category,
      expectedValue,
    })
    choices.push(choice)
  }
  // 期待値で降順にソート
  choices.sort((choice) => -choice.expectedValue)
  return choices
}
