# セキュリティ設定ガイド

このドキュメントは、本番環境へのデプロイ時に必要なセキュリティ設定を説明しています。

## 環境変数の設定

本番環境では、以下の環境変数を適切に設定してください：

```bash
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

`.env.example`を参考に、実際の値を設定してください。

## HTTPSの強制

本番環境では必ずHTTPSを使用してください。多くのホスティングサービス（Vercel、Netlify、Cloudflare Pagesなど）は自動的にHTTPSを有効にします。

## セキュリティヘッダー

開発・プレビュー環境では、`vite.config.ts`でセキュリティヘッダーが自動的に設定されます。

本番環境（Vercel、Netlify等）では、以下のヘッダー設定が必要です：

### Vercelの場合 (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://i.imgur.com; connect-src 'self' https://formspree.io https://raw.githubusercontent.com https://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io"
        }
      ]
    }
  ]
}
```

### Netlifyの場合 (_headers)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://i.imgur.com; connect-src 'self' https://formspree.io https://raw.githubusercontent.com https://*.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io
```

### Cloudflare Pagesの場合

Cloudflare Pagesでは、`_headers`ファイルをpublicディレクトリに配置してください。

## Supabaseのセキュリティ設定

現在、Supabaseの認証情報は設定されていますが、使用されていません。使用する場合は以下を確認してください：

1. Row Level Security (RLS)の有効化
2. 適切なポリシーの設定
3. ANON KEYの使用（SERVICE_ROLE_KEYは使用しない）

## 外部リソースの依存関係

以下の外部サービスに依存しています：

- **Google Fonts**: フォントの読み込み
- **Unsplash**: 画像ホスティング
- **Formspree**: フォーム送信
- **GitHub**: 3Dテキスト用のフォントファイル
- **imgur**: 製品画像

本番環境では、重要な画像をローカルにホスティングすることを検討してください。

## OGP画像の準備

`index.html`に設定されているOGP画像（`og-image.png`）を準備し、publicディレクトリに配置してください。

推奨サイズ: 1200x630px

## 定期的なセキュリティチェック

- `npm audit`を定期的に実行して脆弱性をチェック
- 依存関係の更新を定期的に実施
- アクセスログの監視

## 連絡先

セキュリティに関する問題を発見した場合は、以下にご連絡ください：
support@dotfound.co.jp
