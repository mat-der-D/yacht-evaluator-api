import {
  createDiceSet,
  createHashableMap,
  type DiceSet,
  type HashableMap,
} from './types'

export type DiceTable = {
  getSuperDices(dice: DiceSet): DiceSet[]
  getSubDices(dice: DiceSet): DiceSet[]
}

export const createDiceTable = (): DiceTable => {
  const partialToFull: HashableMap<DiceSet, DiceSet[]> = createHashableMap()
  const fullToPartial: HashableMap<DiceSet, DiceSet[]> = createHashableMap()
  return {
    getSuperDices: (dice: DiceSet) => {
      const cachedValue = partialToFull.get(dice)
      if (cachedValue !== undefined) {
        return cachedValue
      }
      const calculatedValue = gatherSuperDices(dice)
      partialToFull.set(dice, calculatedValue)
      return calculatedValue
    },
    getSubDices: (dice: DiceSet) => {
      const cachedValue = fullToPartial.get(dice)
      if (cachedValue !== undefined) {
        return cachedValue
      }
      const calculatedValue = gatherSubDices(dice)
      fullToPartial.set(dice, calculatedValue)
      return calculatedValue
    },
  }
}

const gatherSuperDices = (dice: DiceSet): DiceSet[] => {
  const totalCount = dice.counts.reduce((sum, val) => sum + val, 0)
  const residual = 5 - totalCount
  const superDices = []
  for (let c1 = 0; c1 <= residual; c1++) {
    for (let c2 = 0; c2 <= residual - c1; c2++) {
      for (let c3 = 0; c3 <= residual - c1 - c2; c3++) {
        for (let c4 = 0; c4 <= residual - c1 - c2 - c3; c4++) {
          for (let c5 = 0; c5 <= residual - c1 - c2 - c3 - c4; c5++) {
            const c6 = residual - c1 - c2 - c3 - c4 - c5
            const counts = [c1, c2, c3, c4, c5, c6]
            const superDice = createDiceSet(counts)
            superDices.push(superDice)
          }
        }
      }
    }
  }

  return superDices
}

const gatherSubDices = (dice: DiceSet): DiceSet[] => {
  const subDices = []

  for (let c1 = 0; c1 <= dice.counts[0]!; c1++) {
    for (let c2 = 0; c2 <= dice.counts[1]!; c2++) {
      for (let c3 = 0; c3 <= dice.counts[2]!; c3++) {
        for (let c4 = 0; c4 <= dice.counts[3]!; c4++) {
          for (let c5 = 0; c5 <= dice.counts[4]!; c5++) {
            for (let c6 = 0; c6 <= dice.counts[5]!; c6++) {
              const counts = [c1, c2, c3, c4, c5, c6]
              const subDice = createDiceSet(counts)
              subDices.push(subDice)
            }
          }
        }
      }
    }
  }

  return subDices
}
