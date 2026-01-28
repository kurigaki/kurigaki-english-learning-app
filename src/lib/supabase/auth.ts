import { getSupabaseClient } from "./client";
import { getAuthErrorMessage, type AuthResult } from "@/types/auth";

/**
 * メールアドレスとパスワードでログイン
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "認証機能が利用できません" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true, user: data.user };
  } catch {
    return {
      success: false,
      error: "ネットワークエラーが発生しました。接続を確認してください",
    };
  }
}

/**
 * メールアドレスとパスワードで新規登録
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "認証機能が利用できません" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true, user: data.user ?? undefined };
  } catch {
    return {
      success: false,
      error: "ネットワークエラーが発生しました。接続を確認してください",
    };
  }
}

/**
 * ログアウト
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.auth.signOut();
}

/**
 * 現在のセッションを取得
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 現在のユーザーを取得
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "認証機能が利用できません" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "ネットワークエラーが発生しました。接続を確認してください",
    };
  }
}

/**
 * パスワードを更新
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "認証機能が利用できません" };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "ネットワークエラーが発生しました。接続を確認してください",
    };
  }
}

/**
 * メールアドレスのバリデーション
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * パスワードのバリデーション（最低6文字）
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * バリデーションエラーメッセージを取得
 */
export function getValidationErrors(
  email: string,
  password: string,
  confirmPassword?: string
): string[] {
  const errors: string[] = [];

  if (!email) {
    errors.push("メールアドレスを入力してください");
  } else if (!isValidEmail(email)) {
    errors.push("メールアドレスの形式が正しくありません");
  }

  if (!password) {
    errors.push("パスワードを入力してください");
  } else if (!isValidPassword(password)) {
    errors.push("パスワードは6文字以上で入力してください");
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push("パスワードが一致しません");
  }

  return errors;
}
