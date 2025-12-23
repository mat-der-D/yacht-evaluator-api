import * as fs from 'fs/promises'
import * as crc32 from 'crc-32'
import type { Category, ScoreSheet } from '../types'
import { createHashableMap, type DiceSet, type HashableMap } from './types'
import {
  calculateBonus,
  calculateNumberCategoryScoreSum,
  calculateScore,
} from './score'
import { categorySchema } from '../schemas'
import type { DiceTable } from './dice-table'
import type { ProbTable } from './probability'

export type E3Prime = {
  get: (
    scoreSheet: ScoreSheet,
    dice: DiceSet,
    category: Category
  ) => number | undefined
}

type E3PrimeKey = {
  scoreSheet: ScoreSheet
  dice: DiceSet
  category: Category
  hash(): string
}

const createE3PrimeKey = (
  scoreSheet: ScoreSheet,
  dice: DiceSet,
  category: Category
): E3PrimeKey => {
  return {
    scoreSheet,
    dice,
    category,
    hash: () =>
      getStateId(scoreSheet).toString() + '|' + dice.hash() + '|' + category,
  }
}

export const createE3Prime = (e: E): E3Prime => {
  const cache: HashableMap<E3PrimeKey, number> = createHashableMap()
  return {
    get: (
      scoreSheet: ScoreSheet,
      dice: DiceSet,
      category: Category
    ): number | undefined => {
      if (scoreSheet[category] !== null) {
        return undefined
      }
      const key = createE3PrimeKey(scoreSheet, dice, category)

      const cachedValue = cache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue
      }

      const bonus = calculateBonus(scoreSheet)
      const score = calculateScore(category, dice)
      const newScoreSheet = {
        ...scoreSheet,
        [category]: score,
      }
      const newBonus = calculateBonus(newScoreSheet)
      const calculatedValue = e.get(newScoreSheet) + score + newBonus - bonus
      cache.set(key, calculatedValue)
      return calculatedValue
    },
  }
}

export type E3 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

type ScoreDiceKey = {
  scoreSheet: ScoreSheet
  dice: DiceSet
  hash(): string
}

const createScoreDiceKey = (scoreSheet: ScoreSheet, dice: DiceSet) => {
  const stateId = getStateId(scoreSheet)
  return {
    scoreSheet,
    dice,
    hash: () => stateId.toString() + '|' + dice.hash(),
  }
}

export const createE3 = (e3Prime: E3Prime): E3 => {
  const cache: HashableMap<ScoreDiceKey, number> = createHashableMap()
  return {
    get: (scoreSheet: ScoreSheet, dice: DiceSet) => {
      const key = createScoreDiceKey(scoreSheet, dice)

      const cachedValue = cache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue
      }

      const calculatedValue = Math.max(
        ...categorySchema.options.map(
          (category) => e3Prime.get(scoreSheet, dice, category) ?? 0
        )
      )
      cache.set(key, calculatedValue)
      return calculatedValue
    },
  }
}

export type EnPrime = {
  get: (scoreSheet: ScoreSheet, partialDice: DiceSet) => number
}

const createEnPrime = (en: En, probTable: ProbTable, diceTable: DiceTable) => {
  const cache: HashableMap<ScoreDiceKey, number> = createHashableMap()
  return {
    get: (scoreSheet: ScoreSheet, partialDice: DiceSet): number => {
      const key = createScoreDiceKey(scoreSheet, partialDice)

      const cachedValue = cache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue
      }

      const superDices = diceTable.getSuperDices(partialDice)
      const expectedValue = superDices.reduce((exp, d) => {
        const prob = probTable.get(d.subtract(partialDice))
        const enValue = en.get(scoreSheet, d)
        return exp + prob * enValue
      }, 0.0)
      cache.set(key, expectedValue)
      return expectedValue
    },
  }
}

export type En = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

const createEn = (enPrime: EnPrime, diceTable: DiceTable) => {
  const cache: HashableMap<ScoreDiceKey, number> = createHashableMap()
  return {
    get: (scoreSheet: ScoreSheet, dice: DiceSet): number => {
      const key = createScoreDiceKey(scoreSheet, dice)

      const cachedValue = cache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue
      }

      const subDices = diceTable.getSubDices(dice)
      const maxValue = Math.max(
        ...subDices.map((d) => enPrime.get(scoreSheet, d))
      )
      cache.set(key, maxValue)
      return maxValue
    },
  }
}

export type E2Prime = EnPrime
export const createE2Prime = createEnPrime

export type E2 = En
export const createE2 = createEn

export type E1Prime = EnPrime
export const createE1Prime = createEnPrime

export type E1 = En
export const createE1 = createEn

export type E = {
  get(scoreSheet: ScoreSheet): number
}

export const createEFromBinary = async (filePath: string): Promise<E> => {
  const expectedValues = await loadYachtEvalData(filePath)
  return {
    get: (scoreSheet: ScoreSheet) =>
      getExpectedValue(expectedValues, scoreSheet),
  }
}

const loadYachtEvalData = async (filePath: string): Promise<Float64Array> => {
  const buffer = await fs.readFile(filePath)
  const view = new DataView(buffer.buffer)

  // Header 検証
  const magic = new TextDecoder().decode(buffer.subarray(0, 10))
  if (magic !== 'YACHT_EVAL') {
    throw new Error(`Invalid magic: ${magic}`)
  }

  // const version = view.getUint32(10, true)
  // const flags = view.getUint8(14)
  const dataCount = view.getUint32(16, true)
  const expectedChecksum = view.getUint32(20, true)

  // Checksum 検証
  const dataBuffer = buffer.subarray(32, 32 + dataCount * 8)
  const calculatedChecksum = crc32.buf(dataBuffer) >>> 0
  if (calculatedChecksum != expectedChecksum) {
    throw new Error(
      `Checksum mismatch: expected ${expectedChecksum}, got ${calculatedChecksum}`
    )
  }

  // Float64Array として返す（メモリマップ）
  return new Float64Array(buffer.buffer, buffer.byteOffset + 32, dataCount)
}

const getExpectedValue = (
  expectedValues: Float64Array,
  scoreSheet: ScoreSheet
): number => {
  const stateId = getStateId(scoreSheet)
  return expectedValues[stateId]!
}

const getStateId = (scoreSheet: ScoreSheet): number => {
  const domBits = getDomBits(scoreSheet)
  const nu = Math.min(63, calculateNumberCategoryScoreSum(scoreSheet))
  return (domBits << 6) | nu
}

const getDomBits = (scoreSheet: ScoreSheet): number => {
  let domBits = 0
  for (const [category, score] of Object.entries(scoreSheet)) {
    if (score !== null) {
      domBits |= categoryToBit[category as Category]
    }
  }
  return domBits
}

const categoryToBit: Record<Category, number> = {
  ace: 1 << 0,
  deuce: 1 << 1,
  trey: 1 << 2,
  four: 1 << 3,
  five: 1 << 4,
  six: 1 << 5,
  choice: 1 << 6,
  fourOfAKind: 1 << 7,
  fullHouse: 1 << 8,
  smallStraight: 1 << 9,
  bigStraight: 1 << 10,
  yacht: 1 << 11,
}
