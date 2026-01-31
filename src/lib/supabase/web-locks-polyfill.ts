/**
 * Web Locks API のポリフィル
 * Supabase Auth JSのAbortError問題を回避するため
 *
 * 注意: このポリフィルはロックを実際には取得せず、即座にコールバックを実行する
 */

export function applyWebLocksPolyfill() {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined") return;

  // ネイティブのWeb Locks APIが利用可能な場合はポリフィルを適用しない
  // これにより、複数タブ間でのセッション管理が正常に動作する
  if (navigator.locks && typeof navigator.locks.request === "function") {
    // ネイティブAPIが存在する場合は何もしない
    console.log("[WebLocksPolyfill] Native Web Locks API available, skipping polyfill");
    return;
  }

  // 既にポリフィルが適用されている場合はスキップ
  if ((navigator.locks as unknown as { _polyfilled?: boolean })?._polyfilled) {
    return;
  }

  // モックLockオブジェクト（Supabaseが期待する形式）
  const createMockLock = (name: string): Lock => ({
    name,
    mode: "exclusive" as LockMode,
  });

  // シンプルなWeb Locks実装（ロックなしで即座に実行）
  const mockLocks: LockManager = {
    request: async <T>(
      name: string,
      callbackOrOptions: LockGrantedCallback<T> | LockOptions,
      maybeCallback?: LockGrantedCallback<T>
    ): Promise<T> => {
      const callback = typeof callbackOrOptions === "function"
        ? callbackOrOptions
        : maybeCallback!;

      // コールバックを即座に実行
      return await callback(createMockLock(name)) as T;
    },
    query: async () => ({
      held: [],
      pending: [],
    }),
  };

  // ポリフィルフラグを設定
  (mockLocks as unknown as { _polyfilled: boolean })._polyfilled = true;

  // navigator.locksを上書き
  Object.defineProperty(navigator, "locks", {
    value: mockLocks,
    writable: true,
    configurable: true,
  });

  console.log("[WebLocksPolyfill] Applied (fallback mode)");
}
