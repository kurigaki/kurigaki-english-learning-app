"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeSwitcherProps = {
  className?: string;
};

export const ThemeSwitcher = ({ className = "" }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700 p-1 ${className}`}>
        <div className="w-8 h-8 rounded-lg" />
        <div className="w-8 h-8 rounded-lg" />
        <div className="w-8 h-8 rounded-lg" />
      </div>
    );
  }

  const options = [
    { value: "light", label: "ライトモード", icon: "☀️" },
    { value: "dark", label: "ダークモード", icon: "🌙" },
    { value: "system", label: "システム設定に従う", icon: "🖥️" },
  ] as const;

  return (
    <div
      className={`flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700 p-1 ${className}`}
      role="radiogroup"
      aria-label="テーマ切り替え"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            transition-all duration-200 text-sm
            ${
              theme === option.value
                ? "bg-white dark:bg-slate-600 shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-slate-600"
            }
          `}
          role="radio"
          aria-checked={theme === option.value}
          aria-label={option.label}
          title={option.label}
        >
          <span className="emoji-icon">{option.icon}</span>
        </button>
      ))}
    </div>
  );
};
