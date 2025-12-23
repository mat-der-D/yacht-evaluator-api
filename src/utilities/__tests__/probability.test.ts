import { test, expect } from 'bun:test'
import type { PartialDice } from '../../types'
import { createDiceSetFromPartialDice } from '../types'
import { createProbTable } from '../probability'

const testProbTable = (tag: string, testCases: [PartialDice, number][]) => {
  const testName = `Test for ProbTable: ${tag}`
  test(testName, () => {
    const probTable = createProbTable()
    for (const [partialDice, answer] of testCases) {
      const dice = createDiceSetFromPartialDice(partialDice)
      const prob = probTable.get(dice)
      expect(prob).toBeCloseTo(answer)
    }
  })
}

testProbTable('one dice', [
  [[1], 1 / 6],
  [[2], 1 / 6],
  [[3], 1 / 6],
  [[4], 1 / 6],
  [[5], 1 / 6],
  [[6], 1 / 6],
])

testProbTable('two dice', [
  [[1, 1], 1 / 36],
  [[1, 5], 1 / 18],
  [[2, 3], 1 / 18],
])

testProbTable('three dice', [
  [[1, 1, 1], 1 / 216],
  [[1, 2, 3], 1 / 36],
  [[5, 5, 2], 1 / 72],
  [[2, 1, 5], 1 / 36],
])

testProbTable('four dice', [
  [[1, 1, 1, 1], 1 / 1296],
  [[1, 2, 3, 4], 24 / 1296],
  [[1, 1, 2, 2], 6 / 1296],
])
