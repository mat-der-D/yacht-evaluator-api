import { z } from 'zod'
import {
  evaluateRequestSchema,
  evaluateResponseSchema,
} from '../schemas/evaluate'

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>
export type EvaluateResponse = z.infer<typeof evaluateResponseSchema>
