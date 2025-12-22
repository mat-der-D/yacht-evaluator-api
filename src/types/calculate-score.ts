import { z } from 'zod'
import {
  calculateScoreRequestSchema,
  calculateScoreResponseSchema,
} from '../schemas'

export type CalculateScoreRequest = z.infer<typeof calculateScoreRequestSchema>
export type CalculateScoreResponse = z.infer<
  typeof calculateScoreResponseSchema
>
