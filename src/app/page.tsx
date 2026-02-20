"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words } from "@/data/words/compat";
import { isWeakWord } from "@/types";

type UserProgress = {
  level: number;
  streak: number;
  xpProgress: { current: number; required: number; percentage: number };
  dailyProgress: { current: number; goal: number; percentage: number; completed: boolean };
};

export default function Home() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [weakWordCount, setWeakWordCount] = useState(0);
  const [srsReviewCount, setSrsReviewCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = useCallback(async () => {
    const userData = await unifiedStorage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: unifiedStorage.getXpProgress(userData),
      dailyProgress: unifiedStorage.getDailyProgress(userData),
    });

    const statsMap = await unifiedStorage.getWordStats();
    let weakCount = 0;
    statsMap.forEach((stats, wordId) => {
      if (isWeakWord(stats.accuracy, stats.totalAttempts) && words.some((w) => w.id === wordId)) {
        weakCount++;
      }
    });
    setWeakWordCount(weakCount);

    const dueWords = await unifiedStorage.getDueWords();
    setSrsReviewCount(dueWords.length);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  return (
    <div className="main-content-scroll px-4 py-4">
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

        {/* 3. SRS復習 / 苦手復習（条件付き） */}
        {isMounted && srsReviewCount > 0 && (
          <Card hover className="group border-2 border-primary-200 dark:border-primary-800/40 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20" padding="sm">
            <Link href="/review?mode=srs" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <span className="emoji-icon">🧠</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    今日の復習: {srsReviewCount}語
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    最適なタイミングで復習して記憶を定着
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

        {isMounted && weakWordCount > 0 && (
          <Card hover className="group border-2 border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20" padding="sm">
            <Link href="/review?mode=weak" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <span className="emoji-icon">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    苦手な{weakWordCount}語を復習しよう
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    正答率が低い単語を重点的に練習
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

        {/* 4. サブ機能ショートカット: 実績 / ブックマーク / 苦手単語 */}
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
