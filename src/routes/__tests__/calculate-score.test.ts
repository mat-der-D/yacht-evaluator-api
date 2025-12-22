import { test, expect } from 'bun:test'
import calculateScoreRoute from '../calculate-score'
import { categorySchema } from '../../schemas'
import type {
  CalculateScoreRequest,
  CalculateScoreResponse,
  Category,
  FullDice,
  ScoreSheet,
} from '../../types'

const emptyScoreSheet: ScoreSheet = Object.fromEntries(
  categorySchema.options.map((category) => [category, null])
) as ScoreSheet

const createScoreSheet = (overrides: Partial<ScoreSheet>) => ({
  ...emptyScoreSheet,
  ...overrides,
})

const testCalculateScoreRoute = (
  tag: string,
  testCases: [CalculateScoreRequest, CalculateScoreResponse][]
) => {
  const testName = `POST / - ${tag}`
  test(testName, async () => {
    for (const [reqBody, resBody] of testCases) {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const res = await calculateScoreRoute.fetch(req)
      const body = await res.json()
      expect(body).toEqual(resBody)
    }
  })
}

const createRequestBody = (
  scoreSheetOverrides: Partial<ScoreSheet>,
  category: Category,
  dice: FullDice
) => ({
  scoreSheet: createScoreSheet(scoreSheetOverrides),
  category: category,
  dice: dice,
})

const createResponseBody = (
  scoreSheetOverrides: Partial<ScoreSheet>,
  bonus: 0 | 35
) => ({
  data: {
    scoreSheet: createScoreSheet(scoreSheetOverrides),
    bonus: bonus,
  },
})

const allTestCases: Record<
  string,
  [CalculateScoreRequest, CalculateScoreResponse][]
> = {
  ace: [
    [
      createRequestBody({}, 'ace', [1, 1, 1, 1, 1]),
      createResponseBody({ ace: 5 }, 0),
    ],
  ],
  deuce: [
    [
      createRequestBody({ six: 30 }, 'deuce', [2, 2, 2, 2, 2]),
      createResponseBody({ six: 30, deuce: 10 }, 0),
    ],
  ],
  trey: [
    [
      createRequestBody({ deuce: 4, four: 12 }, 'trey', [3, 3, 3, 3, 3]),
      createResponseBody({ deuce: 4, four: 12, trey: 15 }, 0),
    ],
  ],
  four: [
    [
      createRequestBody({ five: 25, six: 30 }, 'four', [4, 4, 4, 2, 1]),
      createResponseBody({ four: 12, five: 25, six: 30 }, 35),
    ],
  ],
  five: [
    [
      createRequestBody(
        { trey: 15, four: 20, six: 30 },
        'five',
        [5, 5, 5, 1, 2]
      ),
      createResponseBody(
        {
          trey: 15,
          four: 20,
          five: 15,
          six: 30,
        },
        35
      ),
    ],
  ],
  six: [
    [
      createRequestBody(
        { deuce: 2, trey: 15, four: 16, five: 25 },
        'six',
        [6, 1, 2, 3, 4]
      ),
      createResponseBody(
        { deuce: 2, trey: 15, four: 16, five: 25, six: 6 },
        35
      ),
    ],
  ],
  choice: [
    [
      createRequestBody({}, 'choice', [6, 6, 6, 6, 6]),
      createResponseBody({ choice: 30 }, 0),
    ],
  ],
  fourOfAKind: [
    [
      createRequestBody({}, 'fourOfAKind', [2, 2, 2, 2, 6]),
      createResponseBody({ fourOfAKind: 14 }, 0),
    ],
  ],
  fullHouse: [
    [
      createRequestBody({}, 'fullHouse', [2, 2, 2, 2, 6]),
      createResponseBody({ fullHouse: 0 }, 0),
    ],
  ],
  smallStraight: [
    [
      createRequestBody({}, 'smallStraight', [2, 2, 2, 2, 6]),
      createResponseBody({ smallStraight: 0 }, 0),
    ],
  ],
  bigStraight: [
    [
      createRequestBody({}, 'bigStraight', [2, 2, 2, 2, 6]),
      createResponseBody({ bigStraight: 0 }, 0),
    ],
  ],
  yacht: [
    [
      createRequestBody({}, 'yacht', [2, 2, 2, 2, 6]),
      createResponseBody({ yacht: 0 }, 0),
    ],
  ],
}

Object.entries(allTestCases).forEach(([tag, testCases]) => {
  testCalculateScoreRoute(tag, testCases)
})
