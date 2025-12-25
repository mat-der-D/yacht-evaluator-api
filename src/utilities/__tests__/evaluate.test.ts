import { test, expect } from 'bun:test'
import { evaluate, getEvaluators } from '../evaluate'
import type {
  Category,
  CategoryChoice,
  FullDice,
  ScoreSheet,
} from '../../types'

test('Test for file loading', async () => {
  await getEvaluators()
})

type Criteria = {
  choiceType: 'dice' | 'category' | null
  count: number
}

const createCriteria = (
  choiceType: 'dice' | 'category' | null,
  count: number
) => ({
  choiceType,
  count,
})

const testEvaluate = (
  tag: string,
  testCases: [
    ScoreSheet,
    FullDice,
    1 | 2 | 3, // rollCount
    Criteria,
  ][]
) => {
  const testName = `Test for evaluate: ${tag}`
  test(testName, async () => {
    const evaluators = await getEvaluators()
    for (const [scoreSheet, fullDice, rollCount, criteria] of testCases) {
      const choices = evaluate(scoreSheet, fullDice, rollCount, evaluators)
      expect(choices.length).toBe(criteria.count)
      let prevExpectedValue = Infinity
      for (const choice of choices) {
        if (criteria.choiceType !== null) {
          expect(choice.choiceType).toBe(criteria.choiceType)
        }
        if (choice.choiceType == 'dice') {
          expect(choice.diceToHold.length).not.toBe(5)
        }
        expect(choice.expectedValue).toBeLessThanOrEqual(prevExpectedValue)
        prevExpectedValue = choice.expectedValue
      }
    }
  })
}

testEvaluate('basic', [
  [
    {
      ace: null,
      deuce: null,
      trey: null,
      four: null,
      five: null,
      six: null,
      choice: null,
      fourOfAKind: null,
      fullHouse: null,
      smallStraight: null,
      bigStraight: null,
      yacht: null,
    },
    [1, 4, 5, 6, 6],
    1,
    createCriteria(null, 35),
  ],
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: null,
      choice: null,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    3,
    createCriteria('category', 2),
  ],
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: 0,
      choice: null,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    2,
    createCriteria(null, 6),
  ],
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: 0,
      choice: null,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    1,
    createCriteria(null, 6),
  ],
])

testEvaluate('edge case', [
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: 0,
      choice: 5,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    1,
    createCriteria(null, 0),
  ],
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: 0,
      choice: 5,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    2,
    createCriteria(null, 0),
  ],
  [
    {
      ace: 0,
      deuce: 0,
      trey: 0,
      four: 0,
      five: 0,
      six: 0,
      choice: 5,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      bigStraight: 0,
      yacht: 0,
    },
    [1, 1, 1, 1, 1],
    3,
    createCriteria('category', 0),
  ],
])

const maxScoreSheet: ScoreSheet = {
  ace: 5,
  deuce: 10,
  trey: 15,
  four: 20,
  five: 25,
  six: 30,
  choice: 30,
  fourOfAKind: 30,
  fullHouse: 30,
  smallStraight: 15,
  bigStraight: 30,
  yacht: 50,
}

const createMaxScoreSheetExcept = (except: Category): ScoreSheet => {
  return {
    ...maxScoreSheet,
    [except]: null,
  }
}

const testFinalChoice = (
  tag: string,
  testCases: [Category, FullDice, number][]
) => {
  const testName = `Test for final choice: ${tag}`
  test(testName, async () => {
    const evaluators = await getEvaluators()
    for (const [category, fullDice, answer] of testCases) {
      const scoreSheet = createMaxScoreSheetExcept(category)
      const result = evaluate(scoreSheet, fullDice, 3, evaluators)
      expect(result.length).toBe(1)
      const finalChoice = result[0]!
      expect(finalChoice.choiceType).toBe('category')
      const categoryChoice = finalChoice as CategoryChoice
      expect(categoryChoice.category).toBe(category)
      expect(categoryChoice.expectedValue).toBeCloseTo(answer)
    }
  })
}

testFinalChoice('basic', [
  ['ace', [1, 1, 1, 1, 2], 324],
  ['deuce', [2, 2, 2, 2, 5], 323],
  ['trey', [3, 5, 2, 2, 1], 313],
  ['four', [1, 2, 5, 3, 6], 305],
  ['five', [5, 5, 2, 1, 3], 310],
  ['six', [5, 5, 6, 5, 6], 307],
])
