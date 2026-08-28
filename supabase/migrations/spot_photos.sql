-- ユーザーが、キュレーション済みスポット(src/data/spots.ts)のうち
-- Wikipedia等で写真が見つからなかったものに、実写真を投稿できるようにするテーブル。
-- spot自体はDBではなくコード内の静的データ(spots.ts)なので、外部キーではなく
-- slug(文字列)で緩く紐付ける。
--
-- 実行方法: SupabaseダッシュボードのSQL Editorに貼り付けて実行してください。
-- (このリポジトリのコードからは自動実行されません)

create table if not exists spot_photos (
  id uuid primary key default gen_random_uuid(),
  spot_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists spot_photos_spot_slug_idx on spot_photos (spot_slug);

alter table spot_photos enable row level security;

-- 誰でも閲覧できる(スポット詳細ページに表示するため)。
create policy "spot_photos_select_all" on spot_photos
  for select
  using (true);

-- ログインユーザーは誰でも追加できる(user_postsと同じ、投稿前の審査は無い方針)。
create policy "spot_photos_insert_own" on spot_photos
  for insert
  with check (auth.uid() = user_id);

-- 削除は投稿者本人のみ。
create policy "spot_photos_delete_own" on spot_photos
  for delete
  using (auth.uid() = user_id);
