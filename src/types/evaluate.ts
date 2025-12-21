import { z } from 'zod'
import {
  evaluateRequestSchema,
  evaluateResponseSchema,
} from '../schemas/evaluate'

export type EvaluateRequest = z.infer<evaluateRequestSchema>
export type EvaluateResponse = z.infere<evaluateResponseSchema>
