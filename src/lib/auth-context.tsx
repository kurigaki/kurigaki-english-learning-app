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
  const [isSyncing, setIsSyncing] = useState(false);
  // タイムアウト復元モードかどうか（Supabaseが応答しないため、localStorageモードを維持）
  const [isTimeoutRecovery, setIsTimeoutRecovery] = useState(false);

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

  // プロフィールを取得
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("プロフィール取得エラー:", error);
        return null;
      }

      return data as Profile | null;
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
                console.log("[Auth] localStorageから認証データ発見:", key);
                return { userId: parsed.user.id, email: parsed.user.email };
              }
            } catch {
              // JSON解析失敗は無視
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    };

    // 現在のセッションを確認
    const initializeAuth = async () => {
      console.log("[Auth] initializeAuth開始");

      // ステップ1: まずlocalStorageからセッションを即座に復元（UIを素早く表示）
      const cachedSession = tryRecoverSessionFromStorage();
      if (cachedSession) {
        console.log("[Auth] localStorageからセッションを即座に復元:", cachedSession.userId);
        // 即座にユーザー状態を設定（UIがすぐにログイン状態を表示）
        setIsTimeoutRecovery(true);
        setAuthTimedOut(true); // localStorageモードで開始
        setCurrentUserId(cachedSession.userId);
        setUser({
          id: cachedSession.userId,
          email: cachedSession.email,
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "",
        } as import("@supabase/supabase-js").User);
        // ローディング完了（ユーザーはすぐに操作可能）
        if (isMounted) {
          setIsLoading(false);
          console.log("[Auth] 即座復元完了、isLoading=false");
        }

        // ステップ2: バックグラウンドでSupabaseセッションを確認
        try {
          console.log("[Auth] バックグラウンドでgetSession開始");
          const { data: { session }, error } = await getSessionWithTimeout(3000);

          if (!isMounted) return;

          if (!error && session?.user) {
            console.log("[Auth] Supabaseセッション確認成功、Supabaseモードに切り替え");
            setIsTimeoutRecovery(false);
            setAuthTimedOut(false);
            setCurrentUserId(session.user.id);
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            console.log("[Auth] Supabaseセッション確認失敗/タイムアウト、localStorageモード継続");
            // localStorageモードを継続（既に設定済み）
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          console.log("[Auth] バックグラウンドセッション確認エラー、localStorageモード継続");
        }
      } else {
        // localStorageにセッションがない場合は通常のフロー
        try {
          console.log("[Auth] getSession呼び出し前");
          const { data: { session }, error } = await getSessionWithTimeout(3000);

          if (!isMounted) return;

          if (error) {
            console.log("[Auth] getSessionエラー/タイムアウト、セッションなし");
            setCurrentUserId(null);
          } else if (session?.user) {
            console.log("[Auth] ユーザーセッション検出:", session.user.id);
            setIsTimeoutRecovery(false);
            setCurrentUserId(session.user.id);
            setAuthTimedOut(false);
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            console.log("[Auth] セッションなし");
            setCurrentUserId(null);
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
          console.error("認証初期化エラー:", error);
          setCurrentUserId(null);
        } finally {
          if (isMounted) {
            console.log("[Auth] initializeAuth完了、isLoading=false");
            setIsLoading(false);
          }
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
          // 正常なログイン/セッション取得時はタイムアウト復元モードを解除
          setIsTimeoutRecovery(false);
          setCurrentUserId(session.user.id);
          setAuthTimedOut(false);
          setUser(session.user);
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
              const result = await syncLocalDataToSupabase(session.user.id);
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
          setCurrentUserId(null);
          setUser(null);
          setProfile(null);
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
  }, [fetchProfile, createProfile]);

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
    isLoading: isLoading || isSyncing,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
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
