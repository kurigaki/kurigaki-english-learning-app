"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./UserMenu";

export const Header = () => {
  const pathname = usePathname();

  // PC版ヘッダーに表示するナビ
  const primaryNavItems = [
    { href: "/", label: "ホーム", icon: "🏠" },
    { href: "/quiz", label: "クイズ", icon: "📝" },
    { href: "/speed-challenge", label: "スピード", icon: "⚡" },
    { href: "/word-list", label: "単語帳", icon: "📖" },
    { href: "/history", label: "履歴", icon: "📊" },
    { href: "/achievements", label: "実績", icon: "🏆" },
  ];

  return (
    <header className="header relative">
      <div className="max-w-4xl mx-auto px-4 h-full flex items-center w-full">
        <div className="flex items-center justify-between w-full">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl emoji-icon">📚</span>
            <span className="font-bold text-lg text-gradient">English App</span>
          </Link>

          {/* PC用ナビゲーション（md以上で表示） */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {primaryNavItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
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

          {/* スマホ用（md未満で表示）：UserMenuのみ */}
          <div className="flex md:hidden items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
