import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  calculateScoreRequestSchema,
  calculateScoreResponseSchema,
} from '../schemas/calculate-score'

const calculateScore = new Hono()

calculateScore.post(
  '/',
  zValidator('json', calculateScoreRequestSchema),
  (c) => {
    const { scoreSheet, category, dice } = c.req.valid('json')

    // ビジネスロジック実装
    // 選んだ役でスコアシートを更新し、ボーナス点を計算
    //
    return c.json({
      data: {
        scoreSheet: {
          /* 更新済みの市コアシート */
        },
        bonus: 0, // または35
      },
    })
  }
)
