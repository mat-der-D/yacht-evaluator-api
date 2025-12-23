import type { DiceSet } from './types'

export type DiceTable = {
  getSuperDices(dice: DiceSet): DiceSet[]
  getSubDices(dice: DiceSet): DiceSet[]
}

export const createDiceTable = (): DiceTable => {
  // TODO: 実装する
}
