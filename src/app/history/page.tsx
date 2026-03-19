"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { saveHistoryTab, getAndClearHistoryTab } from "@/lib/navigation-state";
import { saveWordNavState } from "@/lib/word-nav-state";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { LearningRecord, Achievement, isWeakWord } from "@/types";
import { words, getWordsByCourse } from "@/data/words/compat";
import { findWordId } from "@/lib/word-lookup";
import type { Course } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { getAchievementById } from "@/data/achievements";
import { Card, StatsCard, Button, SpeakButton } from "@/components/ui";
import {
  resolveMemoryLevel,
  memoryLevelLabels,
  memoryLevelBarClass,
} from "@/lib/memory-level";
import { MANUAL_MASTERY_OPTIONS_ORDERED, getDisplayedManualMastery } from "@/lib/manual-mastery";

const questionTypeLabels: Record<string, string> = {
  "en-to-ja": "英→日",
  "ja-to-en": "日→英",
  "listening": "リスニング",
  "dictation": "書き取り",
  "speaking": "スピーキング",
};

const DISPLAY_MEMORY_LEVEL_ORDER = [
  "remembered",
  "almost",
  "vague",
  "weak",
  "unlearned",
] as const;

type CourseProgress = {
  course: Course;
  name: string;
  totalWords: number;
  memoryCounts: Record<"unlearned" | "weak" | "vague" | "almost" | "remembered", number>;
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HistoryPage() {
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [wordStats, setWordStats] = useState<Map<number, WordStats>>(new Map());
  const [manualMemoryById, setManualMemoryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<(Achievement & { unlockedAt: string })[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "weak" | "history" | "progress">("overview");
  const hasStudyData = wordStats.size > 0;

  const loadData = useCallback(async () => {
    const [data, statsMap, manualMap] = await Promise.all([
      unifiedStorage.getRecords(),
      unifiedStorage.getWordStats(),
      unifiedStorage.getManualMasteryMap(),
    ]);
    setRecords([...data].reverse());
    setWordStats(statsMap);
    setManualMemoryById(manualMap);

    const unlocked = await unifiedStorage.getUnlockedAchievements();
    const recentWithDetails = unlocked
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 3)
      .map((ua) => {
        const achievement = getAchievementById(ua.achievementId);
        return achievement ? { ...achievement, unlockedAt: ua.unlockedAt } : null;
      })
      .filter((a): a is Achievement & { unlockedAt: string } => a !== null);
    setRecentAchievements(recentWithDetails);

    const progressList: CourseProgress[] = (Object.keys(COURSE_DEFINITIONS) as Course[])
      .filter((c) => COURSE_DEFINITIONS[c].stages.length > 0)
      .map((c) => {
        const courseWords = getWordsByCourse(c);
        const memoryCounts: Record<"unlearned" | "weak" | "vague" | "almost" | "remembered", number> = {
          unlearned: 0,
          weak: 0,
          vague: 0,
          almost: 0,
          remembered: 0,
        };
        for (const w of courseWords) {
          const level = resolveMemoryLevel(w.id, statsMap, manualMap);
          memoryCounts[level]++;
        }
        return {
          course: c,
          name: COURSE_DEFINITIONS[c].name,
          totalWords: courseWords.length,
          memoryCounts,
        };
      });
    setCourseProgressList(progressList);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    // 単語詳細から戻った際にタブ状態を復元
    const saved = getAndClearHistoryTab();
    if (saved) setActiveTab(saved);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(
      (r) => new Date(r.studiedAt).toDateString() === today
    );
    return {
      total: todayRecords.length,
      correct: todayRecords.filter((r) => r.correct).length,
      rate: todayRecords.length > 0
        ? Math.round((todayRecords.filter((r) => r.correct).length / todayRecords.length) * 100)
        : 0,
    };
  }, [records]);

  const overallStats = useMemo(() => ({
    total: records.length,
    correct: records.filter((r) => r.correct).length,
    rate: records.length > 0
      ? Math.round((records.filter((r) => r.correct).length / records.length) * 100)
      : 0,
    uniqueWords: wordStats.size,
    totalWords: words.length,
  }), [records, wordStats]);

  const typeStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {
      "en-to-ja": { total: 0, correct: 0 },
      "ja-to-en": { total: 0, correct: 0 },
      "listening": { total: 0, correct: 0 },
      "dictation": { total: 0, correct: 0 },
      "speaking":  { total: 0, correct: 0 },
    };

    for (const record of records) {
      const type = record.questionType || "en-to-ja";
      if (!stats[type]) stats[type] = { total: 0, correct: 0 };
      stats[type].total++;
      if (record.correct) stats[type].correct++;
    }

    return stats;
  }, [records]);

  // 過去7日間の1日あたり正解数（SRS学習効果グラフ用）
  const weeklyCorrectData = useMemo(() => {
    const days: { label: string; correct: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayRecords = records.filter((r) => new Date(r.studiedAt).toDateString() === dateStr);
      const label = i === 0 ? "今日" : `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({
        label,
        correct: dayRecords.filter((r) => r.correct).length,
        total: dayRecords.length,
      });
    }
    return days;
  }, [records]);

  // 最も苦手な問題タイプ（5回以上回答があるタイプの中で正答率が最低のもの）
  const weakestType = useMemo(() => {
    const candidates = (Object.entries(typeStats) as [string, { total: number; correct: number }][])
      .filter(([, s]) => s.total >= 5)
      .map(([type, s]) => ({ type, rate: Math.round((s.correct / s.total) * 100) }))
      .filter((t) => t.rate < 80);
    if (candidates.length === 0) return null;
    return candidates.reduce((worst, cur) => cur.rate < worst.rate ? cur : worst);
  }, [typeStats]);

  const weakWords = useMemo(() => {
    const weak: { id: number; word: string; meaning: string; accuracy: number; attempts: number }[] = [];
    wordStats.forEach((stats) => {
      if (isWeakWord(stats.accuracy, stats.totalAttempts)) {
        const wordData = words.find((w) => w.id === stats.wordId);
        if (wordData) {
          weak.push({
            id: wordData.id,
            word: wordData.word,
            meaning: wordData.meaning,
            accuracy: stats.accuracy,
            attempts: stats.totalAttempts,
          });
        }
      }
    });
    return weak.sort((a, b) => a.accuracy - b.accuracy);
  }, [wordStats]);

  const totalRemembered = courseProgressList.reduce((sum, cp) => sum + cp.memoryCounts.remembered, 0);
  const totalWordsInCourses = courseProgressList.reduce((sum, cp) => sum + cp.totalWords, 0);

  const overallMemoryCounts = useMemo(() => {
    const counts: Record<"unlearned" | "weak" | "vague" | "almost" | "remembered", number> = {
      unlearned: 0,
      weak: 0,
      vague: 0,
      almost: 0,
      remembered: 0,
    };
    for (const w of words) {
      const level = resolveMemoryLevel(w.id, wordStats, manualMemoryById);
      counts[level]++;
    }
    return counts;
  }, [wordStats, manualMemoryById]);

  const normalizeRecordWord = (wordStr: string): string => (
    wordStr
      .toLowerCase()
      .replace(/[‐‑‒–—-]/g, " ")
      .replace(/[^a-z' ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  // 履歴の単語IDを取得するヘルパー関数（record.wordId 優先）
  const getWordIdByRecord = (record: LearningRecord): number | null => {
    const validId = words.some((w) => w.id === record.wordId) ? record.wordId : null;
    if (validId !== null) return validId;
    const direct = findWordId(record.word);
    if (direct !== null) return direct;
    const normalized = normalizeRecordWord(record.word);
    if (!normalized || normalized === record.word.toLowerCase()) return null;
    return findWordId(normalized);
  };

  const getDisplayedMastery = useCallback((wordId: number): ManualMasteryLevel => (
    getDisplayedManualMastery(wordId, wordStats, manualMemoryById)
  ), [wordStats, manualMemoryById]);

  const handleManualMasteryChange = async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMemoryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  };

  if (!isMounted) {
    return (
      <div className="main-content flex items-center justify-center">
        <div className="animate-pulse text-primary-500">読み込み中...</div>
      </div>
    );
  }


  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-1.5">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="text-xl emoji-icon">📊</span>
            <span>学習統計</span>
          </h1>
        </div>

        {/* 上部固定: 今日の学習 */}
        <Card className="flex-shrink-0 mb-1.5 !p-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
            <span className="emoji-icon">🔥</span>
            <span>今日の学習</span>
          </h2>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{todayStats.total}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">回答数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-600 dark:text-success-400">{todayStats.correct}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">正解数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent-600 dark:text-accent-400">{todayStats.rate}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">正答率</div>
            </div>
          </div>
          {todayStats.total === 0 && (
            <div className="mt-1.5 text-center">
              <Link href="/quiz">
                <Button size="sm">今日の学習を始める</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 上部固定: タブ */}
        <div className="flex-shrink-0 flex gap-1 mb-1.5">
          {[
            { id: "overview" as const, label: "概要", icon: "📈" },
            { id: "weak" as const, label: "苦手単語", icon: "💪" },
            { id: "history" as const, label: "履歴", icon: "📝" },
            { id: "progress" as const, label: "進捗", icon: "📚" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 px-1 rounded-md text-xs font-medium transition-all inline-flex items-center justify-center gap-0.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
              }`}
            >
              <span className="emoji-icon text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 中央スクロール: タブコンテンツ */}
        <div className="flex-1 overflow-y-auto min-h-0">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Overall Stats */}
            <Card>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="emoji-icon">📊</span>
                <span>全体統計</span>
              </h2>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatsCard label="総回答数" value={overallStats.total} color="primary" />
                <StatsCard label="正解数" value={overallStats.correct} color="success" />
                <StatsCard label="正答率" value={`${overallStats.rate}%`} color="accent" />
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
                  <span>記憶度</span>
                  <span>{overallStats.totalWords}語</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-full flex">
                    {DISPLAY_MEMORY_LEVEL_ORDER.map((level) => (
                      <div
                        key={`overall-${level}`}
                        className={`${memoryLevelBarClass[level]} h-full transition-all duration-500`}
                        style={{ width: `${(overallMemoryCounts[level] / overallStats.totalWords) * 100}%` }}
                        title={`${memoryLevelLabels[level]}: ${overallMemoryCounts[level]}語`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {DISPLAY_MEMORY_LEVEL_ORDER.map((level) => (
                    <div key={`overall-legend-${level}`} className="flex items-center justify-between text-[11px]">
                      <span
                        className={
                          level === "unlearned"
                            ? "text-slate-600 dark:text-slate-300"
                            : level === "weak"
                            ? "text-red-600 dark:text-red-300"
                            : level === "vague"
                              ? "text-yellow-700 dark:text-yellow-300"
                              : level === "almost"
                                ? "text-lime-700 dark:text-lime-300"
                                : "text-cyan-700 dark:text-cyan-300"
                        }
                      >
                        {memoryLevelLabels[level]}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{overallMemoryCounts[level]}語</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Weekly Activity Graph */}
            <Card>
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span className="emoji-icon">📅</span>
                <span>過去7日間の学習活動</span>
              </h2>
              {records.length === 0 ? (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-2">まだ学習記録がありません</p>
              ) : (
                <div className="flex items-end gap-1.5 h-24">
                  {weeklyCorrectData.map((day, i) => {
                    const maxCorrect = Math.max(...weeklyCorrectData.map((d) => d.correct), 1);
                    const height = day.correct === 0 ? 4 : Math.max(8, Math.round((day.correct / maxCorrect) * 88));
                    const isToday = i === 6;
                    return (
                      <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                        {day.correct > 0 && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-none">{day.correct}</span>
                        )}
                        <div
                          className={`w-full rounded-t-sm transition-all duration-500 ${
                            isToday ? "bg-primary-500" : day.correct > 0 ? "bg-primary-300 dark:bg-primary-700" : "bg-slate-100 dark:bg-slate-700"
                          }`}
                          style={{ height: `${height}px` }}
                          title={`${day.label}: ${day.correct}問正解 / ${day.total}問`}
                        />
                        <span className={`text-[9px] leading-none ${isToday ? "font-bold text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500"}`}>
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Type Stats */}
            <Card>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="emoji-icon">🎯</span>
                <span>問題タイプ別</span>
              </h2>

              {/* 最も苦手なタイプのバナー */}
              {weakestType && (
                <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
                  <span className="text-base emoji-icon">📢</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-error-700 dark:text-error-300">
                      {questionTypeLabels[weakestType.type] ?? weakestType.type} が最も苦手です（{weakestType.rate}%）
                    </p>
                    <p className="text-[10px] text-error-600 dark:text-error-400">クイズ設定でこのタイプの比率を上げて練習しましょう</p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {(Object.entries(typeStats) as [string, { total: number; correct: number }][]).map(
                  ([type, stats]) => {
                    const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    const isWeakest = weakestType?.type === type;
                    if (stats.total === 0) {
                      return (
                        <div key={type} className="flex items-center justify-between text-sm opacity-40">
                          <span className="text-slate-500 dark:text-slate-400">{questionTypeLabels[type] ?? type}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">未挑戦</span>
                        </div>
                      );
                    }
                    const badge = rate >= 80
                      ? { label: "得意", cls: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300" }
                      : rate >= 60
                      ? { label: "普通", cls: "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300" }
                      : { label: "弱い", cls: "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300" };
                    return (
                      <div key={type} className={isWeakest ? "ring-1 ring-error-300 dark:ring-error-700 rounded-lg p-1.5 -mx-1.5" : ""}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 dark:text-slate-300">{questionTypeLabels[type] ?? type}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <span className="text-slate-500 dark:text-slate-400 text-xs">
                            {stats.correct}/{stats.total} ({rate}%)
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rate >= 80 ? "bg-success-500" : rate >= 60 ? "bg-accent-500" : "bg-error-400"
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {overallStats.total === 0 && (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                  学習記録がまだありません。クイズに挑戦してみましょう！
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Weak Words Tab */}
        {activeTab === "weak" && (
          <Card>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="emoji-icon">💪</span>
                <span>苦手単語 ({weakWords.length}語)</span>
              </h2>
              {weakWords.length > 0 && (
                <Link href="/quiz?weakOnly=true">
                  <Button size="sm">苦手単語を復習する</Button>
                </Link>
              )}
            </div>
            {weakWords.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block emoji-icon">{hasStudyData ? "🎉" : "📘"}</span>
                <p className="text-slate-500 dark:text-slate-400">
                  {hasStudyData ? "苦手な単語はありません!" : "まだ学習記録がありません"}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  {hasStudyData ? "この調子で頑張りましょう" : "まずはクイズに挑戦して学習を始めましょう"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  >
                    <Link
                      href={`/word/${word.id}?from=history`}
                      onClick={() => { saveHistoryTab(activeTab); saveWordNavState(weakWords.map((w) => w.id), "history"); }}
                      className="flex items-start justify-between flex-1 min-w-0 transition-all hover:scale-[1.01] group gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SpeakButton text={word.word} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-base sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors break-words">{word.word}</p>
                          <p className="text-sm sm:text-xs text-slate-500 dark:text-slate-400 break-words">{word.meaning}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{word.attempts}回挑戦</p>
                          <div
                            className="mt-1 flex items-center gap-1 sm:hidden"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                              正答率 {word.accuracy}%
                            </span>
                            <select
                              value={getDisplayedMastery(word.id)}
                              onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                              className="min-w-0 text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                              {MANUAL_MASTERY_OPTIONS_ORDERED
                                .filter((opt) => word.attempts === 0 || opt.key !== "unlearned")
                                .map((opt) => (
                                  <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                    <div className="hidden sm:block w-[160px] flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          正答率 {word.accuracy}%
                        </span>
                        <select
                          value={getDisplayedMastery(word.id)}
                          onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                          className="min-w-0 text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        >
                          {MANUAL_MASTERY_OPTIONS_ORDERED
                            .filter((opt) => word.attempts === 0 || opt.key !== "unlearned")
                            .map((opt) => (
                              <option key={`${word.id}-${opt.key}`} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <Link href="/quiz?weakOnly=true">
                    <Button>苦手単語を復習する</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        )}

          {/* History Tab */}
          {activeTab === "history" && (
            <Card padding="none">
              <div className="p-3 border-b border-primary-100">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="emoji-icon">📝</span>
                  <span>回答履歴</span>
                </h2>
              </div>

              {records.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-4xl mb-3 block emoji-icon">📚</span>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">まだ学習履歴がありません</p>
                  <Link href="/quiz">
                    <Button size="sm">クイズを始める</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-primary-50 dark:divide-slate-700">
                  {records.slice(0, 50).map((record) => {
                    const wordId = getWordIdByRecord(record);
                    const stats = wordId ? wordStats.get(wordId) : null;
                    if (!wordId) {
                      return (
                        <div key={record.id} className="p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                ${record.correct
                                  ? "bg-success-100 text-success-500"
                                  : "bg-error-100 text-error-500"
                                }
                              `}
                            >
                              {record.correct ? "✓" : "✗"}
                            </div>
                            <SpeakButton text={record.word} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{record.word}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{record.meaning}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.questionType && (
                              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                {questionTypeLabels[record.questionType]}
                              </span>
                            )}
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDate(record.studiedAt)}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={record.id} className="p-2.5 flex items-center gap-2">
                        <Link
                          href={`/word/${wordId}?from=history`}
                          onClick={() => {
                            saveHistoryTab(activeTab);
                            const historyWordIds = Array.from(new Set(
                              records.slice(0, 50)
                                .map((r) => getWordIdByRecord(r))
                                .filter((id): id is number => id !== null)
                            ));
                            saveWordNavState(historyWordIds, "history");
                          }}
                          className="flex items-center justify-between flex-1 min-w-0 hover:text-primary-600 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                ${record.correct
                                  ? "bg-success-100 text-success-500"
                                  : "bg-error-100 text-error-500"
                                }
                              `}
                            >
                              {record.correct ? "✓" : "✗"}
                            </div>
                            <SpeakButton text={record.word} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">{record.word}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{record.meaning}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.questionType && (
                              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                {questionTypeLabels[record.questionType]}
                              </span>
                            )}
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDate(record.studiedAt)}
                            </span>
                            <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                        <div className="w-[160px] flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                              正答率 {stats?.accuracy !== null && stats?.accuracy !== undefined ? `${stats.accuracy}%` : "-"}
                            </span>
                            <select
                              value={getDisplayedMastery(wordId)}
                              onChange={(e) => handleManualMasteryChange(wordId, e.target.value as ManualMasteryLevel)}
                              className="min-w-0 text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                              {MANUAL_MASTERY_OPTIONS_ORDERED
                                .filter((opt) => (stats?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
                                .map((opt) => (
                                  <option key={`${wordId}-${record.id}-${opt.key}`} value={opt.key}>
                                    {opt.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="space-y-4">
              {/* コース別進捗 */}
              {courseProgressList.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="emoji-icon">📚</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">コース別進捗</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({totalRemembered}/{totalWordsInCourses}語 覚えた)
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-3 pt-2 grid grid-cols-2 gap-2">
                    {courseProgressList.map((cp) => {
                      return (
                        <Link
                          key={cp.course}
                          href={`/word-list/all?course=${cp.course}`}
                          className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
                        >
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5">{cp.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                            {cp.totalWords}語
                          </p>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-full flex">
                              {DISPLAY_MEMORY_LEVEL_ORDER.map((level) => (
                                <div
                                  key={`${cp.course}-${level}`}
                                  className={`${memoryLevelBarClass[level]} h-full transition-all duration-500`}
                                  style={{ width: `${(cp.memoryCounts[level] / cp.totalWords) * 100}%` }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-1">
                            <span className="text-cyan-700 dark:text-cyan-300">覚えた単語 {cp.memoryCounts.remembered}</span>
                            <span className="text-lime-700 dark:text-lime-300">ほぼ覚えた単語 {cp.memoryCounts.almost}</span>
                            <span className="text-yellow-700 dark:text-yellow-300">うろ覚え単語 {cp.memoryCounts.vague}</span>
                            <span className="text-red-600 dark:text-red-300">苦手単語 {cp.memoryCounts.weak}</span>
                            <span className="text-slate-600 dark:text-slate-300">未学習単語 {cp.memoryCounts.unlearned}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 最近の実績 */}
              {recentAchievements.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span className="emoji-icon">🎖️</span>
                      <span>最近の実績</span>
                    </h2>
                    <Link href="/achievements" className="text-xs text-primary-500 hover:underline">
                      すべて見る →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {recentAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-100 dark:border-slate-700"
                      >
                        <span className="text-2xl emoji-icon">{achievement.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{achievement.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{achievement.description}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {new Date(achievement.unlockedAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* データなしメッセージ */}
              {overallStats.total === 0 && recentAchievements.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4 block emoji-icon">📚</span>
                  <p className="text-slate-500 dark:text-slate-400">まだ学習データがありません</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">クイズを始めて進捗を記録しよう</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 下部固定: クリアボタン */}
        {records.length > 0 && (
          <div className="flex-shrink-0 pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("学習履歴をすべて削除しますか？")) {
                  unifiedStorage.clearRecords();
                  setRecords([]);
                  setWordStats(new Map());
                }
              }}
            >
              <span className="flex items-center gap-1 text-error-500 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                履歴をクリア
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
