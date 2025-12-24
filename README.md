# ヨット局面評価API

Bun + Hono で実装したヨット局面評価のバックエンドAPI。サイコロゲーム「ヨット」の任意の局面について、最適な選択肢（サイコロの保持パターンまたはカテゴリの選択）を期待値ベースで提示します。

## 技術スタック

- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod + @hono/zod-validator
- **Testing**: bun:test

## 概要

このAPI は 2 つの主要なエンドポイントを提供します：

| エンドポイント | 説明 |
| --- | --- |
| `POST /api/v1/evaluate` | 現在の局面から最適な次の手（選択肢）を期待値付きで提示 |
| `POST /api/v1/calculate-score` | 選択したカテゴリにサイコロ目を記入し、スコアを計算 |
| `GET /api/v1` | ヘルスチェック |

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev

# テスト実行
bun test

# リント実行
bun run lint
```

## API 使用例

### 1. ヘルスチェック

```bash
curl -X GET http://localhost:3000/api/v1
```

**レスポンス:**
```json
{
  "status": "ok"
}
```

### 2. 局面評価（evaluate）

スコアシートとサイコロ目から、最適な次の手を取得します。

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

**レスポンス:**
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

**パラメータ説明:**
- `scoreSheet`: 現在のスコアシート（記入済み: 数値、未記入: null）
- `dice`: 現在のサイコロ目（6面ダイス×5個の配列）
- `rollCount`: 残りロール数（1=最後のロール、2=1ロール残、3=2ロール残）

**レスポンス:**
- `data`: 期待値順にソートされた選択肢の配列
  - `choiceType: 'category'`: カテゴリ選択（スコアシート満杯に近い場合）
  - `choiceType: 'dice'`: サイコロ保持パターン（リロール可能な場合）
- `expectedValue`: その選択肢を実行した場合の期待最終スコア

### 3. スコア計算（calculate-score）

選択したカテゴリにスコアを記入します。

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

**レスポンス:**
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

**パラメータ説明:**
- `scoreSheet`: 現在のスコアシート
- `category`: 記入するカテゴリ（12種類のヨットカテゴリ）
- `dice`: 記入するサイコロ目

**レスポンス:**
- `scoreSheet`: 更新されたスコアシート
- `bonus`: ボーナス（数字カテゴリ合計 ≥ 63 の場合 35、それ以外 0）

## プロジェクト構成

```
src/
├── app.ts                 # メインアプリケーション
├── routes/
│   ├── evaluate.ts        # /api/v1/evaluate エンドポイント
│   └── calculate-score.ts # /api/v1/calculate-score エンドポイント
├── schemas/
│   ├── common.ts          # 共通バリデーションスキーマ
│   ├── evaluate.ts        # evaluate API スキーマ
│   └── calculate-score.ts # calculate-score API スキーマ
├── types/
│   ├── common.ts          # 共通型定義
│   ├── evaluate.ts        # evaluate API 型
│   └── calculate-score.ts # calculate-score API 型
└── utilities/
    ├── types.ts           # DiceSet, Hashable インターフェース
    ├── score.ts           # スコア計算ロジック
    ├── probability.ts     # サイコロ確率計算
    ├── dice-table.ts      # サイコロ組み合わせテーブル
    ├── expected-value.ts  # 期待値計算システム（E'_3 → E_1）
    └── evaluate.ts        # evaluate ロジック
```

## 主要機能

### 期待値計算システム

期待値計算は以下の階層で実装されています：

- **E'_3 (e3Prime)**: 3ロール目の期待値を記録するキャッシュ層
- **E_3 (e3)**: 3ロール目での最適カテゴリ選択と期待値計算
- **E'_2, E_2**: 2ロール目でのサイコロ保持パターン評価
- **E'_1, E_1**: 1ロール目での評価

期待値計算はバイナリファイル（`data/yacht_exp.bin`）から高速に読み込まれます。

### 遅延読み込み

バイナリファイルは初回リクエスト時に読み込まれ、Promise キャッシュで複数リクエストの競合を防止します。

### API バージョニング

エンドポイントは `/api/v1` という形式で提供されます。バージョンアップ時は `/api/v1.2` などに変更可能で、`app.ts` の変更のみで対応できます。

## テスト

```bash
# すべてのテスト実行
bun test

# 特定のテストファイル実行
bun test src/utilities/__tests__/evaluate.test.ts
bun test src/routes/__tests__/evaluate.test.ts
```

**テストカバレッジ:**
- スコア計算ロジック: 13 pass
- calculate-score エンドポイント: 12 pass
- evaluate ユーティリティ関数: 2 pass
- evaluate エンドポイント: 2 pass
- その他ユーティリティ: 16 pass

**合計: 45 pass**

## 今後の拡張予定

1. **エラーハンドリング改善**
   - `zValidator` のカスタムエラーハンドリング
   - バリデーションエラー時にフィールド情報を含める

2. **クライアント SDKの提供**
   - TypeScript/JavaScript クライアント

3. **Web UI**
   - API を使用したヨット局面評価のビジュアルインターフェース

4. **パフォーマンス最適化**
   - 期待値キャッシュの永続化
   - キャッシュの事前ウォーミング

## ライセンス

MIT
