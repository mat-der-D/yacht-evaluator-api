import { z } from 'zod'
import { scoreSheetSchema, categorySchema, fullDiceSchema } from './common'

export const calculateScoreRequestSchema = z.object({
  scoreSheet: scoreSheetSchema,
  category: categorySchema,
  dice: fullDiceSchema,
})

export const calculateScoreResponseSchema = z.object({
  data: z
    .object({
      scoreSheet: scoreSheetSchema,
      bonus: z.literal([0, 35]),
    })
    .optional(),
  error: z.object({ message: z.string() }).optional(),
})
