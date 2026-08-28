-- user_posts.category に temple / coast (寺院・ビーチの新規投稿) を追加し、
-- food (お店投稿) を廃止する。あわせて、位置をテキストで入力するための
-- location_text列を追加する(緯度経度の地図ピックは廃止 — 下記背景参照)。
--
-- 背景: これまでtemple/coastはキュレーション済みデータ(spots.ts)とGoogle Places
-- 検索結果でしか表示されなかったが、Wikipediaにもキュレーション済みデータにも無い
-- 寺院・ビーチをユーザー自身が投稿できるようにする(src/lib/useUserSpots.ts参照)。
-- Foodタブは元々「お店検索」ではなく「料理紹介」中心という方針(仕様書§3)のため、
-- お店投稿(food)はここで廃止する。
-- 位置は当初、地図(Leaflet)で緯度経度をピックする形にしていたが、投稿フローを
-- 簡潔にするため「မြောက်ဦး၊ ရခိုင်ပြည်နယ်」のような地名のテキスト入力に変更した。
-- そのためこの投稿はホーム/mapのイラスト地図には表示されず、一覧・詳細ページにのみ
-- テキストで表示される。
--
-- 実行方法: SupabaseダッシュボードのSQL Editorに貼り付けて実行してください。
-- (このリポジトリのコードからは自動実行されません)
--
-- 注意: 実行前に、既存のcategory='food'の行が無いか確認すること。
--   select count(*) from user_posts where category = 'food';
-- 既存行がある場合、削除するか他のカテゴリーへ移行するか判断してから実行する
-- (このマイグレーションは移行は行わない)。

ALTER TABLE user_posts DROP CONSTRAINT IF EXISTS user_posts_category_check;
ALTER TABLE user_posts ADD CONSTRAINT user_posts_category_check
  CHECK (category IN ('dish', 'traditional', 'temple', 'coast'));

ALTER TABLE user_posts ADD COLUMN IF NOT EXISTS location_text text;
