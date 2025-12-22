import { z } from 'zod'
import {
  categorySchema,
  fullDiceSchema,
  partialDiceSchema,
  scoreSheetSchema,
} from '../schemas'

export type ScoreSheet = z.infer<typeof scoreSheetSchema>
export type Category = z.infer<typeof categorySchema>
export type FullDice = z.infer<typeof fullDiceSchema>
export type PartialDice = z.infer<typeof partialDiceSchema>
