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
│   ├── app.ts           # アプリケーション本体（ルート統合） ✅ 完成
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
│   │   ├── types.ts     # DiceSet, Hashable型 ✅ 完成
│   │   ├── score.ts     # スコア計算ロジック ✅ 完成
│   │   ├── probability.ts # サイコロ確率計算 ✅ 完成
│   │   ├── dice-table.ts # サイコロテーブル生成 ✅ 完成
│   │   ├── expected-value.ts # 期待値計算（E'_3, E_3等） ✅ 完成
│   │   ├── evaluate.ts      # evaluate API ロジック ✅ 完成
│   │   ├── index.ts     # エクスポート集約 ✅ 完成
│   │   └── __tests__/   # ユーティリティテスト
│   │       ├── score.test.ts # スコア計算テスト ✅ 完成（13 pass）
│   │       ├── probability.test.ts # 確率計算テスト ✅ 完成
│   │       ├── dice-table.test.ts # サイコロテーブルテスト ✅ 完成
│   │       └── expected-value.test.ts # 期待値計算テスト 🔄 実装中
│   ├── routes/          # ルート定義
│   │   ├── evaluate.ts  # /evaluate エンドポイント ✅ 完成
│   │   ├── calculate-score.ts # /calculate-score エンドポイント ✅ 完成
│   │   └── __tests__/   # エンドポイントテスト
│   │       ├── calculate-score.test.ts # calculate-score テスト ✅ 完成（12 pass）
│   │       └── evaluate.test.ts # evaluate テスト ⏳ 未実装
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

- ✅ **Phase 4-test (calculate-score)**: calculate-score テスト実装 - 完成
  - テストフレームワークセットアップ（bun:test） ✅ 完成
  - `src/utilities/__tests__/score.test.ts`: スコア計算ロジックのテスト ✅ 完成（13 pass）
    - `testCalculateScore`: 12カテゴリのスコア計算テスト
    - `calculateBonus`: ボーナス判定ロジック（3パターン）
  - `src/routes/__tests__/calculate-score.test.ts`: calculate-score エンドポイントテスト ✅ 完成（12 pass）
    - `testCalculateScoreRoute`: 全12カテゴリのエンドポイント統合テスト
    - ボーナス有無パターンの混在テスト

- ✅ **Phase 4b/4-test (evaluate) - 準備**: 期待値計算システム実装 - 実装中
  - `src/utilities/score.ts`: スコアシート全体計算 ✅ 完成
    - `calculateScoreOfSheet`: スコアシート → 最終スコア
    - `calculateScoreOfSheet` テスト ✅ 完成（3 pass）
  - `src/utilities/types.ts`: ハッシュマップ基盤構築 ✅ 完成
    - `Hashable` インターフェース定義 ✅ 完成
    - `HashableMap<K, V>` ジェネリック実装 ✅ 完成
    - `DiceSet.hash()` 実装 ✅ 完成
  - `src/utilities/probability.ts`: サイコロ確率計算 ✅ 完成
    - `getProbability`: 任意のサイコロ状態 → 確率計算
    - `getNextDiceSets`: 任意の状態 → 次の状態リスト生成
    - `src/utilities/__tests__/probability.test.ts`: テスト ✅ 完成
  - `src/utilities/dice-table.ts`: サイコロテーブル生成 ✅ 完成
    - 全6400通りのサイコロ組み合わせをプリコンピュート
    - 効率的な期待値計算のための基盤データ
    - `src/utilities/__tests__/dice-table.test.ts`: テスト ✅ 完成
  - `src/utilities/expected-value.ts`: 期待値計算（E'\_3 → E_1） ✅ 完成
    - `createE3Prime(e)`: 最後のロールの期待値計算キャッシュ機構 ✅ 完成
    - `createE3(e3Prime)`: 3ロール目の最適選択 ✅ 完成
    - `createE2Prime/createE2`: 2ロール目の期待値と最適選択 ✅ 完成
    - `createE1Prime/createE1`: 初ロール後の期待値と最適選択 ✅ 完成
    - max-ex.md に基づく E'\_3 → E_3 → E'\_2 → E_2 → E'\_1 → E_1 の全実装完了 ✅
    - バイナリ形式の期待値データ読み込み（`createEFromBinary`） ✅ 完成
    - `src/utilities/__tests__/expected-value.test.ts`: テスト ✅ 完成
  - 目的: 局面評価を効率的に計算するための核となるシステム ✅ 達成

