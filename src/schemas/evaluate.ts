import { z } from 'zod'
import { scoreSheetSchema, fullDiceSchema, categorySchema } from './common'

export const evaluateRequestSchema = z.object({
  scoreSheet: scoreSheetSchema,
  dice: fullDiceSchema,
  rollCount: z.int().min(1).max(3),
})

export const evaluateResponseSchema = z.object({
  data: z
    .array(
      z.union([
        z.object({
          choiceType: z.literal('dice'),
          diceToHold: z.array(z.int().min(1).max(6)).min(0).max(5),
          expectation: z.number(),
        }),
        z.object({
          choiceType: z.literal('category'),
          category: categorySchema,
          expectation: z.number(),
        }),
      ])
    )
    .optional(),
  error: z.object({ message: z.string() }).optional(),
})
