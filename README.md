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
│   │   ├── yacht.ts     # ヨット関連のスキーマ
│   │   └── index.ts     # エクスポート集約
│   ├── routes/          # ルート定義（今後追加）
│   └── types/           # TypeScript型定義（今後追加）
└── package.json
```

## 設計方針

**スキーマ単体分離型** を採用

- `schemas/`: Zodスキーマを定義（バリデーションルール）
- `types/`: `z.infer`で生成したTypeScript型を配置
- `routes/`: APIエンドポイントのハンドラとルート定義

スキーマと型を分離することで、再利用性と保守性を確保。

## 開発の流れ

### 次回以降の作業手順

1. **スキーマ設計**: `src/schemas/yacht.ts` でリクエスト/レスポンスのスキーマを定義
2. **型生成**: `src/types/yacht.ts` で `z.infer` を使って型を生成
3. **ルート実装**: `src/routes/yacht.ts` でエンドポイントを実装
4. **統合**: `src/app.ts` でルートをマウント

### スキーマ定義の基本パターン
```typescript
// src/schemas/yacht.ts
import { z } from 'zod'

export const evaluateRequestSchema = z.object({
  // フィールドを定義
})

export const evaluateResponseSchema = z.object({
  // フィールドを定義
})
```

### ルート実装の基本パターン
```typescript
// src/routes/yacht.ts (今後作成)
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { evaluateRequestSchema } from '../schemas/yacht'

const yacht = new Hono()

yacht.post('/evaluate', zValidator('json', evaluateRequestSchema), (c) => {
  const data = c.req.valid('json') // 型安全にバリデーション済みデータを取得
  // 処理を実装
  return c.json({ /* レスポンス */ })
})

export default yacht
```

### アプリへの統合パターン
```typescript
// src/app.ts
import { Hono } from 'hono'
import yacht from './routes/yacht'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/api/yacht', yacht) // ルートをマウント

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
