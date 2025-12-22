import type { Category, FullDice, ScoreSheet } from '../types'
import { createDiceSetFromFullDice, type DiceSet } from './types'

export const calculateBonus = (scoreSheet: ScoreSheet): 0 | 35 => {
  const numberCategories: Category[] = [
    'ace',
    'deuce',
    'trey',
    'four',
    'five',
    'six',
  ]
  const numberCategoryScore: number = numberCategories.reduce(
    (sum, category) => sum + (scoreSheet[category] ?? 0),
    0
  )
  return numberCategoryScore >= 63 ? 35 : 0
}

export const calculateScore = (category: Category, dice: FullDice) => {
  const diceSet: DiceSet = createDiceSetFromFullDice(dice)
  return scoreCalculators[category](diceSet)
}

type ScoreCalculator = (dice: DiceSet) => number

const scoreCalculators: Record<Category, ScoreCalculator> = {
  ace: (dice) => calculateNumberCategoryScore(dice, 1),
  deuce: (dice) => calculateNumberCategoryScore(dice, 2),
  trey: (dice) => calculateNumberCategoryScore(dice, 3),
  four: (dice) => calculateNumberCategoryScore(dice, 4),
  five: (dice) => calculateNumberCategoryScore(dice, 5),
  six: (dice) => calculateNumberCategoryScore(dice, 6),
  choice: (dice) => calculateChoiceScore(dice),
  fourOfAKind: (dice) => calculateFourOfAKindScore(dice),
  fullHouse: (dice) => calculateFullHouseScore(dice),
  smallStraight: (dice) => calculateSmallStraightScore(dice),
  bigStraight: (dice) => calculateBigStraightScore(dice),
  yacht: (dice) => calculateYachtScore(dice),
}

const calculateNumberCategoryScore = (dice: DiceSet, face: number): number =>
  face >= 1 && face <= 6 ? face * dice.counts[face - 1]! : 0

const calculateChoiceScore = (dice: DiceSet) =>
  hasFiveDice(dice) ? sumOfFaces(dice) : 0

const calculateFullHouseScore = (dice: DiceSet): number =>
  isFullHouse(dice) ? sumOfFaces(dice) : 0

const isFullHouse = (dice: DiceSet): boolean =>
  hasFiveDice(dice) && dice.counts.every((count) => count != 1)

const calculateFourOfAKindScore = (dice: DiceSet): number =>
  isFourOfAKind(dice) ? sumOfFaces(dice) : 0

const isFourOfAKind = (dice: DiceSet): boolean =>
  hasFiveDice(dice) && dice.counts.some((count) => count >= 4)

const calculateSmallStraightScore = (dice: DiceSet): number =>
  isSmallStraight(dice) ? 15 : 0

const isSmallStraight = (dice: DiceSet): boolean =>
  hasFiveDice(dice) && maxConsecutive(dice) >= 4

const calculateBigStraightScore = (dice: DiceSet): number =>
  isBigStraight(dice) ? 30 : 0

const isBigStraight = (dice: DiceSet): boolean =>
  hasFiveDice(dice) && maxConsecutive(dice) == 5

const calculateYachtScore = (dice: DiceSet): number => (isYacht(dice) ? 50 : 0)

const isYacht = (dice: DiceSet): boolean =>
  hasFiveDice(dice) && dice.counts.some((count) => count == 5)

// Helper Functions
const hasFiveDice = (dice: DiceSet): boolean =>
  dice.counts.reduce((sum, val) => sum + val, 0) == 5

const sumOfFaces = (dice: DiceSet): number =>
  dice.faces.reduce((sum, face) => sum + face)

const maxConsecutive = (dice: DiceSet): number => {
  let current = 0
  let max = 0
  for (const count of dice.counts) {
    current = count > 0 ? current + 1 : 0
    max = Math.max(max, current)
  }
  return max
}
