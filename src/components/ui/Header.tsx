"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "ホーム", icon: "🏠" },
    { href: "/quiz", label: "クイズ", icon: "📝" },
    { href: "/speed-challenge", label: "スピード", icon: "⚡" },
    { href: "/achievements", label: "実績", icon: "🏆" },
    { href: "/history", label: "履歴", icon: "📊" },
  ];

  return (
    <header className="header">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-lg text-gradient">English App</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-primary-100 text-primary-600"
                      : "text-slate-600 hover:bg-primary-50 hover:text-primary-500"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
