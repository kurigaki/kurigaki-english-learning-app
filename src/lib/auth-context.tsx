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

  // プロフィールを取得（直接REST API使用）
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      console.log("[Auth] fetchProfile開始（直接API）:", userId);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log("[Auth] fetchProfile: Supabase設定なし");
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
        console.log("[Auth] fetchProfile: アクセストークンなし");
        return null;
      }

      try {
        const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
        console.log("[Auth] fetchProfile: リクエスト送信");

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/vnd.pgrst.object+json",
          },
        });

        console.log("[Auth] fetchProfile: レスポンス受信 status=", response.status);

        if (!response.ok) {
          if (response.status === 406) {
            // 406 = データなし（singleモードで0件）
            console.log("[Auth] fetchProfile: プロフィールなし");
            return null;
          }
          console.error("[Auth] fetchProfile: エラー status=", response.status);
          return null;
        }

        const data = await response.json();
        console.log("[Auth] fetchProfile完了:", data ? "データあり" : "データなし");
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
        console.log("[Auth] tryRecoverSessionFromStorage: localStorage検索開始, keys=" + localStorage.length);

        // Supabaseが使用する可能性のあるすべてのキーパターンを検索
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          // Supabaseのauth tokenキーパターンをチェック
          // フォーマット: sb-<project-ref>-auth-token または english-app-auth
          if (key.includes("auth-token") || key === "english-app-auth") {
            console.log("[Auth] tryRecoverSessionFromStorage: 認証キー発見:", key);
            const stored = localStorage.getItem(key);
            if (!stored) {
              console.log("[Auth] tryRecoverSessionFromStorage: キーの値が空");
              continue;
            }

            try {
              const parsed = JSON.parse(stored);
              console.log("[Auth] tryRecoverSessionFromStorage: パース成功, hasUser=" + !!parsed?.user + ", userId=" + parsed?.user?.id);
              if (parsed?.user?.id) {
                console.log("[Auth] localStorageから認証データ発見:", key);
                return { userId: parsed.user.id, email: parsed.user.email };
              }
            } catch (parseError) {
              console.log("[Auth] tryRecoverSessionFromStorage: JSONパース失敗:", parseError);
            }
          }
        }
        console.log("[Auth] tryRecoverSessionFromStorage: 認証データが見つからず");
        return null;
      } catch (error) {
        console.error("[Auth] tryRecoverSessionFromStorage: エラー:", error);
        return null;
      }
    };

    // 現在のセッションを確認
    const initializeAuth = async () => {
      console.log("[Auth] initializeAuth開始");

      // ステップ1: localStorageからセッション情報を確認（キャッシュとして保持）
      const cachedSession = tryRecoverSessionFromStorage();
      if (cachedSession) {
        console.log("[Auth] localStorageからセッション発見:", cachedSession.userId);
        // キャッシュ情報を保持（onAuthStateChangeの結果を待つ）
        setCurrentUserId(cachedSession.userId);
        // 注意: setIsLoading(false)は呼び出さない - onAuthStateChangeで設定
        // 注意: setAuthTimedOut(true)も呼び出さない - onAuthStateChangeの結果を待つ
      }

      // ステップ2: Supabaseセッションを確認（タイムアウト付き）
      try {
        console.log("[Auth] getSession開始");
        const { data: { session }, error } = await getSessionWithTimeout(3000);

        if (!isMounted) return;

        if (!error && session?.user) {
          console.log("[Auth] Supabaseセッション確認成功:", session.user.id);
          // Supabaseモードで動作
          setIsTimeoutRecovery(false);
          setAuthTimedOut(false);
          setCurrentUserId(session.user.id);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(userProfile);
            setIsLoading(false);
            console.log("[Auth] Supabaseセッション復元完了、isLoading=false");
          }
        } else if (authCompletedByEvent) {
          // onAuthStateChangeで既に認証完了している
          console.log("[Auth] onAuthStateChangeで既に認証完了、スキップ");
        } else if (cachedSession) {
          // SupabaseタイムアウトだがlocalStorageにセッションあり
          console.log("[Auth] Supabaseタイムアウト、localStorageから復元");
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
            console.log("[Auth] localStorageから復元完了、isLoading=false");
          }
        } else {
          // セッションなし - onAuthStateChangeのSIGNED_INを待つ
          console.log("[Auth] getSessionでセッションなし、onAuthStateChangeを待機");
          // 2秒待ってもonAuthStateChangeでSIGNED_INが来なければ、未認証として処理
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (!isMounted) return;
          if (authCompletedByEvent) {
            console.log("[Auth] 待機後、onAuthStateChangeで認証完了を確認");
          } else {
            console.log("[Auth] 待機後もセッションなし、未認証として処理");
            setCurrentUserId(null);
            if (isMounted) {
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.log("[Auth] セッション確認エラー");
        // onAuthStateChangeで既に認証完了している場合はスキップ
        if (authCompletedByEvent) {
          console.log("[Auth] onAuthStateChangeで既に認証完了、エラー処理スキップ");
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
      console.log("[Auth] onAuthStateChange:", "event=" + event, "hasSession=" + !!session, "isMounted=" + isMounted);
      if (!isMounted) return;

      try {
        if (session?.user) {
          console.log("[Auth] onAuthStateChange: セッション確認成功、Supabaseモードに設定");
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
          // INITIAL_SESSIONでsession=nullの場合は、まだセッションが読み込まれていない可能性がある
          // SIGNED_OUTの場合のみユーザーをクリアする
          if (event === "SIGNED_OUT") {
            console.log("[Auth] onAuthStateChange: SIGNED_OUT、ユーザーをクリア");
            setCurrentUserId(null);
            setUser(null);
            setProfile(null);
          } else {
            console.log("[Auth] onAuthStateChange: " + event + "でセッションなし、getSessionの結果を待機");
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

  // デバッグ: コンテキスト値をログ（文字列化して確実に中身を表示）
  console.log("[AuthContext] 提供値:",
    "hasUser=" + !!user,
    "userId=" + user?.id,
    "isLoading=" + value.isLoading,
    "isAuthenticated=" + value.isAuthenticated
  );

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
