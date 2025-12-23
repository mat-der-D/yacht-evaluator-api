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
      expect(
        superDices.every(
          (d) => d.counts.reduce((sum, val) => sum + val, 0) == 5
        )
      ).toBeTrue()
      expect(superDices.every((d) => dice.lte(d))).toBeTrue()
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
