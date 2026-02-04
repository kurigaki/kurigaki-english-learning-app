"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSupabaseAvailable } from "@/lib/auth-context";
import { RegisterForm } from "@/components/features/auth";
import { Card } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isSupabaseAvailable = useSupabaseAvailable();

  // 既にログイン済みならホームへリダイレクト
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Supabaseが利用不可の場合
  if (!isSupabaseAvailable) {
    return (
      <div className="main-content-scroll px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-4">
            認証機能は現在利用できません
          </h1>
          <p className="text-slate-600">
            Supabaseの設定が完了していないため、認証機能を利用できません。
            ローカルストレージを使用して学習を続けることができます。
          </p>
        </Card>
      </div>
    );
  }

  // ローディング中またはリダイレクト待ち
  if (isLoading || isAuthenticated) {
    return (
      <div className="main-content-scroll px-4 py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="main-content-scroll px-4 py-8 flex items-center justify-center">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">新規登録</h1>
          <p className="text-slate-600">
            アカウントを作成して学習を始めましょう
          </p>
        </div>
        <RegisterForm />
      </Card>
    </div>
  );
}
