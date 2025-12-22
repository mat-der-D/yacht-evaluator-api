import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema } from '../schemas'
import type { EvaluateResponse } from '../types'

const evaluate = new Hono()

evaluate.post('/', zValidator('json', evaluateRequestSchema), (c) => {
  // const { scoreSheet, dice, rollCount } = c.req.valid('json')
  c.req.valid('json') // ダミーのため一旦 validation だけ行う。

  // ビジネスロジック実装
  // 合法手を列挙し、それぞれの評価値を計算

  const response: EvaluateResponse = {
    data: [
      // 合法手のリスト
    ],
  }
  return c.json(response)
})

export default evaluate
