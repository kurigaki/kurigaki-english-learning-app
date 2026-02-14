"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card, StatsCard } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words, getWordsByCourse } from "@/data/words/compat";
import type { Course } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { Achievement } from "@/types";
import { ACHIEVEMENTS, getAchievementById } from "@/data/achievements";

type UserProgress = {
  level: number;
  streak: number;
  xpProgress: { current: number; required: number; percentage: number };
  dailyProgress: { current: number; goal: number; percentage: number; completed: boolean };
};

type CourseProgress = {
  course: Course;
  name: string;
  totalWords: number;
  masteredWords: number;
};

export default function Home() {
  // 認証状態を監視（認証状態が変わったらデータを再取得するため）
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0, rate: 0 });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [speedHighScore, setSpeedHighScore] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState<(Achievement & { unlockedAt: string })[]>([]);
  const [achievementProgress, setAchievementProgress] = useState({ unlocked: 0, total: 0 });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
  const [weakWordCount, setWeakWordCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = useCallback(async () => {
    // 学習記録を取得
    const records = await unifiedStorage.getRecords();
    const correct = records.filter((r) => r.correct).length;
    setStats({
      total: records.length,
      correct,
      rate: records.length > 0 ? Math.round((correct / records.length) * 100) : 0,
    });

    // ユーザーデータを取得
    const userData = await unifiedStorage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: unifiedStorage.getXpProgress(userData),
      dailyProgress: unifiedStorage.getDailyProgress(userData),
    });

    // スピードチャレンジのハイスコア
    const highScore = await unifiedStorage.getSpeedChallengeHighScore();
    setSpeedHighScore(highScore);

    // 最近獲得した実績（最新3件）
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

    // 実績進捗
    setAchievementProgress({
      unlocked: unlocked.length,
      total: ACHIEVEMENTS.length,
    });

    // ブックマーク数
    const bookmarks = await unifiedStorage.getBookmarkedWordIds();
    setBookmarkCount(bookmarks.length);

    // コース別学習進捗
    const statsMap = await unifiedStorage.getWordStats();
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

    // 苦手単語数（getWeakWords のデフォルト閾値 70 と合わせる）
    let weakCount = 0;
    statsMap.forEach((s) => {
      if (s.totalAttempts > 0 && s.accuracy < 70) {
        weakCount++;
      }
    });
    setWeakWordCount(weakCount);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  return (
    <div className="main-content-scroll px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block animate-float mb-4">
            <span className="text-6xl emoji-icon">📚</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-gradient">英単語マスター</span>
          </h1>
          <p className="text-slate-600 text-lg">
            毎日5分の学習で、語彙力アップ!
          </p>
        </div>

        {/* User Progress Section */}
        {isMounted && userProgress && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 via-accent-50 to-purple-50">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* レベル */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{userProgress.level}</span>
                </div>
                <p className="text-xs text-slate-500">レベル</p>
              </div>

              {/* ストリーク */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl emoji-icon">🔥</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{userProgress.streak}日</p>
                <p className="text-xs text-slate-500">連続</p>
              </div>

              {/* デイリー目標 */}
              <div className="text-center">
                <div className={`w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center shadow-lg ${
                  userProgress.dailyProgress.completed
                    ? "bg-gradient-to-br from-green-400 to-green-500"
                    : "bg-gradient-to-br from-blue-400 to-blue-500"
                }`}>
                  <span className="text-2xl emoji-icon">{userProgress.dailyProgress.completed ? "🏆" : "🎯"}</span>
                </div>
                <p className={`text-lg font-bold ${
                  userProgress.dailyProgress.completed ? "text-green-600" : "text-blue-600"
                }`}>
                  {userProgress.dailyProgress.current}/{userProgress.dailyProgress.goal}
                </p>
                <p className="text-xs text-slate-500">今日の目標</p>
              </div>
            </div>

            {/* XP進捗バー */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Lv.{userProgress.level} → Lv.{userProgress.level + 1}</span>
                <span>{userProgress.xpProgress.current}/{userProgress.xpProgress.required} XP</span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${userProgress.xpProgress.percentage}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Course Progress Section */}
        {isMounted && courseProgressList.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="emoji-icon">📚</span>
              <span>コース別進捗</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {courseProgressList.map((cp) => {
                const percentage = cp.totalWords > 0
                  ? Math.round((cp.masteredWords / cp.totalWords) * 100)
                  : 0;
                return (
                  <Link
                    key={cp.course}
                    href={`/quiz?course=${cp.course}`}
                    className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <p className="text-sm font-bold text-slate-700 mb-1">{cp.name}</p>
                    <p className="text-xs text-slate-500 mb-2">
                      {cp.masteredWords}/{cp.totalWords}語 習得
                    </p>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recommended Review */}
        {isMounted && weakWordCount > 0 && (
          <Card hover className="mb-6 group border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <Link href="/quiz?weakOnly=true" className="block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                  <span className="emoji-icon">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    苦手な{weakWordCount}語を復習しよう
                  </h3>
                  <p className="text-xs text-slate-500">
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

        {/* Stats Section */}
        {isMounted && stats.total > 0 && (
          <Card className="mb-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="emoji-icon">📈</span>
              <span>あなたの学習状況</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <StatsCard label="総回答数" value={stats.total} color="primary" />
              <StatsCard label="正解数" value={stats.correct} color="success" />
              <StatsCard label="正答率" value={`${stats.rate}%`} color="accent" />
            </div>
          </Card>
        )}

        {/* Action Cards */}
        <div className="space-y-4 mb-8">
          {/* 通常クイズ */}
          <Card hover className="group">
            <Link href="/quiz" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    クイズに挑戦
                  </h3>
                  <p className="text-slate-500 text-sm">
                    コースを選んでクイズに挑戦
                  </p>
                </div>
                <div className="text-primary-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* スピードチャレンジ */}
          <Card hover className="group border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <Link href="/speed-challenge" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    スピードチャレンジ
                  </h3>
                  <p className="text-slate-500 text-sm">
                    30秒で何問正解できる？
                    {speedHighScore > 0 && (
                      <span className="ml-2 text-orange-600 font-bold">
                        ハイスコア: {speedHighScore}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-orange-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* 実績 */}
          <Card hover className="group">
            <Link href="/achievements" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    実績
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {achievementProgress.unlocked}/{achievementProgress.total} 獲得済み
                  </p>
                </div>
                <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* 学習履歴 */}
          <Card hover className="group">
            <Link href="/history" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    学習履歴
                  </h3>
                  <p className="text-slate-500 text-sm">
                    過去の学習記録をチェック
                  </p>
                </div>
                <div className="text-accent-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* 単語帳 */}
          <Card hover className="group border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <Link href="/word-list" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  📖
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    単語帳
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {words.length}語の単語をコース別に閲覧
                  </p>
                </div>
                <div className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* 苦手単語 */}
          <Card hover className="group border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <Link href="/weak-words" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    苦手な単語
                  </h3>
                  <p className="text-slate-500 text-sm">
                    苦手な単語を重点的に復習
                  </p>
                </div>
                <div className="text-red-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>

          {/* ブックマーク */}
          <Card hover className="group border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <Link href="/bookmarks" className="block">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  🔖
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    ブックマーク
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {bookmarkCount > 0
                      ? `${bookmarkCount}語を保存中`
                      : "気になる単語を保存しよう"}
                  </p>
                </div>
                <div className="text-amber-400 group-hover:translate-x-1 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* 最近の実績 */}
        {isMounted && recentAchievements.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <span className="emoji-icon">🎖️</span>
                <span>最近の実績</span>
              </h2>
              <Link href="/achievements" className="text-sm text-primary-500 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <span className="text-3xl emoji-icon">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(achievement.unlockedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Motivation Message */}
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
          <div className="flex items-center gap-4">
            <span className="text-4xl emoji-icon">💪</span>
            <div>
              <p className="font-bold text-slate-700">今日も頑張ろう!</p>
              <p className="text-sm text-slate-500">
                継続は力なり。少しずつでも毎日続けることが大切です。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
