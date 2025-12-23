import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { calculateScoreRequestSchema } from '../schemas'
import type { CalculateScoreResponse, ScoreSheet } from '../types'
import { calculateBonus, calculateScore } from '../utilities'
import { createDiceSetFromFullDice } from '../utilities/types'

const calculateScoreRoute = new Hono()

calculateScoreRoute.post(
  '/',
  zValidator('json', calculateScoreRequestSchema),
  (c) => {
    const { scoreSheet, category, dice } = c.req.valid('json')
    const diceSet = createDiceSetFromFullDice(dice)
    const score = calculateScore(category, diceSet)
    const newScoreSheet: ScoreSheet = {
      ...scoreSheet,
      [category]: score,
    }
    const bonus = calculateBonus(newScoreSheet)

    const response: CalculateScoreResponse = {
      data: {
        scoreSheet: newScoreSheet,
        bonus: bonus,
      },
    }

    return c.json(response)
  }
)

export default calculateScoreRoute
