import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  evaluateRequestSchema,
  evaluateResponseSchema,
} from '../schemas/evaluate'

const evaluate = new Hono()

evaluate.post('/', zValidator('json', evaluateRequestSchema), (c) => {
  const { scoreSheet, dice, rollCount } = c.req.valid('json')

  // ビジネスロジック実装
  // 合法手を列挙し、それぞれの評価値を計算

  return c.json({
    data: [
      /* 合法手のリスト */
    ],
  })
})

export default evaluate