- ✅ **Phase 5**: アプリ統合 - 完成
  - `src/app.ts` でルート（evaluate, calculate-score）をマウント ✅ 完成
  - ヘルスチェック等の共通エンドポイント ✅ 実装

- ✅ **Phase 4b (evaluate ルート)**: evaluate エンドポイント実装 - 完成
  - `src/routes/evaluate.ts`: /evaluate エンドポイント ✅ 完成
    - 遅延読み込み（Lazy Loading）でバイナリファイルを初回リクエスト時に読み込み
    - 複数リクエストの競合を Promise キャッシュで安全に処理
    - rollCount（1, 2, 3）に応じた期待値計算器の自動選択
    - エラーハンドリング：ファイル読み込み失敗時に HTTP 500 で適切に応答
  - `src/utilities/evaluate.ts`: evaluate ロジック ✅ 完成
    - `getEvaluators()`: 遅延読み込み機構の実装
    - `evaluate12()`: rollCount=1,2 時の DiceChoice 生成（期待値でソート）
    - `evaluate3()`: rollCount=3 時の CategoryChoice 生成（期待値でソート）
  - 期待値計算システム（E1' → E_1） ✅ 利用可能

- ✅ **Phase 4-test (evaluate)**: evaluate ルートのテスト実装 - 完成
  - `src/utilities/__tests__/evaluate.test.ts`: evaluate ユーティリティ関数のテスト ✅ 完成（2 pass）
    - ファイル読み込み確認（`getEvaluators()`）
    - `rollCount` (1, 2, 3) 各パターンでの期待値計算
    - 期待値が降順ソートされていることを検証
    - スコアシート満杯時に空配列が返されることを検証
  - `src/routes/__tests__/evaluate.test.ts`: evaluate エンドポイントのテスト ✅ 完成（2 pass）
    - 成功ケース：異なる `rollCount` での選択肢数検証
    - 失敗ケース：バリデーションエラー時の動作確認

### 次回以降の作業手順

1. **拡張**: エラーハンドリング改善（オプション）
   - `zValidator` のカスタムエラーハンドリング
   - エラーレスポンスに key 情報を追加

### 最終的な実装完了

✅ **evaluate エンドポイント完全実装**
- ✅ スコアシート満杯時の処理：期待値計算層で `undefined` を返す仕様
  - `expected-value.ts` に `isFullScoreSheet()` 判定関数を追加
  - `E1Prime`, `E2Prime` でスコアシート満杯時に `undefined` を返すように修正
  - `evaluate12()` で `undefined` をチェックして skip
- ✅ すべてのテスト通過（45 pass）
- ✅ linter エラーなし

### 実装されたルートパターン

#### evaluate ルート（Phase 4b - 完成）

```typescript
// src/routes/evaluate.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema } from '../schemas'
import type { EvaluateResponse } from '../types'
import { evaluate, getEvaluators } from '../utilities/evaluate'

const evaluateRoute = new Hono()

evaluateRoute.post(
  '/',
  zValidator('json', evaluateRequestSchema),
  async (c) => {
    const { scoreSheet, dice, rollCount } = c.req.valid('json')
    try {
      // 遅延読み込み：初回リクエスト時にバイナリファイルを読み込み
      const evaluators = await getEvaluators()
      // rollCount に応じた最適な期待値計算器を使用
      const choices = evaluate(scoreSheet, dice, rollCount, evaluators)
      const response: EvaluateResponse = {
        data: choices,
      }
      return c.json(response)
    } catch (error) {
      // エラーメッセージを統一
      const message = error instanceof Error ? error.message : 'Unknown error'
      return c.json({ error: { message } }, 500)
    }
  }
)

export default evaluateRoute
```

