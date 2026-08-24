import { createClient } from "@supabase/supabase-js";

// ブラウザ・クライアントコンポーネントから使う用(anon/publishableキー)。
// RLS(Row Level Security)で許可された範囲の操作しかできないため、公開しても安全。
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。.env.local を確認してください。",
    );
  }
  return createClient(url, anonKey);
}

// サーバー側(Route Handler等)から使う用(service_role/secretキー)。
// RLSを無視して全操作ができるため、絶対にクライアントへ渡さないこと。
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local を確認してください。",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
