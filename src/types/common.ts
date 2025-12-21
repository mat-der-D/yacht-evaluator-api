import { z } from 'zod'
import { scoreSheetSchema } from '../schemas'

export type ScoreSheet = z.infer<typeof scoreSheetSchema>
