import { createHashableMap, type DiceSet, type HashableMap } from './types'

export type ProbTable = {
  get(dice: DiceSet): number
}

export const createProbTable = (): ProbTable => {
  const cache: HashableMap<DiceSet, number> = createHashableMap()
  return {
    get: (dice: DiceSet): number => {
      const cachedValue = cache.get(dice)
      if (cachedValue !== undefined) {
        return cachedValue
      }

      const calculatedValue = calculateProb(dice)
      cache.set(dice, calculatedValue)
      return calculatedValue
    },
  }
}

const calculateProb = (dice: DiceSet): number => {
  const totalCount = dice.counts.reduce((sum, val) => sum + val, 0)
  const numerator = factorial(totalCount)
  const denominator = dice.counts.reduce(
    (den, count) => den * factorial(count),
    6 ** totalCount
  )
  return numerator / denominator
}

const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Invalid argument')
  }
  if (n == 0) return 1
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc * val,
    1
  )
}
