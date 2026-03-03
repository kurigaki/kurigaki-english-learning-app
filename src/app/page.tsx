"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, SpeakButton } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words, categoryLabels } from "@/data/words/compat";
import { isWeakWord } from "@/types";
import { pickDailyWords } from "@/lib/daily-words";
import type { Word } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { MANUAL_MASTERY_OPTIONS_ORDERED, getDisplayedManualMastery } from "@/lib/manual-mastery";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";

type UserProgress = {
  level: number;
  streak: number;
  xpProgress: { current: number; required: number; percentage: number };
  dailyProgress: { current: number; goal: number; percentage: number; completed: boolean };
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [weakWordCount, setWeakWordCount] = useState(0);
  const [srsReviewCount, setSrsReviewCount] = useState(0);
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [wordStatsMap, setWordStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMemoryById, setManualMemoryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = useCallback(async () => {
    const userData = await unifiedStorage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: unifiedStorage.getXpProgress(userData),
      dailyProgress: unifiedStorage.getDailyProgress(userData),
    });

    const [statsMap, manualMap, bookmarkedIds] = await Promise.all([
      unifiedStorage.getWordStats(),
      unifiedStorage.getManualMasteryMap(),
      unifiedStorage.getBookmarkedWordIds(),
    ]);
    setWordStatsMap(statsMap);
    setManualMemoryById(manualMap);
    setBookmarkedWordIds(bookmarkedIds);
    let weakCount = 0;
    statsMap.forEach((stats, wordId) => {
      if (isWeakWord(stats.accuracy, stats.totalAttempts) && words.some((w) => w.id === wordId)) {
        weakCount++;
      }
    });
    setWeakWordCount(weakCount);

    const dueWords = await unifiedStorage.getDailyReviewBatch();
    setSrsReviewCount(dueWords.length);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setDailyWords(pickDailyWords(words, today, 3));
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      // 削除済み単語の孤立データを自動クリーンアップしてからデータ取得
      unifiedStorage.cleanupOrphanedData();
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  const getDisplayedMastery = useCallback((wordId: number): ManualMasteryLevel => (
    getDisplayedManualMastery(wordId, wordStatsMap, manualMemoryById)
  ), [manualMemoryById, wordStatsMap]);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMemoryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  const toggleBookmark = useCallback(async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = await unifiedStorage.toggleBookmark(wordId);
    setBookmarkedWordIds((prev) => (
      next ? (prev.includes(wordId) ? prev : [...prev, wordId]) : prev.filter((id) => id !== wordId)
    ));
  }, []);

  const startFlashcard = useCallback((wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveQuickFlashcardSession([wordId]);
    router.push("/word-list");
  }, [router]);

  return (
    <div className="main-content-scroll px-4 pt-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 1. ミニステータスバー */}
        {isMounted && userProgress && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {userProgress.level}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Lv.</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm emoji-icon">🔥</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{userProgress.streak}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">日</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm emoji-icon">{userProgress.dailyProgress.completed ? "✅" : "🎯"}</span>
                  <span className={`text-sm font-bold ${userProgress.dailyProgress.completed ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {userProgress.dailyProgress.current}/{userProgress.dailyProgress.goal}
                  </span>
                </div>
              </div>
            </div>
            {/* XPバー */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
                <span>Lv.{userProgress.level} → Lv.{userProgress.level + 1}</span>
                <span>{userProgress.xpProgress.current}/{userProgress.xpProgress.required} XP</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${userProgress.xpProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. メインCTA: クイズに挑戦 */}
        <Link href="/quiz" className="block">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-xl font-bold">クイズに挑戦</h2>
                <p className="text-sm text-white/80">コースを選んでクイズに挑戦しよう</p>
              </div>
              <div className="text-white/60 group-hover:translate-x-1 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* 3. SRS復習 / 苦手復習（常時表示） */}
        {isMounted && (
          <Card hover className={`group border-2 ${srsReviewCount > 0 ? "border-primary-200 dark:border-primary-800/40 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20" : "border-slate-200 dark:border-slate-700"}`} padding="sm">
            <Link href="/review?mode=srs" className="block">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform ${srsReviewCount > 0 ? "bg-gradient-to-br from-primary-400 to-primary-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                  <span className="emoji-icon">🧠</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {srsReviewCount > 0 ? `今日の復習: ${srsReviewCount}語` : "今日の復習: 完了"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {srsReviewCount > 0 ? "最適なタイミングで復習して記憶を定着" : "今日の分はすべて終わっています"}
                  </p>
                </div>
                <div className="text-primary-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>
        )}

        {isMounted && (
          <Card hover className={`group border-2 ${weakWordCount > 0 ? "border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20" : "border-slate-200 dark:border-slate-700"}`} padding="sm">
            <Link href="/review?mode=weak" className="block">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform ${weakWordCount > 0 ? "bg-gradient-to-br from-red-400 to-red-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                  <span className="emoji-icon">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {weakWordCount > 0 ? `苦手な${weakWordCount}語を復習しよう` : "苦手な単語はありません"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {weakWordCount > 0 ? "正答率が低い単語を重点的に練習" : "まだ学習記録がないか、全問正解中です"}
                  </p>
                </div>
                <div className="text-red-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>
        )}

        {/* 4. 今日の単語 */}
        {isMounted && dailyWords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base emoji-icon">📅</span>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">今日の単語</h2>
            </div>
            <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
              {dailyWords.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center gap-2 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-3xl last:rounded-b-3xl"
                >
                  <button
                    onClick={(e) => toggleBookmark(word.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      bookmarkedWordIds.includes(word.id)
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-slate-300 hover:text-yellow-400"
                    }`}
                    title={bookmarkedWordIds.includes(word.id) ? "ブックマーク解除" : "ブックマークに追加"}
                  >
                    <svg
                      className="w-4 h-4"
                      fill={bookmarkedWordIds.includes(word.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => startFlashcard(word.id, e)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
                    title="この単語からフラッシュカード開始"
                  >
                    <span className="text-xs emoji-icon">🃏</span>
                  </button>
                  <Link href={`/word/${word.id}`} className="flex items-center gap-3 flex-1 min-w-0 group/link">
                    <SpeakButton text={word.word} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 dark:group-hover/link:text-primary-400 transition-colors">
                          {word.word}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {categoryLabels[word.category] ?? word.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover/link:text-primary-400 group-hover/link:translate-x-0.5 transition-all flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <div className="w-[170px] flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        正答率 {wordStatsMap.get(word.id)?.accuracy !== undefined && wordStatsMap.get(word.id)?.accuracy !== null
                          ? `${wordStatsMap.get(word.id)?.accuracy}%`
                          : "-"}
                      </span>
                      <select
                        value={getDisplayedMastery(word.id)}
                        onChange={(e) => handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
                        className="text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        {MANUAL_MASTERY_OPTIONS_ORDERED
                          .filter((opt) => (wordStatsMap.get(word.id)?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
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
            </Card>
          </div>
        )}

        {/* 5. サブ機能ショートカット: 実績 / ブックマーク / 苦手単語 */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/achievements" className="block">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">🏆</div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">実績</h3>
            </div>
          </Link>
          <Link href="/bookmarks" className="block">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">🔖</div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">ブックマーク</h3>
            </div>
          </Link>
          <Link href="/weak-words" className="block">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">📝</div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">苦手単語</h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
