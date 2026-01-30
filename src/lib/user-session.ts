/**
 * ユーザーセッション管理
 * ストレージモジュールが現在のユーザーIDを参照するためのシングルトン
 */

let currentUserId: string | null = null;

/**
 * 現在のユーザーIDを設定（auth-contextから呼び出される）
 */
export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId;
}

/**
 * 現在のユーザーIDを取得
 */
export function getCurrentUserId(): string | null {
  return currentUserId;
}

/**
 * ログイン中かどうかを確認
 */
export function isLoggedIn(): boolean {
  return currentUserId !== null;
}
