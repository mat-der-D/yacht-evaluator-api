import { z } from 'zod'
import { scoreSheetSchema, fullDiceSchema, categorySchema } from './common'

export const evaluateRequestSchema = z.object({
  scoreSheet: scoreSheetSchema,
  dice: fullDiceSchema,
  rollCount: z.int().min(1).max(3),
})

const diceChoiceSchema = z.object({
  choiceType: z.literal('dice'),
  diceToHold: z.array(z.int().min(1).max(6)).min(0).max(5),
  expectedValue: z.number(),
})

const categoryChoiceSchema = z.object({
  choiceType: z.literal('category'),
  category: categorySchema,
  expectedValue: z.number(),
})

const choiceSchema = z.union([diceChoiceSchema, categoryChoiceSchema])

export const evaluateResponseSchema = z.object({
  data: z.array(choiceSchema).optional(),
  error: z.object({ message: z.string() }).optional(),
})
