import { test, expect } from 'bun:test'
import type { Category, FullDice, ScoreSheet } from '../../types'
import { createE3Prime } from '../expected-value'
import { createDiceSetFromFullDice } from '../types'
import { categorySchema } from '../../schemas'

const fullScoreSheet: ScoreSheet = Object.fromEntries(
  categorySchema.options.map((category) => [category, 0])
) as ScoreSheet

const createScoreSheetExcept = (except: Category): ScoreSheet => {
  return {
    ...fullScoreSheet,
    [except]: null,
  }
}

const testE3Prime = (
  tag: string,
  testCases: [ScoreSheet, FullDice, Category, number][]
) => {
  const testName = `E3Prime: ${tag}`
  test(testName, () => {
    const e3Prime = createE3Prime()
    for (const [scoreSheet, fullDice, category, answer] of testCases) {
      const dice = createDiceSetFromFullDice(fullDice)
      const e3PrimeValue = e3Prime.get(scoreSheet, dice, category)
      expect(e3PrimeValue).toBeCloseTo(answer)
    }
  })
}

testE3Prime('11th turn test', [
  [createScoreSheetExcept('ace'), [1, 2, 5, 1, 2], 'ace', 3],
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
