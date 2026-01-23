"use client";

import { Achievement } from "@/types";
import { getRarityColor, getRarityBorderColor } from "@/data/achievements";

type AchievementCardProps = {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  compact?: boolean;
};

export const AchievementCard = ({
  achievement,
  unlocked,
  unlockedAt,
  compact = false,
}: AchievementCardProps) => {
  const rarityColor = getRarityColor(achievement.rarity);
  const borderColor = getRarityBorderColor(achievement.rarity);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-lg border-2 ${
          unlocked ? borderColor : "border-gray-200"
        } ${unlocked ? "bg-white" : "bg-gray-50"}`}
      >
        <span className={`text-2xl ${!unlocked && "grayscale opacity-50"}`}>
          {achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              unlocked ? "text-gray-900" : "text-gray-400"
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
          ? `${borderColor} bg-white shadow-sm hover:shadow-md`
          : "border-gray-200 bg-gray-50"
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
                unlocked ? "text-gray-900" : "text-gray-400"
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
              unlocked ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {achievement.description}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-gray-400 mt-2">
              {new Date(unlockedAt).toLocaleDateString("ja-JP")} に獲得
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
