# json スキーマ仕様案

このファイルでは、request および response の json スキーマの案を記述します。

## 提供する機能のリスト

- 合法手評価API: 局面を与えると、合法手の評価値を返す機能
  - 入力: スコアシート、サイコロの出目(5個)、何投目か
  - 出力: 合法手とそれぞれの評価値(期待値)のリスト
    - 合法手は、1,2投目は「どのサイコロを残すか」の情報、3投目は「どの役に確定するか」の情報
- スコアシート計算API: 選んだ手を与えると、それに確定したスコアシートを返す機能
  - 入力: スコアシート、サイコロの出目(5個)、確定する役
  - 出力: 記入したスコアシート、ボーナス点

## Request/Response 設計

### 共通 Object

`ErrorObject`:

```json
// とりあえずシンプルにエラーメッセージのみを返す
{
  "message": string
}
```

### 共通 Schema

`categorySchema`:

```json
 "ace" | "deuce" | "trey" | "four" | "five" | "six" | "choice" | "fourOfAKind" | "fullHouse" | "smallStraight" | "bigStraight" | "yacht"
// 12種類の役
```

`fullDiceSchema`:

```json
[number, number, number, number, number]
// 長さ: 5
// 要素: 1~6
```

`partialDiceSchema`:

```json
[number, ...]
// 長さ: 5以下 (0でもOK)
// 要素: 1~6
```

`scoreSheetSchema`:

```json
{
  "ace": number | null,
  ...
}
// キー: 各役(categorySchema の各要素に対応)
// 値: 記入済みスコア(number)または未記入(null)
// 役ごとに可能なスコア値が異なるので、各々で ValidationRule を実装する。
// 詳しくは yacht-rules.md を参照。
```

Note: キーの共通化を行う際、Zod では例えば以下のように生成する。

```typescript
// src/schemas/common.ts
const categories = [
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
] as const

// ↓ categories から生成
const categorySchema = z.enum(categories)

// ↓ categories から生成（categorySchema から派生ではない）
const scoreSheetSchema = z.object(
  Object.fromEntries(
    categories.map((category) => [category, z.number().nullable()])
  )
)
```

### 合法手評価API

#### Request

```json
// "rollCount" は何投目かを表す。
{
  "scoreSheet": scoreSheetSchema,
  "dice": fullDiceSchema,
  "rollCount": number // 1 or 2 or 3
}
```

#### Response

```json
{
  "data": [choiceValueSchema, ...] // 合法手の数だけ列挙
} | {
  "error": ErrorObject
}
```

`choiceValueSchema`:

```json
{
  "choiceType": "dice", // 1,2投目の場合
  "diceToHold": partialDiceSchema, // 残すサイコロの目のリスト
  "expectation": number, // この手を選んだ場合のゲーム終了時の総合点期待値
} | {
  "choiceType": "category", // 3投目の場合
  "category": categorySchema, // 確定する役
  "expectation": number // この手を選んだ場合のゲーム終了時の総合点期待値
}
```

## スコアシート計算API

### Request

```json
{
  "scoreSheet": scoreSheetSchema,
  "category": categorySchema,
  "dice": fullDiceSchema
}
// scoreSheet で category が確定済みなら ValidationError
```

### Response

```json
{
  "data": {
    "scoreSheet": scoreSheetSchema, // スコア記入済みのスコアシート
    "bonus": number // 0 or 35
  }
} | {
  "error": ErrorObject
}
```

## 参考資料

- ヨットのルール ([yacht-rules.md](./yacht-rules.md) or [yacht-rules-en.md](./yacht-rules-en.md))
