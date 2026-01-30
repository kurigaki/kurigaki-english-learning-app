"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // PC版ヘッダーに表示するナビ（優先度高）
  const primaryNavItems = [
    { href: "/", label: "ホーム", icon: "🏠" },
    { href: "/quiz", label: "クイズ", icon: "📝" },
    { href: "/speed-challenge", label: "スピード", icon: "⚡" },
    { href: "/word-list", label: "単語帳", icon: "📖" },
    { href: "/achievements", label: "実績", icon: "🏆" },
  ];

  // スマホ版ハンバーガーメニューに表示する全ナビ
  const allNavItems = [
    ...primaryNavItems,
    { href: "/history", label: "履歴", icon: "📊" },
    { href: "/bookmarks", label: "ブックマーク", icon: "🔖" },
  ];

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Escキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl emoji-icon">📚</span>
            <span className="font-bold text-lg text-gradient">English App</span>
          </Link>

          {/* PC用ナビゲーション（md以上で表示） */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${isActive
                        ? "bg-primary-100 text-primary-600"
                        : "text-slate-600 hover:bg-primary-50 hover:text-primary-500"
                      }
                    `}
                  >
                    <span className="emoji-icon">{item.icon}</span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <UserMenu />
          </div>

          {/* スマホ用（md未満で表示） */}
          <div className="flex md:hidden items-center gap-2">
            <UserMenu />
            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="メニューを開く"
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* スマホ用ドロップダウンメニュー */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden mt-3 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <nav className="py-2">
              {allNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      text-base font-medium transition-colors
                      ${isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="emoji-icon text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto text-primary-500">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
