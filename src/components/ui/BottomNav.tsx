"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/quiz", label: "クイズ", icon: "📝" },
  { href: "/word-list", label: "単語帳", icon: "📖" },
  { href: "/history", label: "履歴", icon: "📊" },
  { href: "/more", label: "その他", icon: "⋯" },
];

// 「その他」メニューに含まれるパス（これらのパスではmoreをアクティブ表示）
const moreSubPaths = ["/more", "/achievements", "/bookmarks", "/weak-words"];

export const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/more") {
      return moreSubPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="メインナビゲーション"
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? "text-primary-600" : "text-slate-400"
              }`}
              {...(active ? { "aria-current": "page" as const } : {})}
            >
              <span className="text-xl emoji-icon leading-none">{item.icon}</span>
              <span className={`text-[10px] mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
