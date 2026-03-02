"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { saveHistoryTab, getAndClearHistoryTab } from "@/lib/navigation-state";
import { saveWordNavState } from "@/lib/word-nav-state";
import type { WordStats } from "@/lib/storage";
import { LearningRecord, Achievement, isWeakWord } from "@/types";
import { words, getWordsByCourse } from "@/data/words/compat";
import type { Course } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { getAchievementById } from "@/data/achievements";
import { Card, StatsCard, Button, SpeakButton } from "@/components/ui";

// レガシーの "fill-blank" も表示できるように string インデックスで定義
const questionTypeLabels: Record<string, string> = {
  "en-to-ja": "英→日",
  "ja-to-en": "日→英",
  "fill-blank": "穴埋め(旧)",  // 旧データとの互換性
  "listening": "リスニング",
  "dictation": "書き取り",
};

type CourseProgress = {
  course: Course;
  name: string;
  totalWords: number;
  masteredWords: number;
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
  const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<(Achievement & { unlockedAt: string })[]>([]);
  const [speedHighScore, setSpeedHighScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "weak" | "history" | "progress">("overview");

  const loadData = useCallback(async () => {
    const data = await unifiedStorage.getRecords();
    setRecords([...data].reverse());
    const statsMap = await unifiedStorage.getWordStats();
    setWordStats(statsMap);

    const highScore = await unifiedStorage.getSpeedChallengeHighScore();
    setSpeedHighScore(highScore);

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
        let masteredWords = 0;
        for (const w of courseWords) {
          const s = statsMap.get(w.id);
          if (s && s.totalAttempts >= 3 && s.accuracy >= 80) {
            masteredWords++;
          }
        }
        return {
          course: c,
          name: COURSE_DEFINITIONS[c].name,
          totalWords: courseWords.length,
          masteredWords,
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
    // レガシーの "fill-blank" も含め、全タイプを string キーで管理
    const stats: Record<string, { total: number; correct: number }> = {
      "en-to-ja": { total: 0, correct: 0 },
      "ja-to-en": { total: 0, correct: 0 },
      "listening": { total: 0, correct: 0 },
      "dictation": { total: 0, correct: 0 },
      "fill-blank": { total: 0, correct: 0 }, // 旧データとの互換性
    };

    for (const record of records) {
      const type = record.questionType || "en-to-ja";
      if (!stats[type]) stats[type] = { total: 0, correct: 0 };
      stats[type].total++;
      if (record.correct) stats[type].correct++;
    }

    return stats;
  }, [records]);

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

  const totalMastered = courseProgressList.reduce((sum, cp) => sum + cp.masteredWords, 0);
  const totalWordsInCourses = courseProgressList.reduce((sum, cp) => sum + cp.totalWords, 0);

  // 履歴の単語IDを取得するヘルパー関数
  const getWordIdByWord = (wordStr: string): number | null => {
    const found = words.find((w) => w.word === wordStr);
    return found ? found.id : null;
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
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
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
                  <span>学習進捗</span>
                  <span>{overallStats.uniqueWords} / {overallStats.totalWords} 単語</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${(overallStats.uniqueWords / overallStats.totalWords) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {Math.round((overallStats.uniqueWords / overallStats.totalWords) * 100)}% の単語を学習済み
                </p>
              </div>
            </Card>

            {/* Type Stats */}
            <Card>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <span className="emoji-icon">🎯</span>
                <span>問題タイプ別</span>
              </h2>
              <div className="space-y-2">
                {(Object.entries(typeStats) as [string, { total: number; correct: number }][]).filter(([, stats]) => stats.total > 0).map(
                  ([type, stats]) => {
                    const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-300">{questionTypeLabels[type] ?? type}</span>
                          <span className="text-slate-500 dark:text-slate-400">
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
            </Card>
          </div>
        )}

        {/* Weak Words Tab */}
        {activeTab === "weak" && (
          <Card>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="emoji-icon">💪</span>
              <span>苦手単語 ({weakWords.length}語)</span>
            </h2>
            {weakWords.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block emoji-icon">🎉</span>
                <p className="text-slate-500 dark:text-slate-400">苦手な単語はありません!</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">この調子で頑張りましょう</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${word.id}?from=history`}
                    onClick={() => { saveHistoryTab(activeTab); saveWordNavState(weakWords.map((w) => w.id), "history"); }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SpeakButton text={word.word} size="sm" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{word.word}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{word.meaning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-bold ${word.accuracy < 50 ? "text-error-500" : "text-accent-500"}`}>
                          {word.accuracy}%
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{word.attempts}回挑戦</p>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
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
                    const wordId = getWordIdByWord(record.word);
                    const content = (
                      <>
                        <div className="flex items-center gap-2">
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
                          <div className="flex-1 min-w-0">
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
                          {wordId && (
                            <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </>
                    );

                    return wordId ? (
                      <Link
                        key={record.id}
                        href={`/word/${wordId}?from=history`}
                        onClick={() => {
                          saveHistoryTab(activeTab);
                          const historyWordIds = Array.from(new Set(
                            records.slice(0, 50)
                              .map((r) => getWordIdByWord(r.word))
                              .filter((id): id is number => id !== null)
                          ));
                          saveWordNavState(historyWordIds, "history");
                        }}
                        className="p-2.5 flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={record.id}
                        className="p-2.5 flex items-center justify-between"
                      >
                        {content}
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
                        ({totalMastered}/{totalWordsInCourses}語 習得)
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-3 pt-2 grid grid-cols-2 gap-2">
                    {courseProgressList.map((cp) => {
                      const percentage = cp.totalWords > 0
                        ? Math.round((cp.masteredWords / cp.totalWords) * 100)
                        : 0;
                      return (
                        <Link
                          key={cp.course}
                          href={`/word-list?course=${cp.course}&mastery=mastered`}
                          className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
                        >
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5">{cp.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                            {cp.masteredWords}/{cp.totalWords}語
                          </p>
                          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* スピードチャレンジ ハイスコア */}
              {speedHighScore > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="emoji-icon">⚡</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">スピードチャレンジ</span>
                  </div>
                  <span className="font-bold text-orange-500">
                    {speedHighScore} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pt</span>
                  </span>
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
