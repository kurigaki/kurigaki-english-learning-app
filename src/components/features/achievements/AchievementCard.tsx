"use client";

import { Achievement } from "@/types";
import { getRarityColor, getRarityBorderColor } from "@/data/achievements";

type AchievementCardProps = {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  compact?: boolean;
  progress?: { current: number; total: number };
};

export const AchievementCard = ({
  achievement,
  unlocked,
  unlockedAt,
  compact = false,
  progress,
}: AchievementCardProps) => {
  const rarityColor = getRarityColor(achievement.rarity);
  const borderColor = getRarityBorderColor(achievement.rarity);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-lg border-2 ${
          unlocked ? borderColor : "border-slate-200 dark:border-slate-700"
        } ${unlocked ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-800/50"}`}
      >
        <span className={`text-2xl ${!unlocked && "grayscale opacity-50"}`}>
          {achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              unlocked ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {achievement.name}
          </p>
        </div>
        {unlocked && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${rarityColor}`}>
            {achievement.rarity === "legendary"
              ? "伝説"
              : achievement.rarity === "epic"
              ? "エピック"
              : achievement.rarity === "rare"
              ? "レア"
              : "ノーマル"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? `${borderColor} bg-white dark:bg-slate-800 shadow-sm hover:shadow-md`
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      }`}
    >
      {unlocked && achievement.rarity === "legendary" && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-100/50 via-transparent to-yellow-100/50 animate-pulse" />
      )}
      <div className="relative flex items-start gap-3">
        <span
          className={`text-4xl ${!unlocked && "grayscale opacity-50"}`}
        >
          {achievement.icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-bold ${
                unlocked ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {achievement.name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${rarityColor}`}>
              {achievement.rarity === "legendary"
                ? "伝説"
                : achievement.rarity === "epic"
                ? "エピック"
                : achievement.rarity === "rare"
                ? "レア"
                : "ノーマル"}
            </span>
          </div>
          <p
            className={`text-sm ${
              unlocked ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {achievement.description}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {new Date(unlockedAt).toLocaleDateString("ja-JP")} に獲得
            </p>
          )}
          {!unlocked && progress && progress.total > 1 && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
                <span>進捗</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
