import { z } from 'zod'
import type { FullDice, PartialDice } from '../types'

const diceSetCountsSchema = z
  .array(z.uint32())
  .refine((arr) => arr.reduce((sum, val) => sum + val, 0) <= 5, {
    error: 'Total exceeds 5',
  })

type DiceSetCounts = z.infer<typeof diceSetCountsSchema>

export type DiceSet = {
  counts: DiceSetCounts
  faces: number[]
  toString(): string
  add(other: DiceSet): DiceSet
  subtract(other: DiceSet): DiceSet
  eq(other: DiceSet): boolean
  gt(other: DiceSet): boolean
  gte(other: DiceSet): boolean
  lt(other: DiceSet): boolean
  lte(other: DiceSet): boolean
}

export const createDiceSet = (arr: number[]) => {
  const counts = diceSetCountsSchema.parse(arr)
  const self: DiceSet = {
    counts,
    faces: countsToFaces(counts),
    add: (other: DiceSet) => {
      const result = self.counts.map((v, i) => v + other.counts[i]!)
      return createDiceSet(result)
    },
    toString: () => self.counts.toString(),
    subtract: (other: DiceSet) => {
      const result = self.counts.map((v, i) => v - other.counts[i]!)
      return createDiceSet(result)
    },
    eq: (other: DiceSet) => self.counts.every((v, i) => v === other.counts[i]!),
    gt: (other: DiceSet) => self.counts.every((v, i) => v > other.counts[i]!),
    gte: (other: DiceSet) => self.counts.every((v, i) => v >= other.counts[i]!),
    lt: (other: DiceSet) => self.counts.every((v, i) => v < other.counts[i]!),
    lte: (other: DiceSet) => self.counts.every((v, i) => v <= other.counts[i]!),
  }
  return self
}

const countsToFaces = (counts: number[]) => {
  const faces: number[] = []
  for (let i = 0; i < counts.length; i++) {
    const count = counts[i]!
    const face = i + 1
    const newFaces = Array.from({ length: count }, () => face)
    faces.push(...newFaces)
  }
  return faces
}

export const createDiceSetFromFullDice = (dice: FullDice) =>
  createDiceSetFromFaces(dice)

export const createDiceSetFromPartialDice = (dice: PartialDice) =>
  createDiceSetFromFaces(dice)

const createDiceSetFromFaces = (faces: number[]) => {
  const counts: number[] = Array.from({ length: 6 }, () => 0)
  for (const face of faces) {
    counts[face - 1]! += 1
  }
  return createDiceSet(counts)
}

export type DiceSetMap<T> = {
  set(diceSet: DiceSet, value: T): void
  get(diceSet: DiceSet): T | undefined
  has(diceSet: DiceSet): boolean
}

export const createDiceSetMap = <T>(): DiceSetMap<T> => {
  const map = new Map<string, T>()
  return {
    set: (diceSet: DiceSet, value: T) => map.set(diceSet.toString(), value),
    get: (diceSet: DiceSet) => map.get(diceSet.toString()),
    has: (diceSet: DiceSet) => map.has(diceSet.toString()),
  }
}
