import { test, expect } from 'bun:test'
import type { Category, FullDice, ScoreSheet } from '../../types'
import {
  createE1,
  createE1Prime,
  createE2,
  createE2Prime,
  createE3,
  createE3Prime,
  createEFromBinary,
} from '../expected-value'
import { createDiceSetFromFullDice } from '../types'
import { categorySchema } from '../../schemas'
import { createProbTable } from '../probability'
import { createDiceTable } from '../dice-table'

const fullScoreSheet: ScoreSheet = Object.fromEntries(
  categorySchema.options.map((category) => [category, 0])
) as ScoreSheet

const createScoreSheetExcept = (except: Category): ScoreSheet => {
  return {
    ...fullScoreSheet,
    [except]: null,
  }
}

const createScoreSheetExceptMany = (except: Category[]): ScoreSheet => {
  const scoreSheet = {
    ...fullScoreSheet,
  }
  for (const category of except) {
    scoreSheet[category] = null
  }
  return scoreSheet
}

const emptyScoreSheet: ScoreSheet = Object.fromEntries(
  categorySchema.options.map((category) => [category, null])
) as ScoreSheet

const createScoreSheet = (overrides: Partial<ScoreSheet>): ScoreSheet => {
  return {
    ...emptyScoreSheet,
    ...overrides,
  }
}

const testE3Prime = (
  tag: string,
  binaryFilePath: string,
  testCases: [ScoreSheet, FullDice, Category, number | undefined][]
) => {
  const testName = `E3Prime: ${tag}`
  test(testName, async () => {
    const e = await createEFromBinary(binaryFilePath)
    const e3Prime = createE3Prime(e)
    for (const [scoreSheet, fullDice, category, answer] of testCases) {
      const dice = createDiceSetFromFullDice(fullDice)
      const e3PrimeValue = e3Prime.get(scoreSheet, dice, category)
      if (e3PrimeValue === undefined) {
        expect(answer).toBeUndefined()
      } else {
        expect(answer).not.toBeUndefined()
        expect(e3PrimeValue).toBeCloseTo(answer ?? 0)
      }
    }
  })
}

const binaryFilePath = 'data/yacht_exp.bin'

testE3Prime('11th turn test', binaryFilePath, [
  [createScoreSheetExcept('ace'), [1, 2, 5, 1, 2], 'ace', 2],
  [createScoreSheetExcept('deuce'), [1, 2, 5, 1, 2], 'deuce', 4],
  [createScoreSheetExcept('trey'), [2, 5, 1, 5, 6], 'trey', 0],
  [createScoreSheetExcept('four'), [4, 4, 4, 5, 4], 'four', 16],
  [createScoreSheetExcept('five'), [5, 1, 5, 1, 5], 'five', 15],
  [createScoreSheetExcept('six'), [6, 6, 6, 6, 6], 'six', 30],
  [createScoreSheetExcept('choice'), [1, 2, 3, 4, 5], 'choice', 15],
  [createScoreSheetExcept('fullHouse'), [1, 5, 2, 3, 1], 'fullHouse', 0],
  [
    createScoreSheetExcept('smallStraight'),
    [3, 3, 3, 3, 3],
    'smallStraight',
    0,
  ],
  [createScoreSheetExcept('bigStraight'), [1, 2, 3, 4, 5], 'bigStraight', 30],
  [createScoreSheetExcept('yacht'), [1, 1, 1, 1, 1], 'yacht', 50],
])

testE3Prime('already filled test', binaryFilePath, [
  [fullScoreSheet, [1, 2, 3, 4, 5], 'ace', undefined],
  [fullScoreSheet, [6, 6, 6, 6, 6], 'six', undefined],
])

const testE3 = (
  tag: string,
  binaryFilePath: string,
  testCases: [ScoreSheet, FullDice, Category[]][]
) => {
  const testName = `E3: ${tag}`
  test(testName, async () => {
    const e = await createEFromBinary(binaryFilePath)
    const e3Prime = createE3Prime(e)
    const e3 = createE3(e3Prime)
    for (const [scoreSheet, fullDice, categories] of testCases) {
      const dice = createDiceSetFromFullDice(fullDice)
      let answer = 0
      for (const category of categories) {
        answer = Math.max(answer, e3Prime.get(scoreSheet, dice, category) ?? 0)
      }
      const value = e3.get(scoreSheet, dice)
      expect(value).toBeCloseTo(answer)
    }
    //
  })
}

testE3('two choice left', binaryFilePath, [
  [
    createScoreSheetExceptMany([`ace`, `deuce`]),
    [2, 2, 2, 2, 2],
    ['ace', 'deuce'],
  ],
  [
    createScoreSheetExceptMany([`yacht`, 'choice']),
    [6, 6, 6, 6, 6],
    [`yacht`, 'choice'],
  ],
])

const testConsistencyOfE = (
  binaryFilePath: string,
  testCases: ScoreSheet[]
) => {
  test('Test consistency of E', async () => {
    const probTable = createProbTable()
    const diceTable = createDiceTable()
    const e = await createEFromBinary(binaryFilePath)

    for (const scoreSheet of testCases) {
      const e3Prime = createE3Prime(e)
      const e3 = createE3(e3Prime)
      const e2Prime = createE2Prime(e3, probTable, diceTable)
      const e2 = createE2(e2Prime, diceTable)
      const e1Prime = createE1Prime(e2, probTable, diceTable)
      const e1 = createE1(e1Prime, diceTable)

      const calculatedValue = diceTable.fullDices.reduce((exp, d) => {
        const prob = probTable.get(d)
        const e1Value = e1.get(scoreSheet, d)
        return exp + prob * e1Value
      }, 0.0)

      const answer = e.get(scoreSheet) // 計算済みデータ

      expect(calculatedValue).toBeCloseTo(answer)
    }
  })
}

testConsistencyOfE(binaryFilePath, [
  createScoreSheet({}),
  createScoreSheet({ ace: 3 }),
  createScoreSheet({ five: 0, six: 30 }),
  createScoreSheet({
    choice: 15,
    yacht: 50,
    smallStraight: 15,
    bigStraight: 30,
  }),
  {
    ace: 5,
    deuce: 10,
    trey: 15,
    four: 20,
    five: 25,
    six: 30,
    choice: 30,
    fourOfAKind: 30,
    fullHouse: 30,
    smallStraight: 15,
    bigStraight: 30,
    yacht: 50,
  },
])
