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
import { getAchievementById } from "@/data/achievements";

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
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0, rate: 0 });
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [speedHighScore, setSpeedHighScore] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState<(Achievement & { unlockedAt: string })[]>([]);
  const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
  const [weakWordCount, setWeakWordCount] = useState(0);
  const [srsReviewCount, setSrsReviewCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  const loadData = useCallback(async () => {
    const records = await unifiedStorage.getRecords();
    const correct = records.filter((r) => r.correct).length;
    setStats({
      total: records.length,
      correct,
      rate: records.length > 0 ? Math.round((correct / records.length) * 100) : 0,
    });

    const userData = await unifiedStorage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: unifiedStorage.getXpProgress(userData),
      dailyProgress: unifiedStorage.getDailyProgress(userData),
    });

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

    let weakCount = 0;
    statsMap.forEach((s) => {
      if (s.totalAttempts > 0 && s.accuracy < 70) {
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

  // コース別の合計習得数
  const totalMastered = courseProgressList.reduce((sum, cp) => sum + cp.masteredWords, 0);
  const totalWordsInCourses = courseProgressList.reduce((sum, cp) => sum + cp.totalWords, 0);

  return (
    <div className="main-content-scroll px-4 py-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 1. ミニステータスバー */}
        {isMounted && userProgress && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {userProgress.level}
                  </span>
                  <span className="text-xs text-slate-500">Lv.</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm emoji-icon">🔥</span>
                  <span className="text-sm font-bold text-orange-600">{userProgress.streak}</span>
                  <span className="text-xs text-slate-500">日</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm emoji-icon">{userProgress.dailyProgress.completed ? "✅" : "🎯"}</span>
                  <span className={`text-sm font-bold ${userProgress.dailyProgress.completed ? "text-green-600" : "text-blue-600"}`}>
                    {userProgress.dailyProgress.current}/{userProgress.dailyProgress.goal}
                  </span>
                </div>
              </div>
            </div>
            {/* XPバー */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Lv.{userProgress.level} → Lv.{userProgress.level + 1}</span>
                <span>{userProgress.xpProgress.current}/{userProgress.xpProgress.required} XP</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
          <Card hover className="group border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50" padding="sm">
            <Link href="/quiz?srsReview=true" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <span className="emoji-icon">🧠</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800">
                    今日の復習: {srsReviewCount}語
                  </h3>
                  <p className="text-xs text-slate-500">
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
          <Card hover className="group border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50" padding="sm">
            <Link href="/quiz?weakOnly=true" className="block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                  <span className="emoji-icon">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800">
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

        {/* 4. クイックアクション行: スピチャレ + 単語帳 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/speed-challenge" className="block">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">⚡</div>
              <h3 className="text-sm font-bold text-slate-800">スピードチャレンジ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {speedHighScore > 0 ? (
                  <>ハイスコア: <span className="text-orange-600 font-bold">{speedHighScore}</span></>
                ) : (
                  "30秒で何問正解できる？"
                )}
              </p>
            </div>
          </Link>
          <Link href="/word-list" className="block">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">📖</div>
              <h3 className="text-sm font-bold text-slate-800">単語帳</h3>
              <p className="text-xs text-slate-500 mt-0.5">{words.length}語をコース別に閲覧</p>
            </div>
          </Link>
        </div>

        {/* 5. コース別進捗（折りたたみ式） */}
        {isMounted && courseProgressList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button
              onClick={() => setIsCourseOpen(!isCourseOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="emoji-icon">📚</span>
                <span className="text-sm font-bold text-slate-700">コース別進捗</span>
                <span className="text-xs text-slate-500">
                  ({totalMastered}/{totalWordsInCourses}語 習得)
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCourseOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCourseOpen && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                {courseProgressList.map((cp) => {
                  const percentage = cp.totalWords > 0
                    ? Math.round((cp.masteredWords / cp.totalWords) * 100)
                    : 0;
                  return (
                    <Link
                      key={cp.course}
                      href={`/word-list?course=${cp.course}&mastery=mastered`}
                      className="block p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                      <p className="text-xs font-bold text-slate-700 mb-0.5">{cp.name}</p>
                      <p className="text-[10px] text-slate-500 mb-1.5">
                        {cp.masteredWords}/{cp.totalWords}語
                      </p>
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. 学習統計サマリー */}
        {isMounted && stats.total > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="emoji-icon">📈</span>
              <span>学習状況</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <StatsCard label="総回答数" value={stats.total} color="primary" />
              <StatsCard label="正解数" value={stats.correct} color="success" />
              <StatsCard label="正答率" value={`${stats.rate}%`} color="accent" />
            </div>
          </div>
        )}

        {/* 7. 最近の実績 */}
        {isMounted && recentAchievements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
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
                  className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <span className="text-2xl emoji-icon">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{achievement.name}</p>
                    <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {new Date(achievement.unlockedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
