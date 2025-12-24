import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema } from '../schemas'
import type { EvaluateResponse } from '../types'
import { evaluate, getEvaluators } from '../utilities/evaluate'

const evaluateRoute = new Hono()

evaluateRoute.post(
  '/',
  zValidator('json', evaluateRequestSchema),
  async (c) => {
    const { scoreSheet, dice, rollCount } = c.req.valid('json')
    try {
      const evaluators = await getEvaluators()
      const choices = evaluate(scoreSheet, dice, rollCount, evaluators)
      const response: EvaluateResponse = {
        data: choices,
      }
      return c.json(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: { message } }, 500)
    }
  }
)

export default evaluateRoute
