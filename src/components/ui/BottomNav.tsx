"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTitleBGM, stopAllDungeonBGM } from "@/lib/dungeon/audio";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/word-list", label: "クイズ", icon: "📝" },
  { href: "/dungeon", label: "ダンジョン", icon: "⚔️" },
  { href: "/word-list/all", label: "単語帳", icon: "📖" },
  { href: "/history", label: "履歴", icon: "📊" },
];

export const BottomNav = () => {
  const pathname = usePathname();

  // ダンジョンページではBottomNavを非表示（誤タップ防止・レイアウト確保）
  if (pathname === "/dungeon") return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // クイズ（/word-list 完全一致）または詳細クイズ設定（/quiz/配下）
    if (href === "/word-list") {
      return pathname === "/word-list" || pathname === "/quiz" || pathname.startsWith("/quiz/");
    }
    // 単語帳（/word-list/配下のサブページ）
    if (href === "/word-list/all") {
      return pathname.startsWith("/word-list/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleNavClick = (href: string) => {
    if (href === "/dungeon") {
      // ダンジョンへ遷移: タイトルBGMをユーザージェスチャー内で開始（iOS対応）
      startTitleBGM();
    } else {
      // 他ページへ遷移: ダンジョンBGMを停止
      stopAllDungeonBGM();
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 dark:bg-slate-900/95 dark:border-slate-700"
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
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500"
              }`}
              {...(active ? { "aria-current": "page" as const } : {})}
            >
              <span className="text-lg emoji-icon leading-none">{item.icon}</span>
              <span className={`text-[9px] mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
