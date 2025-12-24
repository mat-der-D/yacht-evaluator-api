import { test, expect } from 'bun:test'
import { evaluate, getEvaluators } from '../evaluate'
import type { FullDice, ScoreSheet } from '../../types'

test('Test for file loading', async () => {
  await getEvaluators()
})

type Criteria = {
  choiceType: 'dice' | 'category'
  count: number
}

const createCriteria = (choiceType: 'dice' | 'category', count: number) => ({
  choiceType,
  count,
})

const testEvaluate = (
  tag: string,
  testCases: [
    ScoreSheet,
    FullDice,
    number, // rollCount
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
        expect(choice.choiceType).toBe(criteria.choiceType)
        expect(choice.expectedValue).toBeLessThanOrEqual(prevExpectedValue)
        prevExpectedValue = choice.expectedValue
      }
    }
  })
}

testEvaluate('basic', [
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
    createCriteria('dice', 6),
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
    createCriteria('dice', 6),
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
    createCriteria('dice', 0),
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
    createCriteria('dice', 0),
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
