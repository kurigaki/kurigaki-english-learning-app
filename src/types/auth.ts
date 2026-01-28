import type { User } from "@supabase/supabase-js";
import type { Profile } from "./database";

// 認証ユーザー情報
export type AuthUser = {
  id: string;
  email: string | undefined;
  profile: Profile | null;
};

// 認証コンテキストの状態
export type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

// 認証コンテキストのアクション
export type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
};

// 認証結果
export type AuthResult = {
  success: boolean;
  error?: string;
  user?: User;
};

// プロフィール更新データ
export type ProfileUpdateData = {
  displayName?: string;
  avatarUrl?: string;
};

// 認証エラーコード
export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "network_error"
  | "unknown";

// 認証エラーメッセージのマッピング
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません",
  "Email not confirmed": "メールアドレスの確認が必要です",
  "User already registered": "このメールアドレスは既に登録されています",
  "Password should be at least 6 characters": "パスワードは6文字以上で入力してください",
  "Unable to validate email address: invalid format": "メールアドレスの形式が正しくありません",
  "Network error": "ネットワークエラーが発生しました。接続を確認してください",
};

// エラーメッセージを日本語に変換
export function getAuthErrorMessage(error: string): string {
  return AUTH_ERROR_MESSAGES[error] || "エラーが発生しました。もう一度お試しください";
}
