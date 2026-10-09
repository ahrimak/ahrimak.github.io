# ahrimak.github.io

[Astro](https://astro.build) で作った個人ブログです。https://ahrimak.github.io で公開しています。

Astro のブログテンプレート（[Bear Blog](https://github.com/HermanMartinus/bearblog/) がベース）から作っています。

## 開発

パッケージマネージャーには [Bun](https://bun.sh) を使います（CI では 1.4.2）。Node.js は 22.12.0 以上が必要です。

| コマンド              | 内容                                            |
| :-------------------- | :---------------------------------------------- |
| `bun install`         | 依存パッケージをインストールする                |
| `bun run dev`         | 開発サーバーを `localhost:4321` で起動する      |
| `bun run build`       | 本番用のサイトを `./dist/` にビルドする         |
| `bun run preview`     | ビルドしたサイトをローカルで確認する            |
| `bun astro ...`       | `astro add` や `astro check` などを実行する     |

## ディレクトリ構成

```text
├── .github/
│   ├── dependabot.yml   # 依存パッケージと Actions の自動更新
│   └── workflows/       # デプロイとサプライチェーンのチェック
├── public/              # そのまま配信する静的ファイル
├── src/
│   ├── assets/          # 画像とフォント
│   ├── components/
│   ├── content/blog/    # ブログ記事（Markdown / MDX）
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
└── bunfig.toml
```

記事は `src/content/blog/` に Markdown か MDX で置きます。frontmatter のスキーマは `src/content.config.ts` で定義しています。

## デプロイ

`main` に push すると、GitHub Actions（`.github/workflows/deploy.yml`）がビルドして GitHub Pages にデプロイします。

## セキュリティ

### Content Security Policy

`astro.config.mjs` の `security.csp` で CSP を有効にしています。`default-src 'self'` を基本にした厳しめのポリシーです。

Shiki はインラインの `style` 属性を使うため CSP と両立しません。そのため、コードのハイライトにはクラスベースの Prism を使っています（テーマは `src/styles/global.css`）。

### サプライチェーン対策

- **新しすぎるバージョンを入れない**：`bunfig.toml` の `minimumReleaseAge` で、公開から 3 日経っていないバージョンはインストールしない
- **バージョンの固定**：`package.json` の依存は `^` なしの固定バージョンにしている。`bunfig.toml` の `exact = true` で、`bun add` で追加したパッケージも固定される
- **ロックファイルの検証**：CI では `bun install --frozen-lockfile` を使い、`bun.lock` と `package.json` が食い違っていれば失敗させる
- **Dependabot**：Bun の依存と GitHub Actions を週 1 回更新する。公開から 7 日経ったバージョンだけが対象
- **GitHub Actions の固定と最小権限**：Actions はコミット SHA で固定し、権限はジョブごとに必要な分だけ与えている
- **CI のチェック**（`.github/workflows/checks.yml`）
  - Pull Request で dependency review を実行し、moderate 以上の脆弱性があれば失敗させる
  - `bun audit` で既知の脆弱性を検査する
  - [zizmor](https://github.com/zizmorcore/zizmor) でワークフローを静的解析する
