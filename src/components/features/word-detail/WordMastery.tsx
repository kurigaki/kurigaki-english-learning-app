"use client";

import type { ManualMasteryLevel } from "@/lib/storage";
import { memoryLevelBarClass, memoryLevelLabels, getAutoMemoryLevel } from "@/lib/memory-level";

type WordMasteryProps = {
  accuracy: number | null; // 0-100 or null if not studied
  totalAttempts: number;
  manualLevel?: ManualMasteryLevel | null;
};

const MASTERY_EMOJI: Record<ManualMasteryLevel, string> = {
  unlearned: "🆕",
  weak: "📖",
  vague: "📝",
  almost: "💡",
  remembered: "✅",
};

// 静的定義（Tailwind が本番ビルドで正しくスキャンできるよう完全なクラス名で記述）
const MASTERY_TEXT_COLOR: Record<ManualMasteryLevel, string> = {
  unlearned: "text-slate-500 dark:text-slate-400",
  weak:      "text-red-600 dark:text-red-400",
  vague:     "text-yellow-500 dark:text-yellow-400",
  almost:    "text-lime-600 dark:text-lime-400",
  remembered:"text-cyan-600 dark:text-cyan-400",
};

// 記憶度バーの幅（%）: remembered=100%, almost=67%, vague=34%, weak=5%, unlearned=0%
const MASTERY_BAR_WIDTH: Record<ManualMasteryLevel, number> = {
  unlearned: 0,
  weak: 5,
  vague: 34,
  almost: 67,
  remembered: 100,
};

export const WordMastery = ({ accuracy, totalAttempts, manualLevel = null }: WordMasteryProps) => {
  const level: ManualMasteryLevel =
    manualLevel ?? getAutoMemoryLevel(accuracy, totalAttempts);
  const emoji = MASTERY_EMOJI[level];
  const textColorClass = MASTERY_TEXT_COLOR[level];
  const barColorClass = memoryLevelBarClass[level];
  const barWidth = totalAttempts > 0 ? MASTERY_BAR_WIDTH[level] : 0;

  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <span className="text-2xl emoji-icon">{emoji}</span>
        <div>
          <p className={`font-bold ${textColorClass}`}>{memoryLevelLabels[level]}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {totalAttempts > 0 ? `${totalAttempts}回学習 / 正答率${accuracy ?? 0}%` : "まだ学習していません"}
          </p>
        </div>
      </div>
      {/* 記憶度バー */}
      {totalAttempts > 0 && (
        <div className="w-24">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColorClass} transition-all duration-500`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
