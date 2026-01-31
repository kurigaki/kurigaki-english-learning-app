"use client";

import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * 認証初期化が完了するまでローディング画面を表示するコンポーネント
 * これにより、Supabaseセッションが復元される前にページが表示されることを防ぐ
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
