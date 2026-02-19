"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/ui";

const menuItems = [
  {
    href: "/speed-challenge",
    label: "スピードチャレンジ",
    description: "30秒で何問正解できる？",
    icon: "⚡",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    href: "/achievements",
    label: "実績",
    description: "獲得した実績を確認",
    icon: "🏆",
    gradient: "from-purple-400 to-purple-600",
  },
  {
    href: "/bookmarks",
    label: "ブックマーク",
    description: "保存した単語を確認",
    icon: "🔖",
    gradient: "from-amber-400 to-amber-500",
  },
  {
    href: "/weak-words",
    label: "苦手な単語",
    description: "苦手な単語を重点的に復習",
    icon: "📝",
    gradient: "from-red-400 to-red-500",
  },
];

export default function MorePage() {
  return (
    <div className="main-content-scroll px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">その他</h1>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}
              >
                <span className="emoji-icon">{item.icon}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{item.label}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
              <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* テーマ設定 */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <span className="emoji-icon">🎨</span>
            <span>テーマ設定</span>
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">表示モードを切り替え</p>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
