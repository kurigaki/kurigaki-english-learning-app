"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { Achievement, UnlockedAchievement, PeriodProgress } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";
import { MISSIONS, getMissionsByPeriod } from "@/data/missions";
import { unifiedStorage } from "@/lib/unified-storage";
import { storage } from "@/lib/storage";
import { AchievementList } from "@/components/features/achievements/AchievementList";
import { ProgressBar } from "@/components/ui";

type PeriodTab = "daily" | "weekly" | "monthly" | "lifetime";

const PERIOD_TABS: { id: PeriodTab; label: string; icon: string }[] = [
  { id: "daily",    label: "日",   icon: "🌅" },
  { id: "weekly",   label: "週",   icon: "📅" },
  { id: "monthly",  label: "月",   icon: "🗓️" },
  { id: "lifetime", label: "累計", icon: "🏅" },
];

const CATEGORY_TABS: { id: Achievement["category"] | "all"; label: string; icon: string }[] = [
  { id: "all",      label: "全て",       icon: "🏅" },
  { id: "learning", label: "学習",       icon: "📚" },
  { id: "combo",    label: "コンボ",     icon: "🔥" },
  { id: "streak",   label: "連続",       icon: "📅" },
  { id: "mastery",  label: "習得",       icon: "📖" },
  { id: "level",    label: "Lv",         icon: "🌱" },
  { id: "speed",    label: "速度",       icon: "⚡" },
  { id: "dungeon",  label: "ダンジョン", icon: "⚔️" },
];

