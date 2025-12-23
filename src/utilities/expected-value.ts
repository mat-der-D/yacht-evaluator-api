import * as fs from 'fs/promises'
import * as crc32 from 'crc-32'
import type { Category, ScoreSheet } from '../types'
import type { DiceSet } from './types'
import { calculateNumberCategoryScore } from './score'

export type E3Prime = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet, category: Category) => number
}

export const createE3Prime = (): E3Prime => {
  return {
    get: (scoreSheet, dice, category) => 0.0,
  }
}

export type E3 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

export type E2Prime = {
  get: (scoreSheet: ScoreSheet, partialDice: DiceSet) => number
}

export type E2 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

export type E1Prime = {
  get: (scoreSheet: ScoreSheet, partialDice: DiceSet) => number
}

export type E1 = {
  get: (scoreSheet: ScoreSheet, dice: DiceSet) => number
}

export type E = {
  get: (scoreSheet: ScoreSheet) => number
}

export const createEFromBinary = async (filePath: string): E => {
  // TODO: 実装を与える
}

const loadYachtEvalData = async (filePath: string): Promise<Float64Array> => {
  const buffer = await fs.readFile(filePath)
  const view = new DataView(buffer.buffer)

  // Header 検証
  const magic = new TextDecoder().decode(buffer.subarray(0, 10))
  if (magic !== 'YACHT_EVAL\0') {
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
  const domBits = getDomBits(scoreSheet)
  const nu = Math.min(63, calculateNumberCategoryScore(scoreSheet))
  const stateId = (domBits << 6) | nu
  return expectedValues[stateId]!
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
  fullHouse: 1 << 7,
  fourOfAKind: 1 << 8,
  smallStraight: 1 << 9,
  bigStraight: 1 << 10,
  yacht: 1 << 11,
}
