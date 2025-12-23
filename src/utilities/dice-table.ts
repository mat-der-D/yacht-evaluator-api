import {
  createDiceSet,
  createHashableMap,
  type DiceSet,
  type HashableMap,
} from './types'

export type DiceTable = {
  fullDices: DiceSet[]
  partialDices: DiceSet[]
  getSuperDices(dice: DiceSet): DiceSet[]
  getSubDices(dice: DiceSet): DiceSet[]
}

export const createDiceTable = (): DiceTable => {
  const partialToFull: HashableMap<DiceSet, DiceSet[]> = createHashableMap()
  const fullToPartial: HashableMap<DiceSet, DiceSet[]> = createHashableMap()
  return {
    fullDices: gatherSuperDices(createDiceSet([0, 0, 0, 0, 0, 0])),
    partialDices: gatherAllDices(),
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
  const superDices: DiceSet[] = []
  gatherSuperDicesRecursive(dice, [0, 0, 0, 0, 0, 0], 0, superDices, residual)
  return superDices
}

const gatherSuperDicesRecursive = (
  base: DiceSet,
  counts: number[],
  index: number,
  superDices: DiceSet[],
  residual: number
) => {
  if (index === 5) {
    counts[5] = residual
    const residualDice = createDiceSet(counts)
    const superDice = base.add(residualDice)
    superDices.push(superDice)
    return
  }

  for (let count = 0; count <= residual; count++) {
    counts[index] = count
    gatherSuperDicesRecursive(
      base,
      counts,
      index + 1,
      superDices,
      residual - count
    )
  }
}

const gatherSubDices = (dice: DiceSet): DiceSet[] => {
  const subDices: DiceSet[] = []
  gatherSubDicesRecursive(dice, [0, 0, 0, 0, 0, 0], 0, subDices)
  return subDices
}

const gatherSubDicesRecursive = (
  dice: DiceSet,
  counts: number[],
  index: number,
  subDices: DiceSet[]
) => {
  if (index === 6) {
    const subDice = createDiceSet(counts)
    subDices.push(subDice)
    return
  }

  for (let count = 0; count <= dice.counts[index]!; count++) {
    gatherSubDicesRecursive(dice, counts, index + 1, subDices)
  }
}

const gatherAllDices = (): DiceSet[] => {
  const allDices: DiceSet[] = []
  gatherAllDicesRecursive([0, 0, 0, 0, 0, 0], 0, allDices, 5)
  return allDices
}

const gatherAllDicesRecursive = (
  counts: number[],
  index: number,
  allDices: DiceSet[],
  residual: number
) => {
  if (index === 6) {
    const dice = createDiceSet(counts)
    allDices.push(dice)
    return
  }

  for (let count = 0; count <= residual; count++) {
    counts[index] = count
    gatherAllDicesRecursive(counts, index + 1, allDices, residual - count)
  }
}
