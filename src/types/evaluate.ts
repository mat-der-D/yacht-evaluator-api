import { z } from 'zod'
import { evaluateRequestSchema, evaluateResponseSchema } from '../schemas'

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>
export type EvaluateResponse = z.infer<typeof evaluateResponseSchema>
