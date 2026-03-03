"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
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
  const [forcePassThrough, setForcePassThrough] = useState(false);

  // 認証初期化が長引いても全画面ブロックを避ける（再発防止）
  useEffect(() => {
    if (!isLoading) {
      setForcePassThrough(false);
      return;
    }
    const timer = setTimeout(() => {
      setForcePassThrough(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !forcePassThrough) {
    return (
      <div className="main-content-scroll flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
