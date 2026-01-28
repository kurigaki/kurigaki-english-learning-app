"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, StatsCard } from "@/components/ui";
import { storage } from "@/lib/storage";
import { words } from "@/data/words";
import { Achievement } from "@/types";
import { ACHIEVEMENTS, getAchievementById } from "@/data/achievements";

type UserProgress = {
  level: number;
  streak: number;
  xpProgress: { current: number; required: number; percentage: number };
  dailyProgress: { current: number; goal: number; percentage: number; completed: boolean };
};

export default function Home() {
  const [stats, setStats] = useState({ total: 0, correct: 0, rate: 0 });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [speedHighScore, setSpeedHighScore] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState<(Achievement & { unlockedAt: string })[]>([]);
  const [achievementProgress, setAchievementProgress] = useState({ unlocked: 0, total: 0 });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const records = storage.getRecords();
    const correct = records.filter((r) => r.correct).length;
    setStats({
      total: records.length,
      correct,
      rate: records.length > 0 ? Math.round((correct / records.length) * 100) : 0,
    });

    // ユーザーデータを取得
    const userData = storage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: storage.getXpProgress(userData),
      dailyProgress: storage.getDailyProgress(userData),
    });

    // スピードチャレンジのハイスコア
    setSpeedHighScore(storage.getSpeedChallengeHighScore());

    // 最近獲得した実績（最新3件）
    const unlocked = storage.getUnlockedAchievements();
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
    setBookmarkCount(storage.getBookmarkedWordIds().length);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
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
                    {words.length}語の単語クイズで実力チェック
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
                    {words.length}語の単語を検索・閲覧
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
