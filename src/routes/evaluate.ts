import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema } from '../schemas'
import type { EvaluateResponse } from '../types'
import { createEvaluators, evaluate } from '../utilities/evaluate'

const evaluateRoute = new Hono()

const binaryFilePath = 'data/yacht_exp.bin'
const evaluators = await createEvaluators(binaryFilePath)

evaluateRoute.post('/', zValidator('json', evaluateRequestSchema), (c) => {
  const { scoreSheet, dice, rollCount } = c.req.valid('json')
  const choices = evaluate(scoreSheet, dice, rollCount, evaluators)
  const response: EvaluateResponse = {
    data: choices,
  }
  return c.json(response)
})

export default evaluateRoute
