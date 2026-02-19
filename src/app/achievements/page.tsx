"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { UnlockedAchievement } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { unifiedStorage } from "@/lib/unified-storage";
import { AchievementList } from "@/components/features/achievements/AchievementList";
import { ProgressBar } from "@/components/ui";

export default function AchievementsPage() {
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const unlocked = await unifiedStorage.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);
    setIsLoading(false);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  if (isLoading) {
    return (
      <div className="main-content bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">読み込み中...</div>
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
    <div className="main-content bg-slate-50 dark:bg-slate-800/50 flex flex-col">
      {/* 上部固定: ヘッダー */}
      <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white px-3 py-3">
        <h1 className="text-lg font-bold mb-0.5">実績</h1>
        <p className="text-primary-100 text-[10px] mb-2">
          学習を続けて実績を集めよう！
        </p>

        {/* 全体進捗 */}
        <div className="bg-white/20 rounded-md p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">全体進捗</span>
            <span className="text-sm font-bold">
              {unlockedCount} / {totalAchievements}
            </span>
          </div>
          <ProgressBar current={unlockedCount} total={totalAchievements} variant="white" />
        </div>
      </div>

      {/* 上部固定: レアリティ別サマリー */}
      <div className="flex-shrink-0 px-3 -mt-2 mb-1.5">
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-2 grid grid-cols-4 gap-1">
          <div className="text-center">
            <div className="text-base mb-0.5">⬜</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">ノーマル</div>
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
              {rarityStats.common.unlocked}/{rarityStats.common.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-base mb-0.5">🟦</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">レア</div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              {rarityStats.rare.unlocked}/{rarityStats.rare.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-base mb-0.5">🟪</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">エピック</div>
            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
              {rarityStats.epic.unlocked}/{rarityStats.epic.total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-base mb-0.5">🟨</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">伝説</div>
            <div className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
              {rarityStats.legendary.unlocked}/{rarityStats.legendary.total}
            </div>
          </div>
        </div>
      </div>

      {/* 中央スクロール: 実績一覧 */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3">
        <AchievementList unlockedAchievements={unlockedAchievements} />
      </div>
    </div>
  );
}
