"use client";

import { useEffect, useState } from "react";
import { UnlockedAchievement } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { storage } from "@/lib/storage";
import { AchievementList } from "@/components/features/achievements/AchievementList";
import { ProgressBar } from "@/components/ui";

export default function AchievementsPage() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unlocked = storage.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.length;

  // レアリティ別の集計
  const rarityStats = {
    common: {
      total: ACHIEVEMENTS.filter((a) => a.rarity === "common").length,
      unlocked: unlockedAchievements.filter((ua) =>
        ACHIEVEMENTS.find((a) => a.id === ua.achievementId)?.rarity === "common"
      ).length,
    },
    rare: {
      total: ACHIEVEMENTS.filter((a) => a.rarity === "rare").length,
      unlocked: unlockedAchievements.filter((ua) =>
        ACHIEVEMENTS.find((a) => a.id === ua.achievementId)?.rarity === "rare"
      ).length,
    },
    epic: {
      total: ACHIEVEMENTS.filter((a) => a.rarity === "epic").length,
      unlocked: unlockedAchievements.filter((ua) =>
        ACHIEVEMENTS.find((a) => a.id === ua.achievementId)?.rarity === "epic"
      ).length,
    },
    legendary: {
      total: ACHIEVEMENTS.filter((a) => a.rarity === "legendary").length,
      unlocked: unlockedAchievements.filter((ua) =>
        ACHIEVEMENTS.find((a) => a.id === ua.achievementId)?.rarity ===
        "legendary"
      ).length,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">実績</h1>
        <p className="text-primary-100 text-sm mb-4">
          学習を続けて実績を集めよう！
        </p>

        {/* 全体進捗 */}
        <div className="bg-white/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">全体進捗</span>
            <span className="text-lg font-bold">
              {unlockedCount} / {totalAchievements}
            </span>
          </div>
          <ProgressBar current={unlockedCount} total={totalAchievements} variant="white" />
        </div>
      </div>

      {/* レアリティ別サマリー */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl mb-1">⬜</div>
            <div className="text-xs text-gray-500">ノーマル</div>
            <div className="text-sm font-bold text-gray-700">
              {rarityStats.common.unlocked}/{rarityStats.common.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🟦</div>
            <div className="text-xs text-gray-500">レア</div>
            <div className="text-sm font-bold text-blue-600">
              {rarityStats.rare.unlocked}/{rarityStats.rare.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🟪</div>
            <div className="text-xs text-gray-500">エピック</div>
            <div className="text-sm font-bold text-purple-600">
              {rarityStats.epic.unlocked}/{rarityStats.epic.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🟨</div>
            <div className="text-xs text-gray-500">伝説</div>
            <div className="text-sm font-bold text-yellow-600">
              {rarityStats.legendary.unlocked}/{rarityStats.legendary.total}
            </div>
          </div>
        </div>
      </div>

      {/* 実績一覧 */}
      <div className="px-4 mt-6">
        <AchievementList unlockedAchievements={unlockedAchievements} />
      </div>
    </div>
  );
}
