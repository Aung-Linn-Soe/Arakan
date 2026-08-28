import { SupabaseClient } from "@supabase/supabase-js";

// PostForm.tsx / EditDishForm.tsx / SpotPhotoUpload.tsx で重複していた
// Supabase Storage(post-imagesバケット)への画像アップロード処理の共通化。
// 元のファイル名(日本語・スペース等)をそのまま使うと、Storageのキーとして
// 無効になる場合があるため、拡張子だけ残して安全な名前に変える。
export async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  // 同じユーザーが同時に複数枚アップロードしてもパスが衝突しないよう、
  // 呼び出し側で用途ごとの接頭辞(例: "spot-<slug>")とインデックスを渡す。
  keyPrefix: string,
): Promise<string> {
  const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : "";
  const path = `${userId}/${keyPrefix}${Date.now()}${ext}`;
  const { error } = await supabase.storage.from("post-images").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}

// 複数ファイルをまとめてアップロードする(PostForm.tsx/EditDishForm.tsxの新規追加分)。
// インデックスをキーに含めて、同一ミリ秒内の複数アップロードでもパスが衝突しないようにする。
export async function uploadImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[],
  keyPrefix = "",
): Promise<string[]> {
  const urls: string[] = [];
  for (const [i, file] of files.entries()) {
    urls.push(await uploadImage(supabase, userId, file, `${keyPrefix}${i}-`));
  }
  return urls;
}
