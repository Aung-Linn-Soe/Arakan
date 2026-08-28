# ラカイン旅々(Rakhine Explorer)

ミャンマー・ラカイン州の観光情報(史跡・自然・食・伝統文化)を、ミャンマー語/英語/日本語で
紹介するカタログサイト。

要件・仕様の詳細は [rakhine_catalog_app_spec.md](./rakhine_catalog_app_spec.md) を参照。

## 開発環境の起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## 環境変数

`.env.local.example` を参考に `.env.local` を作成する。

- `GOOGLE_PLACES_API_KEY` — Google Places API (New) 用(サーバー専用)。
  **請求先アカウントがリンクされていないと写真(`photos`)だけが取得できない**ので注意
  (詳細は仕様書4.2節)。
- `NEXT_PUBLIC_ENABLE_GOOGLE_PLACES` — Google Places連携のON/OFF。
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
  — ユーザー投稿(料理紹介・伝統文化紹介など)機能に使用。

Wikipedia/Wikimedia Commons APIはAPIキー不要・無料で、追加設定なしで動作する。
