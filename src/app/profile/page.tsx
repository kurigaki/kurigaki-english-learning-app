"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useSupabaseAvailable } from "@/lib/auth-context";
import { AvatarUpload } from "@/components/features/auth";
import { Card, Button } from "@/components/ui";
import { deleteAvatar } from "@/lib/supabase/storage";
import {
  getContentFilterEnabled,
  setContentFilterEnabled,
} from "@/lib/content-filter";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile, refreshProfile } =
    useAuth();
  const isSupabaseAvailable = useSupabaseAvailable();

  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contentFilter, setContentFilter] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 初期値を設定
  useEffect(() => {
    if (user?.profile?.display_name) {
      setDisplayName(user.profile.display_name);
    }
  }, [user]);

  // コンテンツフィルタの初期値を localStorage から読込
  useEffect(() => {
    setContentFilter(getContentFilterEnabled());
  }, []);

  const handleContentFilterToggle = (next: boolean) => {
    setContentFilter(next);
    setContentFilterEnabled(next);
  };

  // 未ログインの場合はログインページへリダイレクト
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateProfile({ displayName });

      if (result.success) {
        setMessage({ type: "success", text: "プロフィールを更新しました" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "更新に失敗しました",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    if (!user) return;

    const result = await updateProfile({ avatarUrl: url });

    if (result.success) {
      await refreshProfile();
      setMessage({ type: "success", text: "アバターを更新しました" });
    } else {
      setMessage({
        type: "error",
        text: result.error || "アバターの更新に失敗しました",
      });
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;

    // Storageから画像を削除
    await deleteAvatar(user.id);

    // DBのavatar_urlをnullに更新
    const result = await updateProfile({ avatarUrl: null });

    if (result.success) {
      await refreshProfile();
      setMessage({ type: "success", text: "アバターを初期画像に戻しました" });
    } else {
      setMessage({
        type: "error",
        text: result.error || "アバターの削除に失敗しました",
      });
    }
  };

  // Supabaseが利用不可の場合
  if (!isSupabaseAvailable) {
    return (
      <div className="main-content-scroll px-4 pt-8 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            認証機能は現在利用できません
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Supabaseの設定が完了していないため、プロフィール機能を利用できません。
          </p>
        </Card>
      </div>
    );
  }

  // ローディング中
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="main-content-scroll px-4 pt-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const currentDisplayName = user.profile?.display_name || user.email || "ユーザー";

  return (
    <div className="main-content-scroll px-4 pt-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 text-sm flex items-center gap-1"
          >
            <span>←</span>
            <span>ホームに戻る</span>
          </Link>
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            プロフィール編集
          </h1>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            {/* アバター */}
            <div className="flex justify-center">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={user.profile?.avatar_url || null}
                displayName={currentDisplayName}
                onUploadComplete={handleAvatarUpload}
                onRemove={handleAvatarRemove}
              />
            </div>

            {/* 表示名 */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                表示名
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="表示名を入力"
                maxLength={50}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                他のユーザーに表示される名前です（50文字以内）
              </p>
            </div>

            {/* メールアドレス（読み取り専用） */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                メールアドレス
              </label>
              <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
                {user.email}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                メールアドレスは変更できません
              </p>
            </div>

            {/* 保存ボタン */}
            <Button
              variant="primary"
              className="w-full py-3"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "変更を保存"}
            </Button>

            {/* 学習設定 */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span>🛡</span>
                <span>学習設定</span>
              </h2>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={contentFilter}
                    onChange={(e) => handleContentFilterToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-primary-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    センシティブな単語を非表示
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    飲酒・喫煙・暴力などの語を学習対象から除外します。未成年の学習者や、そのような語を避けたい方向けの設定です。
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