// ── ミッションカード ────────────────────────────────────────────────────────
function MissionCard({
  mission,
  current,
  completed,
}: {
  mission: (typeof MISSIONS)[number];
  current: number;
  completed: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl p-3 border flex items-center gap-3 ${
        completed
          ? "border-primary-300 dark:border-primary-600"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <span className="text-2xl emoji-icon flex-shrink-0">{mission.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {mission.name}
          </p>
          {completed ? (
            <span className="flex-shrink-0 text-[10px] font-bold text-white bg-primary-500 rounded-full px-2 py-0.5">
              達成
            </span>
          ) : (
            <span className="flex-shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {current}/{mission.target}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          {mission.description}
        </p>
        <ProgressBar current={current} total={mission.target} />
      </div>
    </div>
  );
}

// ── ミッション一覧 ──────────────────────────────────────────────────────────
function MissionSection({
  period,
  progress,
}: {
  period: "daily" | "weekly" | "monthly";
  progress: PeriodProgress;
}) {
  const missions = getMissionsByPeriod(period);
  const completedCount = missions.filter((m) =>
    progress.completed.includes(m.id) || progress[m.progressKey] >= m.target
  ).length;

  const periodLabel = period === "daily" ? "今日" : period === "weekly" ? "今週" : "今月";
  const resetLabel =
    period === "daily" ? "毎日リセット" : period === "weekly" ? "毎週月曜リセット" : "毎月1日リセット";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {periodLabel}のミッション
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">({resetLabel})</span>
        </div>
        <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400">
          {completedCount}/{missions.length} 達成
        </span>
      </div>
      {missions.map((m) => {
        const current = progress[m.progressKey];
        const completed =
          progress.completed.includes(m.id) || current >= m.target;
        return (
          <MissionCard
            key={m.id}
            mission={m}
            current={current}
            completed={completed}
          />
        );
      })}
    </div>
  );
}

// ── メインページ ────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<PeriodTab>("daily");
  const [activeCategory, setActiveCategory] = useState<Achievement["category"] | "all">("all");

  // ミッション進捗（ローカルストレージから直接読む）
  const [dailyProgress, setDailyProgress] = useState<PeriodProgress>(
    () => storage.getDailyMissionProgress()
  );
  const [weeklyProgress, setWeeklyProgress] = useState<PeriodProgress>(
    () => storage.getWeeklyMissionProgress()
  );
  const [monthlyProgress, setMonthlyProgress] = useState<PeriodProgress>(
    () => storage.getMonthlyMissionProgress()
  );

  const loadData = useCallback(async () => {
    const unlocked = await unifiedStorage.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);
    setDailyProgress(storage.getDailyMissionProgress());
    setWeeklyProgress(storage.getWeeklyMissionProgress());
    setMonthlyProgress(storage.getMonthlyMissionProgress());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  const dungeonProgressMap = useMemo<Record<string, { current: number; total: number }>>(() => {
    const ds = storage.getDungeonStats();
    return {
      dungeon_enter:       { current: Math.min(1, ds.attempts),  total: 1 },
      dungeon_floor3:      { current: Math.min(3, ds.maxFloor),  total: 3 },
      dungeon_first_clear: { current: Math.min(1, ds.clears),    total: 1 },
      dungeon_kills_10:    { current: Math.min(10, ds.kills),    total: 10 },
      dungeon_kills_50:    { current: Math.min(50, ds.kills),    total: 50 },
      dungeon_correct_50:  { current: Math.min(50, ds.correct),  total: 50 },
      dungeon_tenacious:   { current: Math.min(3, ds.attempts),  total: 3 },
    };
  }, []);

  if (isLoading) {
    return (
      <div className="main-content bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">読み込み中...</div>
      </div>
    );
  }

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.length;

  // 全ミッション達成数（累計）
  const totalMissions = MISSIONS.length;
  const completedMissions = [
    ...getMissionsByPeriod("daily").filter(
      (m) => dailyProgress.completed.includes(m.id) || dailyProgress[m.progressKey] >= m.target
    ),
    ...getMissionsByPeriod("weekly").filter(
      (m) => weeklyProgress.completed.includes(m.id) || weeklyProgress[m.progressKey] >= m.target
    ),
    ...getMissionsByPeriod("monthly").filter(
      (m) => monthlyProgress.completed.includes(m.id) || monthlyProgress[m.progressKey] >= m.target
    ),
  ].length;

  return (
    <div className="main-content bg-slate-50 dark:bg-slate-800/50 flex flex-col">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white px-3 py-3">
        <h1 className="text-lg font-bold mb-0.5">実績</h1>
        <p className="text-primary-100 text-[10px] mb-2">
          学習を続けて実績を集めよう！
        </p>
        {activePeriod === "lifetime" ? (
          <div className="bg-white/20 rounded-md p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">累計実績</span>
              <span className="text-sm font-bold">{unlockedCount} / {totalAchievements}</span>
            </div>
            <ProgressBar current={unlockedCount} total={totalAchievements} variant="white" />
          </div>
        ) : (
          <div className="bg-white/20 rounded-md p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">今期間の達成状況</span>
              <span className="text-sm font-bold">{completedMissions} / {totalMissions}</span>
            </div>
            <ProgressBar current={completedMissions} total={totalMissions} variant="white" />
          </div>
        )}
      </div>

      {/* 期間タブ */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePeriod(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePeriod === tab.id
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="emoji-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      {activePeriod !== "lifetime" ? (
        /* ── ミッションビュー ── */
        <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 pt-1">
          <MissionSection
            period={activePeriod}
            progress={
              activePeriod === "daily"
                ? dailyProgress
                : activePeriod === "weekly"
                ? weeklyProgress
                : monthlyProgress
            }
          />
        </div>
      ) : (
        /* ── 累計実績ビュー ── */
        <>
          {/* レアリティ別サマリー */}
          <div className="flex-shrink-0 px-3 pb-1">
            <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-2 grid grid-cols-4 gap-1">
              {(["common", "rare", "epic", "legendary"] as const).map((rarity) => {
                const total = ACHIEVEMENTS.filter((a) => a.rarity === rarity).length;
                const unlocked = unlockedAchievements.filter(
                  (ua) => ACHIEVEMENTS.find((a) => a.id === ua.achievementId)?.rarity === rarity
                ).length;
                const emoji = rarity === "common" ? "⬜" : rarity === "rare" ? "🟦" : rarity === "epic" ? "🟪" : "🟨";
                const label = rarity === "common" ? "ノーマル" : rarity === "rare" ? "レア" : rarity === "epic" ? "エピック" : "伝説";
                const cls = rarity === "common" ? "text-slate-700 dark:text-slate-200" : rarity === "rare" ? "text-blue-600 dark:text-blue-400" : rarity === "epic" ? "text-purple-600 dark:text-purple-400" : "text-yellow-600 dark:text-yellow-400";
                return (
                  <div key={rarity} className="text-center">
                    <div className="text-base mb-0.5">{emoji}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
                    <div className={`text-[10px] font-bold ${cls}`}>{unlocked}/{total}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* カテゴリタブ */}
          <div className="flex-shrink-0 px-3 mb-1.5">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
              {CATEGORY_TABS.map((tab) => {
                const tabAchievements = tab.id === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === tab.id);
                const tabUnlocked = tabAchievements.filter((a) => unlockedAchievements.some((ua) => ua.achievementId === a.id)).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      activeCategory === tab.id
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    <span className="emoji-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${activeCategory === tab.id ? "text-primary-100" : "text-slate-400 dark:text-slate-500"}`}>
                      {tabUnlocked}/{tabAchievements.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* 実績一覧 */}
          <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3">
            <AchievementList
              unlockedAchievements={unlockedAchievements}
              filter={activeCategory}
              progressMap={activeCategory === "dungeon" || activeCategory === "all" ? dungeonProgressMap : undefined}
            />
          </div>
        </>
      )}
    </div>
  );
}
