import { z } from 'zod'

const multiples = (n: number) => Array.from({ length: 6 }, (_, i) => n * i)

const createNumberCategoryVariable = (n: number) =>
  z.literal(multiples(n)).nullable()

export const scoreSheetSchema = z.object({
  ace: createNumberCategoryVariable(1).describe('ace'),
  deuce: createNumberCategoryVariable(2).describe('deuce'),
  trey: createNumberCategoryVariable(3).describe('trey'),
  four: createNumberCategoryVariable(4).describe('four'),
  five: createNumberCategoryVariable(5).describe('five'),
  six: createNumberCategoryVariable(6).describe('six'),
  choice: z.int().min(5).max(30).nullable().describe('choice'),
  fourOfAKind: z
    .union([z.int().min(5).max(30), z.literal(0)])
    .nullable()
    .describe('fourOfAKind'),
  fullHouse: z
    .int()
    .min(0)
    .max(30)
    .refine((n) => ![1, 2, 3, 4, 6, 29].includes(n), {
      error: 'Expected a value excluding 1, 2, 3, 4, 6 and 29',
    })
    .nullable()
    .describe('fullHouse'),
  smallStraight: z.literal([0, 15]).nullable().describe('smallStraight'),
  bigStraight: z.literal([0, 30]).nullable().describe('bigStraight'),
  yacht: z.literal([0, 50]).nullable().describe('yacht'),
})

export const categorySchema = z.enum([
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

export const fullDiceSchema = z.array(z.int().min(1).max(6)).length(5)

export const partialDiceSchema = z.array(z.int().min(1).max(6)).min(0).max(5)
