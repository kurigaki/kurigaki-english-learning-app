"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useSupabaseAvailable } from "@/lib/auth-context";

export const UserMenu = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const isSupabaseAvailable = useSupabaseAvailable();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // クリック外側でメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-slate-200" />
      </div>
    );
  }

  const isLoggedIn = isSupabaseAvailable && isAuthenticated && user;
  const displayName = isLoggedIn
    ? user.profile?.display_name || user.email || "ユーザー"
    : "メニュー";
  const avatarUrl = isLoggedIn ? user.profile?.avatar_url : null;
  const initial = isLoggedIn
    ? (user.email || "U").charAt(0).toUpperCase()
    : null;

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  // 共通のナビゲーションアイテム（PC版では非表示のページへのリンク）
  const commonNavItems = [
    {
      href: "/history",
      label: "学習履歴",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/bookmarks",
      label: "ブックマーク",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      href: "/updates",
      label: "お知らせ",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center gap-1.5 h-10 rounded-xl
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isLoggedIn
            ? "pl-1 pr-2 bg-slate-100 hover:bg-slate-200"
            : "px-3 bg-slate-100 hover:bg-slate-200"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="メニュー"
      >
        {isLoggedIn ? (
          <>
            {/* ログイン済み: アバター */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary-600">{initial}</span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 未ログイン: ユーザーアイコン */}
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </>
        )}
        {/* ドロップダウン矢印 */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
          {isLoggedIn ? (
            <>
              {/* ログイン済み: ユーザー情報 */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary-600">
                        {initial}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {displayName}
                    </p>
                    {user.email && (
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* アカウント設定 */}
              <nav className="py-1 border-b border-slate-100">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  プロフィール編集
                </Link>
              </nav>
            </>
          ) : (
            <>
              {/* 未ログイン: ログイン・新規登録への誘導 */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-primary-500 text-primary-600 hover:bg-primary-50 font-medium text-sm transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    新規登録
                  </Link>
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">
                  登録すると学習データを同期できます
                </p>
              </div>
            </>
          )}

          {/* 共通ナビゲーション（履歴・ブックマーク・お知らせ） */}
          <nav className="py-1">
            {commonNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ログアウト（ログイン時のみ） */}
          {isLoggedIn && (
            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                ログアウト
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
