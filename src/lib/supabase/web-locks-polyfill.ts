/**
 * Web Locks API のポリフィル
 * Supabase Auth JSのAbortError問題を回避するため
 */

export function applyWebLocksPolyfill() {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined") return;

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

      // ifAvailableオプションがある場合の処理
      const options = typeof callbackOrOptions === "object" ? callbackOrOptions : {};
      if (options.ifAvailable) {
        // ifAvailableの場合はnullを返すことが許容される
        try {
          return await callback(createMockLock(name)) as T;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return undefined as T;
          }
          throw error;
        }
      }

      try {
        // 通常のリクエストではモックLockを渡す
        return await callback(createMockLock(name)) as T;
      } catch (error) {
        // AbortErrorを無視
        if (error instanceof Error && error.name === "AbortError") {
          return undefined as T;
        }
        throw error;
      }
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

  console.log("[WebLocksPolyfill] Applied");
}
