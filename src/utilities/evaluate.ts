import {
  categoryChoiceSchema,
  categorySchema,
  diceChoiceSchema,
  partialDiceSchema,
} from '../schemas'
import type { Choice, FullDice, ScoreSheet } from '../types'
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

export type Evaluators = {
  e1Prime: E1Prime
  e2Prime: E2Prime
  e3Prime: E3Prime
  diceTable: DiceTable
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
    diceTable,
  }
}

export const evaluate = (
  scoreSheet: ScoreSheet,
  fullDice: FullDice,
  rollCount: number,
  evaluators: Evaluators
): Choice[] => {
  const fullDiceSet = createDiceSetFromFullDice(fullDice)
  if (rollCount === 1 || rollCount === 2) {
    const choices: Choice[] = []
    for (const sub of evaluators.diceTable.getSubDices(fullDiceSet)) {
      const diceToHold = partialDiceSchema.parse(sub.faces)
      const expectedValue =
        rollCount === 1
          ? evaluators.e1Prime.get(scoreSheet, sub)
          : evaluators.e2Prime.get(scoreSheet, sub)
      const choice = diceChoiceSchema.parse({
        choiceType: 'dice',
        diceToHold,
        expectedValue,
      })
      choices.push(choice)
    }
    choices.sort((choice) => -choice.expectedValue)
    return choices
  } else if (rollCount === 3) {
    const choices: Choice[] = []
    for (const category of categorySchema.options) {
      const expectedValue = evaluators.e3Prime.get(
        scoreSheet,
        fullDiceSet,
        category
      )
      const choice = categoryChoiceSchema.parse({
        choiceType: 'category',
        category,
        expectedValue,
      })
      choices.sort((choice) => -choice.expectedValue)
      choices.push(choice)
    }
    return choices
  } else {
    throw new Error(`Expect rollcount to be 1, 2 or 3: ${rollCount}`)
  }
}
