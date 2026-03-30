"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseAvailable } from "./supabase/client";
import type { Profile } from "@/types/database";
import type {
  AuthContextValue,
  AuthResult,
  ProfileUpdateData,
} from "@/types/auth";
import { getAuthErrorMessage } from "@/types/auth";
import { sendPasswordResetEmail, updatePassword } from "@/lib/supabase/auth";
import { syncLocalDataToSupabase, isSyncCompleted } from "./data-sync";
import { setCurrentUserId, setAuthTimedOut, resetAuthState } from "./user-session";

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSyncing, setIsSyncing] = useState(false);
  // タイムアウト復元モードかどうか（Supabaseが応答しないため、localStorageモードを維持）
  const [isTimeoutRecovery, setIsTimeoutRecovery] = useState(false);

  // 同期処理が外部要因でハングした場合でも画面全体を止めないためのタイムアウト
  const withTimeout = useCallback(
    async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timeout (${timeoutMs}ms)`)), timeoutMs)
        ),
      ]);
    },
    []
  );

  // ユーザーセッションを同期（ストレージモジュールがユーザーIDを参照できるように）
  useEffect(() => {
    if (user?.id) {
      // タイムアウト復元モードでない場合のみ、Supabase使用を許可
      if (!isTimeoutRecovery) {
        setAuthTimedOut(false);
      }
    }
    setCurrentUserId(user?.id ?? null);
  }, [user, isTimeoutRecovery]);

  // 念のためのフェイルセーフ:
  // 何らかの理由で認証初期化が完了しない場合でも、画面全体の読み込み中を解除する
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      console.warn("[Auth] 初期化が長時間継続したため、isLoadingを強制解除");
      setIsLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // プロフィールを取得（直接REST API使用）
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return null;
      }

      // localStorageからアクセストークンを取得
      let accessToken: string | null = null;
      try {
        const stored = localStorage.getItem("english-app-auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          accessToken = parsed?.access_token || null;
        }
      } catch {
        // 無視
      }

      if (!accessToken) {
        return null;
      }

      try {
        const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/vnd.pgrst.object+json",
          },
        });

        if (!response.ok) {
          if (response.status === 406) {
            // 406 = データなし（singleモードで0件）
            return null;
          }
          console.error("[Auth] fetchProfile: エラー status=", response.status);
          return null;
        }

        const data = await response.json();
        return data as Profile | null;
      } catch (error) {
        console.error("[Auth] fetchProfile: 例外", error);
        return null;
      }
    },
    []
  );

  // プロフィールを作成（初回ログイン時）
  const createProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("profiles")
        .insert({ id: userId })
        .select()
        .single();

      if (error) {
        console.error("プロフィール作成エラー:", error);
        return null;
      }

      return data as Profile | null;
    },
    []
  );

  // 初期化
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    // onAuthStateChangeで認証が完了したかどうかを追跡
    let authCompletedByEvent = false;

    // タイムアウト付きでgetSessionを呼び出す
    const getSessionWithTimeout = async (timeoutMs: number) => {
      const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((resolve) => {
        setTimeout(() => {
          resolve({
            data: { session: null },
            error: new Error("getSession timeout"),
          });
        }, timeoutMs);
      });

      return Promise.race([
        supabase.auth.getSession(),
        timeoutPromise,
      ]);
    };

    // localStorageから直接セッションを復元する試み
    const tryRecoverSessionFromStorage = (): { userId: string; email?: string } | null => {
      try {
        // Supabaseが使用する可能性のあるすべてのキーパターンを検索
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          // Supabaseのauth tokenキーパターンをチェック
          // フォーマット: sb-<project-ref>-auth-token または english-app-auth
          if (key.includes("auth-token") || key === "english-app-auth") {
            const stored = localStorage.getItem(key);
            if (!stored) continue;

            try {
              const parsed = JSON.parse(stored);
              if (parsed?.user?.id) {
                return { userId: parsed.user.id, email: parsed.user.email };
              }
            } catch {
              // JSONパース失敗 - 次のキーを試す
            }
          }
        }
        return null;
      } catch (error) {
        console.error("[Auth] tryRecoverSessionFromStorage: エラー:", error);
        return null;
      }
    };

    // 現在のセッションを確認
    const initializeAuth = async () => {
      // ステップ1: localStorageからセッション情報を確認（キャッシュとして保持）
      const cachedSession = tryRecoverSessionFromStorage();
      if (cachedSession) {
        // キャッシュ情報を保持（onAuthStateChangeの結果を待つ）
        setCurrentUserId(cachedSession.userId);
        // 注意: setIsLoading(false)は呼び出さない - onAuthStateChangeで設定
        // 注意: setAuthTimedOut(true)も呼び出さない - onAuthStateChangeの結果を待つ
      }

      // ステップ2: Supabaseセッションを確認（タイムアウト付き）
      try {
        const { data: { session }, error } = await getSessionWithTimeout(1500);

        if (!isMounted) return;

        if (!error && session?.user) {
          // Supabaseモードで動作
          setIsTimeoutRecovery(false);
          setAuthTimedOut(false);
          setCurrentUserId(session.user.id);
          setUser(session.user);
          // 初期表示を優先し、プロフィール取得は非同期で反映
          setIsLoading(false);
          console.info("[Auth] 認証初期化完了（Supabaseセッション復元）");
          void fetchProfile(session.user.id).then((userProfile) => {
            if (isMounted) setProfile(userProfile);
          });
        } else if (authCompletedByEvent) {
          // onAuthStateChangeで既に認証完了している
        } else if (cachedSession) {
          // SupabaseタイムアウトだがlocalStorageにセッションあり
          setIsTimeoutRecovery(true);
          setAuthTimedOut(true);
          setUser({
            id: cachedSession.userId,
            email: cachedSession.email,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: "",
          } as import("@supabase/supabase-js").User);
          if (isMounted) {
            setIsLoading(false);
            console.info("[Auth] 認証初期化完了（localStorageから復元）");
          }
        } else {
          // セッションなしの場合は待機せず未認証として即時表示
          setCurrentUserId(null);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.warn("[Auth] セッション確認が中断されました。未認証として継続します。");
        }
        // onAuthStateChangeで既に認証完了している場合はスキップ
        if (authCompletedByEvent) {
          return;
        }
        // エラー時もlocalStorageから復元を試みる
        if (cachedSession) {
          setIsTimeoutRecovery(true);
          setAuthTimedOut(true);
          setUser({
            id: cachedSession.userId,
            email: cachedSession.email,
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: "",
          } as import("@supabase/supabase-js").User);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }

    };

    initializeAuth();

    // 認証状態の変更を監視（ログイン/ログアウト時）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      try {
        if (session?.user) {
          // onAuthStateChangeで認証完了したことをマーク
          authCompletedByEvent = true;
          // 正常なログイン/セッション取得時はタイムアウト復元モードを解除
          setIsTimeoutRecovery(false);
          setCurrentUserId(session.user.id);
          setAuthTimedOut(false);
          setUser(session.user);
          // 重要: onAuthStateChangeで認証完了したら、isLoadingをfalseに設定
          // これにより、initializeAuthのgetSessionがタイムアウトしても影響を受けない
          setIsLoading(false);

          let userProfile = await fetchProfile(session.user.id);

          if (!isMounted) return;

          if (!userProfile && event === "SIGNED_IN") {
            userProfile = await createProfile(session.user.id);
          }

          if (isMounted) {
            setProfile(userProfile);
          }

          // ログイン時にlocalStorageのデータをSupabaseに同期
          if (event === "SIGNED_IN" && !isSyncCompleted(session.user.id)) {
            setIsSyncing(true);
            try {
              const result = await withTimeout(
                syncLocalDataToSupabase(session.user.id),
                10000,
                "data-sync"
              );
              if (!result.success && result.error) {
                console.warn("データ同期に失敗しました:", result.error);
              }
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") return;
              console.error("データ同期エラー:", error);
            } finally {
              if (isMounted) {
                setIsSyncing(false);
              }
            }
          }
        } else {
          // INITIAL_SESSIONでsession=nullの場合は、まだセッションが読み込まれていない可能性がある
          // SIGNED_OUTの場合のみユーザーをクリアする
          if (event === "SIGNED_OUT") {
            console.info("[Auth] ログアウト検知");
            setCurrentUserId(null);
            setUser(null);
            setProfile(null);
          } else {
            // INITIAL_SESSIONでsession=nullの場合は、initializeAuthのgetSession結果を待つ
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("認証状態変更エラー:", error);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, createProfile, withTimeout]);

  // ログイン
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
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
    },
    []
  );

  const sendReset = useCallback(
    async (email: string): Promise<AuthResult> => {
      return await sendPasswordResetEmail(email);
    },
    []
  );

  const updatePasswordHandler = useCallback(
    async (newPassword: string): Promise<AuthResult> => {
      return await updatePassword(newPassword);
    },
    []
  );

  // 新規登録
  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
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
    },
    []
  );

  // ログアウト
  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();

    // Supabaseからサインアウト（利用可能な場合）
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("サインアウトエラー:", error);
      }
    }

    // ローカル状態は必ずクリア（Supabaseの可否に関わらず）
    setUser(null);
    setProfile(null);
    setIsTimeoutRecovery(false);
    // 認証状態をリセット（次回ログイン時に正常に動作するように）
    resetAuthState();
  }, []);

  // プロフィール更新
  const updateProfile = useCallback(
    async (data: ProfileUpdateData): Promise<AuthResult> => {
      const supabase = getSupabaseClient();
      if (!supabase || !user) {
        return { success: false, error: "ログインが必要です" };
      }

      try {
        const updates: Partial<Profile> = {
          updated_at: new Date().toISOString(),
        };

        if (data.displayName !== undefined) {
          updates.display_name = data.displayName;
        }
        if (data.avatarUrl !== undefined) {
          updates.avatar_url = data.avatarUrl;
        }

        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) {
          return {
            success: false,
            error: "プロフィールの更新に失敗しました",
          };
        }

        // ローカル状態を更新
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
              }
            : null
        );

        return { success: true };
      } catch {
        return {
          success: false,
          error: "ネットワークエラーが発生しました",
        };
      }
    },
    [user]
  );

  // プロフィール再取得
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  }, [user, fetchProfile]);

  const value: AuthContextValue = {
    user: user
      ? {
          id: user.id,
          email: user.email,
          profile,
        }
      : null,
    // 認証初期化のみ全体ガード対象。同期処理中はアプリ利用を止めない。
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail: sendReset,
    updatePassword: updatePasswordHandler,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthはAuthProvider内で使用してください");
  }
  return context;
}

// Supabaseが利用可能かどうかをフックとして提供
export function useSupabaseAvailable(): boolean {
  return isSupabaseAvailable();
}
