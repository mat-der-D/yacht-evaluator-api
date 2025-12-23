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

      const set = new Set<string>()
      for (const superDice of superDices) {
        const totalCount = superDice.counts.reduce((sum, val) => sum + val, 0)
        expect(totalCount).toBe(5)
        expect(dice.lte(superDice)).toBeTrue()
        set.add(superDice.counts.toString())
      }
      expect(set.size).toBe(superDices.length)
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

      const set = new Set<string>()
      for (const sub of subDices) {
        set.add(sub.counts.toString())
      }
      expect(set.size).toBe(subDices.length)
    }
  })
}

testGetSubDices('simple', [
  [[1, 1, 1, 1, 1], 6],
  [[1, 2, 3, 4, 5], 2 ** 5],
  [[1, 1, 2, 2, 2], 12],
])

test('Test fullDices', () => {
  const diceTable = createDiceTable()
  expect(diceTable.fullDices.length).toBe(252)
})
