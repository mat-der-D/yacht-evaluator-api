# ヨット局面評価API

Bun + Hono で実装したヨット局面評価のバックエンドAPI

## 技術スタック

- Runtime: Bun
- Framework: Hono
- Validation: Zod + @hono/zod-validator

## ディレクトリ構成
```
.
├── index.ts              # エントリポイント
├── src/
│   ├── app.ts           # アプリケーション本体（ルート統合）
│   ├── schemas/         # Zodスキーマ定義
│   │   ├── common.ts    # 共通スキーマ ✅ 完成
│   │   ├── evaluate.ts  # evaluate API スキーマ ✅ 完成
│   │   ├── calculate-score.ts # calculate-score API スキーマ ✅ 完成
│   │   └── index.ts     # エクスポート集約（今後）
│   ├── types/           # TypeScript型定義
│   │   ├── evaluate.ts  # evaluate API 型（今後）
│   │   ├── calculate-score.ts # calculate-score API 型（今後）
│   │   └── index.ts     # エクスポート集約（今後）
│   ├── routes/          # ルート定義（今後追加）
│   │   ├── evaluate.ts  # /evaluate エンドポイント実装
│   │   └── calculate-score.ts # /calculate-score エンドポイント実装
└── package.json
```

## 設計方針

**スキーマ単体分離型** を採用

- `schemas/`: Zodスキーマを定義（バリデーションルール）
- `types/`: `z.infer`で生成したTypeScript型を配置
- `routes/`: APIエンドポイントのハンドラとルート定義

スキーマと型を分離することで、再利用性と保守性を確保。

## 開発の流れ

### 進捗状況

- ✅ **Phase 1**: `src/schemas/common.ts` - 共通スキーマ完成
  - categorySchema, scoreSheetSchema, fullDiceSchema, partialDiceSchema を定義
  - ヨットの12種類の役と、各役のバリデーションルールを実装
  - multiples ヘルパー関数で dice カテゴリを生成

- ✅ **Phase 2**: API別スキーマ定義 - 完成
  - `src/schemas/evaluate.ts`: evaluateRequestSchema, evaluateResponseSchema
    - Request: scoreSheet, dice（fullDiceSchema）, rollCount（1-3）
    - Response: data（union で dice/category 選択肢を分岐）, error（optional）
  - `src/schemas/calculate-score.ts`: calculateScoreRequestSchema, calculateScoreResponseSchema
    - Request: scoreSheet, category, dice
    - Response: data（scoreSheet + bonus: 0 or 35）, error（optional）

### 次回以降の作業手順

1. **Phase 3**: 型生成 - API ごとに分割
   - `src/types/evaluate.ts`: EvaluateRequest, EvaluateResponse 型を z.infer で生成
   - `src/types/calculate-score.ts`: CalculateScoreRequest, CalculateScoreResponse 型を z.infer で生成

2. **Phase 4**: ルート実装
   - `src/routes/evaluate.ts`: /evaluate エンドポイント実装（ビジネスロジック）
   - `src/routes/calculate-score.ts`: /calculate-score エンドポイント実装（ビジネスロジック）

3. **Phase 5**: アプリ統合
   - `src/app.ts` でルートをマウント
   - エラーハンドリング実装

### Phase 2: API別スキーマ定義のパターン

#### evaluate API（合法手評価）
```typescript
// src/schemas/evaluate.ts
import { z } from 'zod'
import { scoreSheetSchema, fullDiceSchema, categorySchema } from './common'

export const evaluateRequestSchema = z.object({
  scoreSheet: scoreSheetSchema,
  dice: fullDiceSchema,
  rollCount: z.number().int().min(1).max(3),
})

export const evaluateResponseSchema = z.object({
  data: z.array(z.union([
    // 1,2投目: diceToHold の選択
    z.object({
      choiceType: z.literal('dice'),
      diceToHold: z.array(z.number().min(1).max(6)).min(0).max(5),
      expectation: z.number(),
    }),
    // 3投目: category の選択
    z.object({
      choiceType: z.literal('category'),
      category: categorySchema,
      expectation: z.number(),
    }),
  ])).optional(),
  error: z.object({ message: z.string() }).optional(),
})
```

#### calculate-score API（スコアシート計算）
```typescript
// src/schemas/calculate-score.ts
import { z } from 'zod'
import { scoreSheetSchema, fullDiceSchema, categorySchema } from './common'

export const calculateScoreRequestSchema = z.object({
  scoreSheet: scoreSheetSchema,
  category: categorySchema,
  dice: fullDiceSchema,
})

export const calculateScoreResponseSchema = z.object({
  data: z.object({
    scoreSheet: scoreSheetSchema,
    bonus: z.number().int().min(0),
  }).optional(),
  error: z.object({ message: z.string() }).optional(),
})
```

### Phase 3: 型生成のパターン

```typescript
// src/types/evaluate.ts
import { z } from 'zod'
import { evaluateRequestSchema, evaluateResponseSchema } from '../schemas/evaluate'

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>
export type EvaluateResponse = z.infer<typeof evaluateResponseSchema>
```

```typescript
// src/types/calculate-score.ts
import { z } from 'zod'
import { calculateScoreRequestSchema, calculateScoreResponseSchema } from '../schemas/calculate-score'

export type CalculateScoreRequest = z.infer<typeof calculateScoreRequestSchema>
export type CalculateScoreResponse = z.infer<typeof calculateScoreResponseSchema>
```

### Phase 4: ルート実装の基本パターン

```typescript
// src/routes/evaluate.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema, evaluateResponseSchema } from '../schemas/evaluate'

const evaluate = new Hono()

evaluate.post('/', zValidator('json', evaluateRequestSchema), (c) => {
  const { scoreSheet, dice, rollCount } = c.req.valid('json')

  // ビジネスロジック実装
  // 合法手を列挙し、それぞれの評価値を計算

  return c.json({
    data: [ /* 合法手のリスト */ ]
  })
})

export default evaluate
```

```typescript
// src/routes/calculate-score.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { calculateScoreRequestSchema, calculateScoreResponseSchema } from '../schemas/calculate-score'

const calculateScore = new Hono()

calculateScore.post('/', zValidator('json', calculateScoreRequestSchema), (c) => {
  const { scoreSheet, category, dice } = c.req.valid('json')

  // ビジネスロジック実装
  // 選んだ役でスコアシートを更新し、ボーナス点を計算

  return c.json({
    data: {
      scoreSheet: { /* 更新済みのスコアシート */ },
      bonus: 0 // または 35
    }
  })
})

export default calculateScore
```

### Phase 5: アプリへの統合パターン
```typescript
// src/app.ts
import { Hono } from 'hono'
import evaluate from './routes/evaluate'
import calculateScore from './routes/calculate-score'

const app = new Hono()

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok' }))

// API ルートをマウント
app.route('/api/yacht/evaluate', evaluate)
app.route('/api/yacht/calculate-score', calculateScore)

export default app
```

## セットアップ
```bash
bun install
```

## 開発サーバー起動
```bash
bun run dev
```
