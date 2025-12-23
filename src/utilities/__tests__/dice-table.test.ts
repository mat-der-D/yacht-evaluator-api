import { test, expect } from 'bun:test'
import {
  createDiceSetFromFullDice,
  createDiceSetFromPartialDice,
} from '../types'
import { createDiceTable } from '../dice-table'
import type { FullDice, PartialDice } from '../../types'

const testGetSuperDices = (tag: string, testCases: [PartialDice, number][]) => {
  const testName = `Test getSuperDices: ${tag}`
  const diceTable = createDiceTable()
  test(testName, () => {
    for (const [partialDice, count] of testCases) {
      const dice = createDiceSetFromPartialDice(partialDice)
      const superDices = diceTable.getSuperDices(dice)
      expect(superDices.length).toBe(count)
      for (const superDice of superDices) {
        const totalCount = superDice.counts.reduce((sum, val) => sum + val, 0)
        expect(totalCount).toBe(5)
        expect(dice.lte(superDice)).toBeTrue()
      }
    }
  })
}

testGetSuperDices('simple', [
  [[], 252],
  [[1], 126],
  [[1, 1], 56],
  [[1, 1, 1], 21],
  [[1, 1, 1, 1], 6],
  [[1, 1, 1, 1, 1], 1],
])

const testGetSubDices = (tag: string, testCases: [FullDice, number][]) => {
  const testName = `Test getSubDices: ${tag}`
  const diceTable = createDiceTable()
  test(testName, () => {
    for (const [fullDice, count] of testCases) {
      const dice = createDiceSetFromFullDice(fullDice)
      const subDices = diceTable.getSubDices(dice)
      expect(subDices.length).toBe(count)
      expect(subDices.every((d) => d.lte(dice))).toBeTrue()
    }
  })
}

testGetSubDices('simple', [
  [[1, 1, 1, 1, 1], 6],
  [[1, 2, 3, 4, 5], 2 ** 5],
])

test('Test fullDices & partialDices', () => {
  const diceTable = createDiceTable()
  expect(diceTable.fullDices.length).toBe(252)
  expect(diceTable.partialDices.length).toBe(462)
})
