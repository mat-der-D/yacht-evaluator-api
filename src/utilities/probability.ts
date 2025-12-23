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
  //TDOO: 実装を与える
  return 1.0
}
