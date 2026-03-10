"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSupabaseAvailable } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidEmail, isValidPassword } from "@/lib/supabase/auth";
import { Card, Button } from "@/components/ui";

type ResetMode = "request" | "update";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabaseAvailable = useSupabaseAvailable();
  const { sendPasswordResetEmail, updatePassword } = useAuth();
  const [mode, setMode] = useState<ResetMode>("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const setupSession = async () => {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          window.history.replaceState({}, document.title, "/reset-password");
        } catch (err) {
          console.error("[ResetPassword] Failed to set session", err);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setMode(data.session ? "update" : "request");
    };

    setupSession();
    return () => { cancelled = true; };
  }, [supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!isValidEmail(email)) {
      setError("メールアドレスの形式が正しくありません");
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendPasswordResetEmail(email);
      if (!result.success) {
        setError(result.error || "送信に失敗しました");
        return;
      }
      setMessage("パスワード再設定メールを送信しました。メールをご確認ください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!newPassword || !confirmPassword) {
      setError("新しいパスワードを入力してください");
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    setIsLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (!result.success) {
        setError(result.error || "更新に失敗しました");
        return;
      }
      setMessage("パスワードを更新しました。ログイン画面へ戻ります。");
      setTimeout(() => router.push("/login"), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  if (!supabaseAvailable) {
    return (
      <div className="main-content flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            パスワード再設定
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            現在この環境では認証機能が利用できません。
          </p>
          <Link href="/login">
            <Button className="mt-4" fullWidth>ログインへ戻る</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="main-content flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          パスワード再設定
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {mode === "request"
            ? "登録したメールアドレスに再設定リンクを送ります。"
            : "新しいパスワードを入力してください。"}
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm">
            {message}
          </div>
        )}

        {mode === "request" ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2" htmlFor="reset-email">
                メールアドレス
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="example@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3" disabled={isLoading}>
              {isLoading ? "送信中..." : "再設定メールを送る"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2" htmlFor="new-password">
                新しいパスワード
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="6文字以上"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2" htmlFor="confirm-password">
                新しいパスワード（確認）
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="同じパスワードを再入力"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3" disabled={isLoading}>
              {isLoading ? "更新中..." : "パスワードを更新する"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          <Link href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            ログイン画面へ戻る
          </Link>
        </p>
      </Card>
    </div>
  );
}
