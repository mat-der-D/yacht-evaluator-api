import { z } from 'zod'
import {
  categoryChoiceSchema,
  choiceSchema,
  diceChoiceSchema,
  evaluateRequestSchema,
  evaluateResponseSchema,
} from '../schemas'

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>
export type DiceChoice = z.infer<typeof diceChoiceSchema>
export type CategoryChoice = z.infer<typeof categoryChoiceSchema>
export type Choice = z.infer<typeof choiceSchema>
export type EvaluateResponse = z.infer<typeof evaluateResponseSchema>
