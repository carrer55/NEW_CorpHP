# デプロイ前チェックリスト

サイトを本番環境に公開する前に、以下の項目を確認してください。

## ✅ 完了済み項目

### セキュリティ設定
- [x] Tailwind CSSをローカルビルドに変更（CDN依存を排除）
- [x] セキュリティヘッダーの設定（vite.config.ts）
- [x] Content Security Policy (CSP)の設定
- [x] X-Frame-Options: DENYの設定
- [x] X-Content-Type-Options: nosniffの設定
- [x] Referrer-Policyの設定
- [x] Permissions-Policyの設定

### メタデータとSEO
- [x] 適切なページタイトルの設定
- [x] メタディスクリプションの追加
- [x] OGPタグ（Facebook）の設定
- [x] Twitter Cardの設定
- [x] 言語属性（lang="ja"）の設定

### 環境変数管理
- [x] .env.exampleファイルの作成
- [x] .gitignoreに.envが含まれていることを確認

### ビルド検証
- [x] `npm run build`の成功確認
- [x] npm auditでの脆弱性チェック（0件）

## ⚠️ デプロイ前に必要な作業

### 1. OGP画像の準備
- [ ] 1200x630pxのOG画像を作成
- [ ] `public/og-image.png`として配置
- [ ] 画像の圧縮・最適化

### 2. ファビコンの追加
- [ ] ファビコン（favicon.ico）を作成
- [ ] `public/`ディレクトリに配置
- [ ] Apple Touch Iconの作成（推奨）

### 3. 本番環境の環境変数設定
- [ ] ホスティングサービスで環境変数を設定
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] 環境変数が正しく読み込まれることを確認

### 4. ホスティングサービスのセキュリティヘッダー設定

以下のいずれかを実施：

#### Vercelの場合
- [ ] `vercel.json`を作成（SECURITY.mdを参照）
- [ ] HTTPSリダイレクトの確認

#### Netlifyの場合
- [ ] `_headers`ファイルを作成（SECURITY.mdを参照）
- [ ] HTTPSリダイレクトの確認

#### Cloudflare Pagesの場合
- [ ] `_headers`ファイルをpublicに配置
- [ ] HTTPSリダイレクトの確認

### 5. ドメイン設定
- [ ] カスタムドメインの設定
- [ ] DNSレコードの設定
- [ ] SSL証明書の有効化確認

### 6. 外部サービスの設定確認
- [ ] Formspreeのプロジェクト設定確認
- [ ] Formspreeのスパム対策設定
- [ ] Google Fontsの読み込み確認

### 7. パフォーマンス最適化（推奨）
- [ ] 画像の最適化（特にUnsplashの画像をローカル化）
- [ ] Lighthouseスコアの確認
- [ ] Core Web Vitalsの測定

### 8. アクセス解析の設定（推奨）
- [ ] Google Analytics または他の解析ツールの設定
- [ ] プライバシーポリシーに解析ツールの使用を明記

### 9. robots.txtの作成
- [ ] `public/robots.txt`を作成
- [ ] 適切なクローラー設定

例：
```
User-agent: *
Allow: /
Sitemap: https://dotfound.co.jp/sitemap.xml
```

### 10. 最終チェック
- [ ] すべてのページが正常に表示されることを確認
- [ ] レスポンシブデザインの確認（モバイル、タブレット、デスクトップ）
- [ ] フォーム送信のテスト
- [ ] リンク切れの確認
- [ ] ブラウザの開発者ツールでエラーがないことを確認
- [ ] 異なるブラウザでの動作確認（Chrome, Firefox, Safari, Edge）

## 📊 公開後の監視

公開後は以下を定期的に確認してください：

- [ ] アクセスログの監視
- [ ] エラーログの確認
- [ ] フォーム送信の正常性確認
- [ ] セキュリティアップデートの適用
- [ ] 依存関係のアップデート（`npm audit`）
- [ ] SSLサートの有効期限確認

## 🔒 セキュリティ推奨事項

詳細は`SECURITY.md`を参照してください：

1. 環境変数を適切に管理
2. HTTPSを強制
3. セキュリティヘッダーの設定
4. 定期的な脆弱性チェック
5. アクセスログの監視

## 📞 サポート

問題が発生した場合：
- 技術的な問題: SECURITY.mdを参照
- 緊急時の連絡先: support@dotfound.co.jp
