import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { calculateScoreRequestSchema } from '../schemas'
import type { CalculateScoreResponse, ScoreSheet } from '../types'

const calculateScore = new Hono()

calculateScore.post(
  '/',
  zValidator('json', calculateScoreRequestSchema),
  (c) => {
    const { scoreSheet, category, dice } = c.req.valid('json')

    // ビジネスロジック実装
    // 選んだ役でスコアシートを更新し、ボーナス点を計算
    //
    const newScoreSheet: ScoreSheet = scoreSheet
    const response: CalculateScoreResponse = {
      data: {
        scoreSheet: newScoreSheet,
        bonus: 0,
      },
    }

    return c.json(response)
  }
)

export default calculateScore
