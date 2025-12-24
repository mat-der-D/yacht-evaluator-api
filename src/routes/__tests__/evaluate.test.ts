import { test, expect } from 'bun:test'
import type {
  Choice,
  EvaluateRequest,
  EvaluateResponse,
  FullDice,
  ScoreSheet,
} from '../../types'
import evaluateRoute from '../evaluate'

type Criteria = {
  choiceType: 'dice' | 'category'
  count: number
}

const createCriteria = (choiceType: 'dice' | 'category', count: number) => ({
  choiceType,
  count,
})

const testEvaluateRoute = (
  tag: string,
  testCases: [EvaluateRequest, Criteria][]
) => {
  const testName = `POST /evaluate - ${tag}`
  test(testName, async () => {
    for (const [reqBody, criteria] of testCases) {
      const req = new Request('http://localhost/evaluate', {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const res = await evaluateRoute.fetch(req)
      const body = (await res.json()) as EvaluateResponse
      expect(body.data).not.toBeFalsy()
      const data = body.data as Choice[]
      expect(data.length).toBe(criteria.count)
      console.log(data)

      let prevExpectedValue = Infinity
      for (const choice of data) {
        expect(choice.choiceType).toBe(criteria.choiceType)
        expect(choice.expectedValue).toBeLessThanOrEqual(prevExpectedValue)
        prevExpectedValue = choice.expectedValue
      }
    }
  })
}

const createRequest = (
  scoreSheet: ScoreSheet,
  dice: FullDice,
  rollCount: number
) => {
  return {
    scoreSheet,
    dice,
    rollCount,
  }
}

testEvaluateRoute('basic', [
  [
    createRequest(
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
      3
    ),
    createCriteria('category', 1),
  ],
  [
    createRequest(
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
      1
    ),
    createCriteria('dice', 6),
  ],
])

const testEvaluateRouteFail = (tag: string, testCases: EvaluateRequest[]) => {
  const testName = `POST /evaluate (fail)- ${tag}`
  test(testName, async () => {
    for (const reqBody of testCases) {
      const req = new Request('http://localhost/evaluate', {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const res = await evaluateRoute.fetch(req)
      const body = (await res.json()) as EvaluateResponse
      expect(body.data).toBeFalsy()
    }
  })
}

testEvaluateRouteFail('simple', [
  createRequest(
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
    [],
    1
  ),
  createRequest(
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
    [1, 1, 1, 1, 1],
    0
  ),
  createRequest(
    {
      ace: null,
      deuce: null,
      trey: null,
      four: null,
      five: null,
      six: null,
      choice: 0,
      fourOfAKind: null,
      fullHouse: null,
      smallStraight: null,
      bigStraight: null,
      yacht: null,
    },
    [1, 1, 1, 1, 1],
    1
  ),
])
