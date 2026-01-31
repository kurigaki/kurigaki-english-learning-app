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

  // ユーザーセッションを同期（ストレージモジュールがユーザーIDを参照できるように）
  useEffect(() => {
    if (user?.id) {
      // 認証成功時はタイムアウトフラグをリセット（Supabase使用を許可）
      setAuthTimedOut(false);
    }
    setCurrentUserId(user?.id ?? null);
  }, [user]);

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

    // タイムアウト: 5秒後に強制的にローディングを解除
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("認証初期化がタイムアウトしました");
        // 認証タイムアウトフラグを設定（Supabaseを使用せずlocalStorageモードで動作）
        setAuthTimedOut(true);
        setIsLoading(false);
      }
    }, 5000);

    // 現在のセッションを確認
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        // AbortErrorは無視
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("認証初期化エラー:", error);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // アンマウント後は処理しない
      if (!isMounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          let userProfile = await fetchProfile(session.user.id);

          // アンマウント後は処理しない
          if (!isMounted) return;

          // 新規登録時はプロフィールを作成
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
          setUser(null);
          setProfile(null);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("認証状態変更エラー:", error);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
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
