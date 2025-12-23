# Yacht 期待値バイナリフォーマット仕様

## 概要

期待値計算結果 $\tilde{E}(s)$ を 262,144 個の `f64` 値として保存するバイナリファイルの仕様。

- **ファイルサイズ**: 32 bytes (header) + 2,097,152 bytes (data) = 2,097,184 bytes (~2 MB)
- **対象環境**: Linux, little-endian (x86-64)
- **読み込み環境**: TypeScript (Node.js)

---

## ファイルレイアウト

```
[Header: 32 bytes]
  Offset  Size  型      フィールド名
  0       10    u8[10]  Magic: "YACHT_EVAL\0"
  10      4     u32     Version (little-endian)
  14      1     u8      Flags (Bit 0: endianness, 0=little-endian)
  15      1     u8      Reserved
  16      4     u32     Data Count (little-endian) = 262,144
  20      4     u32     Data CRC32 (little-endian)
  24      8     u64     Reserved

[Data: 2,097,152 bytes]
  262,144 個の f64 値 (little-endian)
```

---

## 状態エンコーディング

バイナリ内のデータは、以下のエンコーディングに従い配置される。

### 状態の数学的表現

スコアシート状態 $s \in S / \sim$ は以下の2つの情報により一意に決定される：
- $\mathop{\mathrm{dom}} s$: 記入済み役の集合（$2^{12} = 4,096$ 通り）
- $\nu(s)$: 数字役合計スコアの上限付き値（0～63, 64通り）

### エンコーディング

```
state_id = (dom_bits << 6) | nu
array_index = state_id

ここで：
- dom_bits ∈ {0, 1, ..., 4095}: Categories bitflags で表現した記入済み役
- nu ∈ {0, 1, ..., 63}: min{63, Σ(数字役スコア)}
```

**配置順序**：
```
array_index = 0:           dom_bits=0, nu=0    → tilde_E[0, 0]
array_index = 1:           dom_bits=0, nu=1    → tilde_E[0, 1]
...
array_index = 63:          dom_bits=0, nu=63   → tilde_E[0, 63]

array_index = 64:          dom_bits=1, nu=0    → tilde_E[1, 0]
array_index = 65:          dom_bits=1, nu=1    → tilde_E[1, 1]
...
array_index = 262143:      dom_bits=4095, nu=63 → tilde_E[4095, 63]
```

**利点**：
- `dom_bits` を上位に配置することで、同じ `dom_bits` のブロック（64個の連続した値）をシーケンシャル読み込み可能
- ファイルオフセット = `32 + dom_bits * 512 + nu * 8` （64 個の f64 = 512 bytes）
- Rust 側の計算で `dom_bits` でループ → `nu` でループの自然な二重ループ構造に対応

---

## Checksum

**アルゴリズム**: CRC32

**計算対象**: Data セクション（2,097,152 bytes）のみ

**用途**: 読み込み時のデータ整合性検証

---

## TypeScript での読み込み例

```typescript
import * as fs from 'fs/promises';
import { crc32 } from 'crc-32';  // npm install crc-32

async function loadYachtEvalData(filePath: string): Promise<Float64Array> {
  const buffer = await fs.readFile(filePath);
  const view = new DataView(buffer);

  // Header 検証
  const magic = new TextDecoder().decode(buffer.slice(0, 10));
  if (magic !== 'YACHT_EVAL\0') {
    throw new Error(`Invalid magic: ${magic}`);
  }

  const version = view.getUint32(10, true);
  const flags = view.getUint8(14);
  const dataCount = view.getUint32(16, true);
  const expectedChecksum = view.getUint32(20, true);

  // Checksum 検証
  const dataBuffer = buffer.slice(32, 32 + dataCount * 8);
  const calculatedChecksum = crc32(dataBuffer) >>> 0;  // unsigned
  if (calculatedChecksum !== expectedChecksum) {
    throw new Error(
      `Checksum mismatch: expected ${expectedChecksum}, got ${calculatedChecksum}`
    );
  }

  // Float64Array として返す（メモリマップ）
  return new Float64Array(buffer.buffer, buffer.byteOffset + 32, dataCount);
}

function getStateValue(
  expectedValues: Float64Array,
  domBits: number,
  nu: number
): number {
  const stateId = (domBits << 6) | nu;
  return expectedValues[stateId];
}

async function loadBlockForDomBits(
  filePath: string,
  domBits: number
): Promise<Float64Array> {
  const fd = await fs.open(filePath, 'r');
  const offset = 32 + domBits * 512;  // Header (32 bytes) + dom_bits ブロック開始
  const buffer = Buffer.alloc(512);    // 64 個の f64 = 512 bytes
  await fd.read(buffer, 0, 512, offset);
  await fd.close();

  return new Float64Array(buffer.buffer, buffer.byteOffset, 64);
}
```

---

## 参考

- [max-ex.md](max-ex.md) - 数学的定義、特に第 225-247 節（同値関係と状態エンコーディング）
- [implementation-plan.md](implementation-plan.md) - 実装設計全体
