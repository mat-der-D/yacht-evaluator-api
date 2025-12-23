import { test, expect } from 'bun:test'
import {
  createDiceSetFromFullDice,
  createDiceSetFromPartialDice,
} from '../types'
import { createDiceTable } from '../dice-table'
import type { FullDice, PartialDice } from '../../types'

const testSuperDiceCount = (
  tag: string,
  testCases: [PartialDice, number][]
) => {
  const testName = `Test getSuperDices by count: ${tag}`
  const diceTable = createDiceTable()
  test(testName, () => {
    for (const [partialDice, count] of testCases) {
      const dice = createDiceSetFromPartialDice(partialDice)
      expect(diceTable.getSuperDices(dice).length).toBe(count)
    }
  })
}

testSuperDiceCount('simple', [
  [[], 252],
  [[1], 126],
  [[1, 1], 56],
  [[1, 1, 1], 21],
  [[1, 1, 1, 1], 6],
  [[1, 1, 1, 1, 1], 1],
])

const testSubDiceCount = (tag: string, testCases: [FullDice, number][]) => {
  const testName = `Test getSubDices by count: ${tag}`
  const diceTable = createDiceTable()
  test(testName, () => {
    for (const [fullDice, count] of testCases) {
      const dice = createDiceSetFromFullDice(fullDice)
      expect(diceTable.getSubDices(dice).length).toBe(count)
    }
  })
}

testSubDiceCount('simple', [
  [[1, 1, 1, 1, 1], 6],
  [[1, 2, 3, 4, 5], 2 ** 5],
])
