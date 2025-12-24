FROM oven/bun:latest

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json bunfig.toml ./

# 依存関係をインストール
RUN bun install --production

# ソースコードをコピー
COPY src ./src
COPY index.ts ./
COPY data ./data

# Cloud Runはポート8080を使用するため、環境変数で指定
ENV PORT=8080

EXPOSE 8080

CMD ["bun", "run", "index.ts"]
