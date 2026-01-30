/**
 * ユーザーセッション管理
 * ストレージモジュールが現在のユーザーIDを参照するためのシングルトン
 */

let currentUserId: string | null = null;
let authTimedOut: boolean = false;

/**
 * 現在のユーザーIDを設定（auth-contextから呼び出される）
 */
export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId;
}

/**
 * 現在のユーザーIDを取得
 * 認証がタイムアウトした場合はnullを返す（localStorageを強制使用）
 */
export function getCurrentUserId(): string | null {
  // 認証がタイムアウトした場合はSupabaseを使用しない
  if (authTimedOut) {
    return null;
  }
  return currentUserId;
}

/**
 * ログイン中かどうかを確認
 */
export function isLoggedIn(): boolean {
  return currentUserId !== null && !authTimedOut;
}

/**
 * 認証タイムアウトを設定
 * タイムアウト後はSupabaseを使用せず、localStorageのみを使用する
 */
export function setAuthTimedOut(timedOut: boolean): void {
  authTimedOut = timedOut;
  if (timedOut) {
    console.warn("[UserSession] 認証がタイムアウトしました。localStorageモードで動作します。");
  }
}

/**
 * 認証タイムアウト状態を取得
 */
export function isAuthTimedOut(): boolean {
  return authTimedOut;
}

/**
 * 認証状態をリセット（ログアウト時などに使用）
 */
export function resetAuthState(): void {
  currentUserId = null;
  authTimedOut = false;
}
