# デプロイメントガイド

このドキュメントは、株式会社ドットファウンドのコーポレートサイトをVercelにデプロイする際の重要な情報を記載しています。

## デプロイ前のチェックリスト

### ✅ 完了した修正

1. **画像ファイル**: すべてのファビコンとOGP画像が正しく生成されました
   - 16×16、32×32、180×180、512×512のファビコン
   - 1200×630のOGP画像

2. **メタデータ**: index.htmlのメタデータが最適化されました
   - ファビコンの設定を複数サイズで追加
   - ロゴファイルの参照を削除
   - SNSリンクを削除

3. **セキュリティ**: 環境変数とAPIキーの設定を整理
   - .envファイルから不要な認証情報を削除
   - vite.config.tsから未使用のAPIキー定義を削除

4. **パフォーマンス**: Tailwind CSSの最適化
   - CDNからビルド時に含める方法に変更
   - 本番ビルドサイズの最適化

5. **SEO**: サイトマップと日付の修正
   - sitemap.xmlの日付を2024-12-07に修正

6. **Vercel設定**: vercel.jsonファイルを追加
   - SPAのルーティング設定
   - キャッシュ最適化

## Google Analytics設定（TODO）

index.htmlの86-93行目にGoogle Analyticsのコードが含まれていますが、現在コメントアウトされています。

**デプロイ後に行うこと:**

1. Google Analyticsのプロパティを作成
2. 測定IDを取得（G-XXXXXXXXXXの形式）
3. index.htmlの該当箇所のコメントを解除
4. `G-XXXXXXXXXX`を実際の測定IDに置き換え

## Vercelデプロイ手順

### 1. Vercelプロジェクトの作成

```bash
# Vercel CLIをインストール（未インストールの場合）
npm install -g vercel

# プロジェクトディレクトリでVercelにデプロイ
vercel
```

### 2. ビルド設定

Vercelの設定は以下の通りです：

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. 環境変数

現在、本番環境で必要な環境変数はありません。
将来的にAPIキーなどが必要になった場合は、Vercelのダッシュボードから設定してください。

### 4. カスタムドメイン設定

1. Vercelダッシュボードで「Domains」セクションに移動
2. `www.dotfound.co.jp`と`dotfound.co.jp`を追加
3. DNSレコードを設定（Vercelが提供する値を使用）

## デプロイ後の確認事項

### 必須チェック

- [ ] ファビコンが正しく表示される
- [ ] OGP画像がSNSで正しく表示される（Twitter、Facebook等でテスト）
- [ ] レスポンシブデザインが正しく動作する（モバイル、タブレット、デスクトップ）
- [ ] すべてのページ遷移が正しく動作する
- [ ] Google Search ConsoleにサイトマップURLを登録

### 推奨チェック

- [ ] PageSpeed Insightsでパフォーマンスを確認
- [ ] Lighthouseでアクセシビリティとベストプラクティスを確認
- [ ] 異なるブラウザでの動作確認（Chrome、Firefox、Safari、Edge）

## パフォーマンス最適化（今後の課題）

ビルド時に以下の警告が表示されます：

```
Some chunks are larger than 500 kB after minification.
```

これはJavaScriptバンドルサイズが大きいことを示しています（1.37MB）。

### 改善案

1. **動的インポート**: `React.lazy()`と`Suspense`を使用してコード分割
2. **手動チャンク分割**: `vite.config.ts`で`manualChunks`を設定
3. **画像最適化**: WebP形式の使用を検討
4. **Three.jsの最適化**: 必要な機能のみをインポート

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルドを再実行
npm run build
```

### 画像が表示されない場合

- publicディレクトリの画像ファイルが正しく配置されているか確認
- ファイル名に特殊文字（×など）が含まれているため、一部のサーバーで問題が発生する可能性があります

## サポート

問題が発生した場合は、以下を確認してください：

1. [Viteドキュメント](https://vitejs.dev/)
2. [Vercelドキュメント](https://vercel.com/docs)
3. [React Three Fiberドキュメント](https://docs.pmnd.rs/react-three-fiber)

## ライセンスと著作権

© 2024 株式会社ドットファウンド (.Found Inc.)
すべての権利を保有します。