**特徴：**
- 遅延読み込み（Lazy Loading）で初回リクエスト時にバイナリを読み込み
- Promise キャッシュで複数リクエストの競合を防止
- rollCount（1, 2, 3）に応じた期待値計算器の自動選択
- ファイル読み込み失敗時は統一されたエラーメッセージを返す

### API エンドポイント

```
GET  /api/v1                      ヘルスチェック
POST /api/v1/evaluate             局面評価
POST /api/v1/calculate-score      スコア計算
```

**バージョニング:** `/api/v1` 形式を採用。バージョンアップ時は `/api/v1.2` などに変更可能。

### 現在のアプリケーション統合（Phase 5 - 完成）

```typescript
// src/app.ts
import { Hono } from 'hono'
import calculateScoreRoute from './routes/calculate-score'
import evaluateRoute from './routes/evaluate'

const app = new Hono()

// ヘルスチェック
app.get('/api/v1', (c) => {
  return c.json({ status: 'ok' })
})

// API ルート（バージョン v1）
app.route('/api/v1', evaluateRoute)
app.route('/api/v1', calculateScoreRoute)

export default app
```

**設計のポイント：**
- `app.ts`: バージョニング管理（`/api/v1` など）
- `routes/*.ts`: 機能パス定義（`/evaluate`, `/calculate-score` など）
- バージョンアップ時は `app.ts` の 2 行を変更するだけで対応可能

## API 使用例

### 1. ヘルスチェック

```bash
curl -X GET http://localhost:3000/api/v1
```

**レスポンス（200 OK）:**
```json
{
  "status": "ok"
}
```

### 2. 局面評価（evaluate）

```bash
curl -X POST http://localhost:3000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "scoreSheet": {
      "ace": null,
      "deuce": null,
      "trey": null,
      "four": null,
      "five": null,
      "six": null,
      "choice": null,
      "fourOfAKind": null,
      "fullHouse": null,
      "smallStraight": null,
      "bigStraight": null,
      "yacht": null
    },
    "dice": [1, 2, 3, 4, 5],
    "rollCount": 1
  }'
```

**レスポンス（200 OK）:**
```json
{
  "data": [
    {
      "choiceType": "category",
      "category": "choice",
      "expectedValue": 15.0
    },
    {
      "choiceType": "dice",
      "diceToHold": [5],
      "expectedValue": 12.5
    }
  ]
}
```

### 3. スコア計算（calculate-score）

```bash
curl -X POST http://localhost:3000/api/v1/calculate-score \
  -H "Content-Type: application/json" \
  -d '{
    "scoreSheet": {
      "ace": null,
      "deuce": null,
      "trey": null,
      "four": null,
      "five": null,
      "six": null,
      "choice": null,
      "fourOfAKind": null,
      "fullHouse": null,
      "smallStraight": null,
      "bigStraight": null,
      "yacht": null
    },
    "category": "choice",
    "dice": [1, 2, 3, 4, 5]
  }'
```

**レスポンス（200 OK）:**
```json
{
  "data": {
    "scoreSheet": {
      "ace": null,
      "deuce": null,
      "trey": null,
      "four": null,
      "five": null,
      "six": null,
      "choice": 15,
      "fourOfAKind": null,
      "fullHouse": null,
      "smallStraight": null,
      "bigStraight": null,
      "yacht": null
    },
    "bonus": 0
  }
}
```

## セットアップ

```bash
bun install
```

## 開発サーバー起動

```bash
bun run dev
```
