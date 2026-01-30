import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { applyWebLocksPolyfill } from "./web-locks-polyfill";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase環境変数が設定されていません。認証機能は無効です。"
  );
}

// シングルトンパターンでクライアントを管理
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // ブラウザ環境でのみクライアントを作成
  if (typeof window === "undefined") {
    return null;
  }

  // Web Locks APIのポリフィルを適用（AbortError回避）
  applyWebLocksPolyfill();

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "implicit",
        storageKey: "english-app-auth",
      },
      global: {
        headers: {
          "X-Client-Info": "english-learning-app",
        },
      },
    });
  }

  return supabaseClient;
}

// Supabaseが利用可能かどうかを確認
export function isSupabaseAvailable(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
