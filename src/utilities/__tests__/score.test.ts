import { test, expect } from 'bun:test'
import { categorySchema, fullDiceSchema, scoreSheetSchema } from '../../schemas'
import { calculateBonus, calculateScore, calculateScoreOfSheet } from '../score'
import type { ScoreSheet } from '../../types'
import { createDiceSetFromFullDice } from '../types'

const emptyScoreSheet: ScoreSheet = Object.fromEntries(
  categorySchema.options.map((category) => [category, null])
) as ScoreSheet

const createScoreSheet = (overrides: Partial<ScoreSheet>): ScoreSheet => {
  return {
    ...emptyScoreSheet,
    ...overrides,
  }
}

const testCalculateScoreOfSheet = (
  testCases: [Partial<ScoreSheet>, number][]
) => {
  test('calculateScoreOfSheet', () => {
    for (const [partialSheet, answer] of testCases) {
      const scoreSheet = createScoreSheet(partialSheet)
      const score = calculateScoreOfSheet(scoreSheet)
      expect(score).toBe(answer)
    }
  })
}

testCalculateScoreOfSheet([
  [{}, 0],
  [{ ace: 5, deuce: 10, trey: 15 }, 30],
  [{ four: 20, five: 25, six: 30, yacht: 50 }, 160],
])

const testCalculateScore = (
  categoryName: string,
  testCases: [number[], number][]
) => {
  const testName = `calculateScore: ${categoryName}`
  test(testName, () => {
    const category = categorySchema.parse(categoryName)
    for (const [rawDice, answer] of testCases) {
      const dice = fullDiceSchema.parse(rawDice)
      const diceSet = createDiceSetFromFullDice(dice)
      const score = calculateScore(category, diceSet)
      expect(score).toBe(answer)
    }
  })
}

testCalculateScore('ace', [
  [[1, 1, 1, 1, 1], 5],
  [[1, 1, 2, 3, 5], 2],
  [[2, 5, 6, 3, 3], 0],
])

testCalculateScore('deuce', [
  [[2, 2, 2, 2, 2], 10],
  [[1, 6, 2, 3, 2], 4],
  [[6, 6, 5, 4, 1], 0],
])

testCalculateScore('trey', [
  [[3, 3, 3, 3, 3], 15],
  [[1, 3, 2, 3, 2], 6],
  [[6, 6, 5, 4, 1], 0],
])

testCalculateScore('four', [
  [[4, 4, 4, 4, 4], 20],
  [[4, 3, 4, 1, 6], 8],
  [[1, 6, 5, 3, 1], 0],
])

testCalculateScore('five', [
  [[5, 5, 5, 5, 5], 25],
  [[4, 5, 4, 1, 5], 10],
  [[1, 6, 2, 3, 1], 0],
])

testCalculateScore('six', [
  [[6, 6, 6, 6, 6], 30],
  [[2, 1, 6, 6, 5], 12],
  [[1, 5, 2, 3, 1], 0],
])

testCalculateScore('choice', [
  [[6, 6, 6, 6, 6], 30],
  [[2, 1, 6, 6, 5], 20],
  [[1, 5, 2, 3, 2], 13],
])

testCalculateScore('fourOfAKind', [
  [[6, 6, 6, 6, 6], 30],
  [[2, 2, 6, 2, 2], 14],
  [[1, 5, 2, 3, 2], 0],
])

testCalculateScore('fullHouse', [
  [[6, 6, 6, 6, 6], 30],
  [[2, 2, 6, 6, 2], 18],
  [[3, 3, 3, 5, 6], 0],
])

testCalculateScore('smallStraight', [
  [[2, 3, 4, 5, 6], 15],
  [[1, 2, 3, 4, 6], 15],
  [[3, 1, 2, 5, 6], 0],
])

testCalculateScore('bigStraight', [
  [[2, 3, 4, 5, 6], 30],
  [[1, 2, 3, 4, 5], 30],
  [[3, 1, 2, 5, 6], 0],
])

testCalculateScore('yacht', [
  [[5, 5, 5, 5, 5], 50],
  [[1, 1, 1, 1, 1], 50],
  [[2, 2, 2, 2, 3], 0],
  [[3, 1, 2, 5, 6], 0],
])

test('calculateBonus', () => {
  const testCases: [ScoreSheet, 0 | 35][] = [
    [createScoreSheet({}), 0],
    [
      createScoreSheet({
        ace: 5,
        deuce: 10,
        six: 30,
      }),
      0,
    ],
    [
      createScoreSheet({
        four: 20,
        five: 25,
        six: 30,
      }),
      35,
    ],
  ]

  for (const [rawScoreSheet, answer] of testCases) {
    const scoreSheet = scoreSheetSchema.parse(rawScoreSheet)
    const bonus = calculateBonus(scoreSheet)
    expect(bonus).toBe(answer)
  }
})
