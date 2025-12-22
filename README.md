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
│   ├── app.ts           # アプリケーション本体（ルート統合） ⏳ 未実装
│   ├── schemas/         # Zodスキーマ定義
│   │   ├── common.ts    # 共通スキーマ ✅ 完成
│   │   ├── evaluate.ts  # evaluate API スキーマ ✅ 完成
│   │   ├── calculate-score.ts # calculate-score API スキーマ ✅ 完成
│   │   └── index.ts     # エクスポート集約 ✅ 完成
│   ├── types/           # TypeScript型定義
│   │   ├── common.ts    # 共通型 ✅ 完成
│   │   ├── evaluate.ts  # evaluate API 型 ✅ 完成
│   │   ├── calculate-score.ts # calculate-score API 型 ✅ 完成
│   │   └── index.ts     # エクスポート集約 ✅ 完成
│   ├── utilities/       # ユーティリティ関数
│   │   ├── types.ts     # DiceSet 型とファクトリ関数 ✅ 完成
│   │   ├── score.ts     # スコア計算ロジック ✅ 完成
│   │   ├── index.ts     # エクスポート集約 ✅ 完成
│   │   └── __tests__/   # ユーティリティテスト
│   │       └── score.test.ts # スコア計算ロジックテスト ✅ 完成（13 pass）
│   ├── routes/          # ルート定義
│   │   ├── evaluate.ts  # /evaluate エンドポイント ⏳ 未実装
│   │   ├── calculate-score.ts # /calculate-score エンドポイント ✅ 完成
│   │   └── __tests__/   # エンドポイントテスト
│   │       └── calculate-score.test.ts # calculate-score テスト ✅ 完成（12 pass）
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
    - Request: scoreSheet, category, dice（既スコア判定含む）
    - Response: data（scoreSheet + bonus: 0 or 35）, error（optional）

- ✅ **Phase 3**: 型生成 - 完成
  - `src/types/evaluate.ts`: EvaluateRequest, EvaluateResponse 型を z.infer で生成
  - `src/types/calculate-score.ts`: CalculateScoreRequest, CalculateScoreResponse 型を z.infer で生成

- ✅ **Phase 4a**: calculate-score ルート実装 - 完成かつテスト済み
  - `src/routes/calculate-score.ts`: /calculate-score エンドポイント実装
  - `src/utilities/types.ts`: DiceSet 型とユーティリティ関数群を実装
    - createDiceSet, createDiceSetFromFullDice, createDiceSetFromPartialDice
    - DiceSet.add, subtract, eq, gt, gte, lt, lte メソッド実装
  - `src/utilities/score.ts`: スコア計算ロジック実装
    - calculateScore: カテゴリ別スコア計算（12種類全対応）
    - calculateBonus: ボーナス確定判定（数字カテゴリ合計 ≥ 63）
    - 各カテゴリ別スコア計算関数と判定関数
  - API テスト実行済み（正常動作確認済み）

- ⏳ **Phase 4b**: evaluate ルート実装 - 未実装
  - ビジネスロジック（合法手評価、最適手選出）待ち

- ✅ **Phase 4-test (calculate-score)**: calculate-score テスト実装 - 完成
  - テストフレームワークセットアップ（bun:test） ✅ 完成
  - `src/utilities/__tests__/score.test.ts`: スコア計算ロジックのテスト ✅ 完成（13 pass）
    - `testCalculateScore`: 12カテゴリのスコア計算テスト
    - `calculateBonus`: ボーナス判定ロジック（3パターン）
  - `src/routes/__tests__/calculate-score.test.ts`: calculate-score エンドポイントテスト ✅ 完成（12 pass）
    - `testCalculateScoreRoute`: 全12カテゴリのエンドポイント統合テスト
    - ボーナス有無パターンの混在テスト

- 🔄 **Phase 4b/4-test (evaluate) - 準備段階**: 期待値計算システム設計 - 準備中
  - `src/utilities/score.ts`: スコアシート全体計算 ✅ 完成
    - `calculateScoreOfSheet`: スコアシート → 最終スコア
    - `calculateScoreOfSheet` テスト ✅ 完成（3 pass）
  - `src/utilities/types.ts`: ハッシュマップ基盤構築 ✅ 進行中
    - `Hashable` インターフェース定義 ✅ 完成
    - `HashableMap<K, V>` ジェネリック実装 ✅ 完成
    - `DiceSet.hash()` 実装 ✅ 完成
    - `ScoreSheet.hash()` 実装 ⏳ 次回予定
    - `Category.hash()` 実装 ⏳ 次回予定
  - 目的: max-ex.md の E'_3, E'_2, E'_1 を効率的に実装するための基盤

- ⏳ **Phase 4-test (evaluate)**: evaluate ルートのテスト実装 - 未実装
  - `src/routes/__tests__/evaluate.test.ts`: evaluate エンドポイントのテスト

### 次回以降の作業手順

1. **Phase 4b/4-test (evaluate) - 準備完成**
   - `ScoreSheet.hash()` 実装
   - `Category.hash()` 実装
   - E3PrimeMap 型定義

2. **Phase 4b**: evaluate ルート実装（ビジネスロジック）
   - TDD を活用して段階的に実装
   - max-ex.md に基づき E'_3 → E_3 → E'_2 → E_2 → E'_1 → E_1 の順で実装
   - 中間値のテストと確率的性質の検証

3. **Phase 4-test (evaluate)**: evaluate エンドポイントテスト実装
   - `src/routes/__tests__/evaluate.test.ts`: evaluate エンドポイントのテスト
   - 計算済みデータとの整合性検証

4. **Phase 5**: アプリ統合
   - `src/app.ts` でルート（evaluate, calculate-score）をマウント
   - ヘルスチェック等の共通エンドポイント

5. **拡張**: エラーハンドリング改善（オプション）
   - `zValidator` のカスタムエラーハンドリング
   - エラーレスポンスに key 情報を追加

### ルート実装の参考パターン（Phase 4以降）

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


### アプリ統合の参考パターン（Phase 5）
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
