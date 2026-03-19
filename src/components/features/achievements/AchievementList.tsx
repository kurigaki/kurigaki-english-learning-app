"use client";

import { Achievement, UnlockedAchievement } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { AchievementCard } from "./AchievementCard";

type AchievementListProps = {
  unlockedAchievements: UnlockedAchievement[];
  filter?: Achievement["category"] | "all";
};

const CATEGORY_LABELS: Record<Achievement["category"], string> = {
  learning: "学習回数",
  combo: "連続正解",
  streak: "連続学習",
  mastery: "単語習得",
  level: "レベル",
  speed: "スピード",
  dungeon: "ダンジョン",
};

export const AchievementList = ({
  unlockedAchievements,
  filter = "all",
}: AchievementListProps) => {
  const unlockedMap = new Map(
    unlockedAchievements.map((a) => [a.achievementId, a.unlockedAt])
  );

  const filteredAchievements =
    filter === "all"
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((a) => a.category === filter);

  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<Achievement["category"], Achievement[]>);

  const categories = Object.keys(groupedAchievements) as Achievement["category"][];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary-500 rounded-full" />
            {CATEGORY_LABELS[category]}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              (
              {
                groupedAchievements[category].filter((a) =>
                  unlockedMap.has(a.id)
                ).length
              }
              /{groupedAchievements[category].length})
            </span>
          </h3>
          <div className="grid gap-3">
            {groupedAchievements[category].map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedMap.has(achievement.id)}
                unlockedAt={unlockedMap.get(achievement.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
