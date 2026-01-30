"use client";

import { useEffect, useState } from "react";
import { UnlockedAchievement } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { unifiedStorage } from "@/lib/unified-storage";
import { AchievementList } from "@/components/features/achievements/AchievementList";
import { ProgressBar } from "@/components/ui";

export default function AchievementsPage() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const unlocked = await unifiedStorage.getUnlockedAchievements();
      setUnlockedAchievements(unlocked);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
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
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* 上部固定: ヘッダー */}
      <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 py-4">
        <h1 className="text-xl font-bold mb-1">実績</h1>
        <p className="text-primary-100 text-xs mb-3">
          学習を続けて実績を集めよう！
        </p>

        {/* 全体進捗 */}
        <div className="bg-white/20 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">全体進捗</span>
            <span className="text-base font-bold">
              {unlockedCount} / {totalAchievements}
            </span>
          </div>
          <ProgressBar current={unlockedCount} total={totalAchievements} variant="white" />
        </div>
      </div>

      {/* 上部固定: レアリティ別サマリー */}
      <div className="flex-shrink-0 px-4 -mt-3 mb-2">
        <div className="bg-white rounded-lg shadow-sm p-3 grid grid-cols-4 gap-1">
          <div className="text-center">
            <div className="text-lg mb-0.5">⬜</div>
            <div className="text-xs text-gray-500">ノーマル</div>
            <div className="text-xs font-bold text-gray-700">
              {rarityStats.common.unlocked}/{rarityStats.common.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-0.5">🟦</div>
            <div className="text-xs text-gray-500">レア</div>
            <div className="text-xs font-bold text-blue-600">
              {rarityStats.rare.unlocked}/{rarityStats.rare.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-0.5">🟪</div>
            <div className="text-xs text-gray-500">エピック</div>
            <div className="text-xs font-bold text-purple-600">
              {rarityStats.epic.unlocked}/{rarityStats.epic.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-0.5">🟨</div>
            <div className="text-xs text-gray-500">伝説</div>
            <div className="text-xs font-bold text-yellow-600">
              {rarityStats.legendary.unlocked}/{rarityStats.legendary.total}
            </div>
          </div>
        </div>
      </div>

      {/* 中央スクロール: 実績一覧 */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
        <AchievementList unlockedAchievements={unlockedAchievements} />
      </div>
    </div>
  );
}
