import { z } from 'zod'

const multiples = (n: number) => Array.from({ length: 6 }, (_, i) => n * i)

const createNumberCategoryVariable = (n: number) =>
  z.literal(multiples(n)).nullable()

const scoreSheetSchema = z.object({
  ace: createNumberCategoryVariable(1),
  deuce: createNumberCategoryVariable(2),
  trey: createNumberCategoryVariable(3),
  four: createNumberCategoryVariable(4),
  five: createNumberCategoryVariable(5),
  six: createNumberCategoryVariable(6),
  choice: z.int().min(5).max(30).nullable(),
  fourOfAKind: z.int().min(5).max(30).nullable(),
  fullHouse: z
    .int()
    .min(5)
    .max(30)
    .refine((n) => ![6, 29].includes(n), {
      error: 'Expected a value excluding 6 and 29',
    })
    .nullable(),
  smallStraight: z.literal([0, 15]).nullable(),
  bigStraight: z.literal([0, 30]).nullable(),
  yacht: z.literal([0, 50]).nullable(),
})

const categorySchema = z.enum([
  'ace',
  'deuce',
  'trey',
  'four',
  'five',
  'six',
  'choice',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'bigStraight',
  'yacht',
])

const fullDiceSchema = z.array(z.int().min(1).max(6)).length(5)

const partialDiceSchema = z.array(z.int().min(1).max(6)).min(0).max(5)
