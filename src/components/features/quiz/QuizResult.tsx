import { useCallback, useEffect } from "react";
import Link from "next/link";
import { Button, SpeakButton } from "@/components/ui";
import { Question, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { MANUAL_MASTERY_OPTIONS_ORDERED, getDisplayedManualMastery } from "@/lib/manual-mastery";
import { getAccuracyBadgeClass } from "@/lib/accuracy-style";
import { getMasteryBadgeClass } from "@/lib/mastery-style";
import { AchievementUnlockPopup } from "@/components/features/achievements/AchievementUnlockPopup";
import { PerfectScorePopup } from "./PerfectScorePopup";
import { AnsweredWord, SessionResult } from "@/lib/quiz-session";
import { saveWordNavState } from "@/lib/word-nav-state";
import { getStreakMilestone, getStreakMilestoneMessage } from "@/lib/quiz/streaks";
import { unifiedStorage } from "@/lib/unified-storage";
import { QuizSettings } from "@/lib/quiz/settings";

type QuizResultProps = {
  score: number;
  questions: Question[];
  answeredWords: AnsweredWord[];
  sessionResult: SessionResult | null;
  elapsedSeconds: number;
  maxCombo: number;
  wordStatsById: Map<number, WordStats>;
  manualMasteryById: Record<number, ManualMasteryLevel>;
  setManualMasteryById: React.Dispatch<React.SetStateAction<Record<number, ManualMasteryLevel>>>;
  showingAchievement: Achievement | null;
  showPerfectScore: boolean;
  setShowPerfectScore: (show: boolean) => void;
  quizSettings: QuizSettings;
  startRetrySessionWithWordIds: (wordIds: number[]) => void;
  startNewSession: (settings: QuizSettings) => void;
  onClearResult: () => void;
  onSettings: () => void;
  onHome: () => void;
  handleAchievementClose: () => void;
};

export const QuizResult = ({
  score,
  questions,
  answeredWords,
  sessionResult,
  elapsedSeconds,
  maxCombo,
  wordStatsById,
  manualMasteryById,
  setManualMasteryById,
  showingAchievement,
  showPerfectScore,
  setShowPerfectScore,
  quizSettings,
  startRetrySessionWithWordIds,
  startNewSession,
  onSettings,
  onHome,
  handleAchievementClose,
}: QuizResultProps) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // 単語詳細から戻ってきた時にリザルトを復元できるようにフラグをセット。
    // クリーンアップでは削除しない（単語詳細へ遷移してもフラグを保持するため）。
    // フラグのクリアは新しいクイズ開始時（startNewSession / startRetrySessionWithWordIds）に行う。
    window.sessionStorage.setItem("quiz-show-result", "1");
  }, []);
  const totalQuestions = answeredWords.length || questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const sameQuestionIds = answeredWords.map((w) => w.id);
  const wrongQuestionIds = answeredWords.filter((w) => !w.correct).map((w) => w.id);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMasteryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, [setManualMasteryById]);

  const getMessage = () => {
    if (percentage === 100) return { emoji: "🎉", text: "パーフェクト!" };
    if (percentage >= 80) return { emoji: "🌟", text: "素晴らしい!" };
    if (percentage >= 60) return { emoji: "👍", text: "いい調子!" };
    return { emoji: "💪", text: "次は頑張ろう!" };
  };
  const message = getMessage();
  const leveledUp = sessionResult && sessionResult.newLevel > sessionResult.previousLevel;
  const streakMilestone = sessionResult
    ? getStreakMilestone(sessionResult.streak, sessionResult.previousStreak)
    : null;
  const streakMilestoneMessage = streakMilestone ? getStreakMilestoneMessage(streakMilestone) : null;
  const formatElapsedTime = (seconds: number) => {
    const totalSeconds = Math.max(0, Math.round(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) return `${hours}時間${minutes}分${secs}秒`;
    if (minutes > 0) return `${minutes}分${secs}秒`;
    return `${secs}秒`;
  };

  // 解除された実績を取得
  const newAchievements = sessionResult
    ? sessionResult.newAchievementIds
        .map((id) => getAchievementById(id))
        .filter((a): a is Achievement => a !== undefined)
    : [];

  return (
    <div className="main-content px-3 py-2 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col h-full">
        {/* 上部固定: スコアサマリー */}
        <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-card p-3 mb-2">
          {/* ストリークマイルストーン達成（コンパクト表示） */}
          {streakMilestoneMessage && (
            <div className="mb-2 p-1.5 bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 dark:from-orange-900/30 dark:via-red-900/30 dark:to-pink-900/30 rounded-lg border border-orange-300 dark:border-orange-800/40">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xl emoji-icon">{streakMilestoneMessage.emoji}</span>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-300">{streakMilestoneMessage.title}</p>
              </div>
            </div>
          )}

          {/* レベルアップ表示（コンパクト表示） */}
          {leveledUp && (
            <div className="mb-2 p-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-300 dark:border-yellow-800/40">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xl emoji-icon">🎊</span>
                <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                  レベルアップ! Lv.{sessionResult?.previousLevel} → Lv.{sessionResult?.newLevel}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-3xl emoji-icon">{message.emoji}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{message.text}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs">セッション完了!</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-2">
            <div className="flex items-center justify-center gap-3">
              <div>
                <div className="text-2xl font-bold text-gradient">
                  {score} / {totalQuestions}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs">正答率 {percentage}%</p>
                {elapsedSeconds > 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    解答時間 {formatElapsedTime(elapsedSeconds)}
                  </p>
                )}
              </div>
              {maxCombo >= 3 && (
                <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                  <div className="text-xl font-bold text-accent-500">{maxCombo}</div>
                  <p className="text-[10px] text-accent-400">最大コンボ</p>
                </div>
              )}
            </div>
          </div>

          {/* XP・ストリーク・デイリー目標（コンパクト） */}
          {sessionResult && (
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 rounded-md p-1.5">
                <span className="text-base emoji-icon">✨</span>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-300">+{sessionResult.earnedXp}</p>
                <p className="text-[9px] text-purple-400 dark:text-purple-400">XP</p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/20 rounded-md p-1.5">
                <span className="text-base emoji-icon">🔥</span>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-300">{sessionResult.streak}</p>
                <p className="text-[9px] text-orange-400 dark:text-orange-400">日連続</p>
              </div>
              <div className={`rounded-md p-1.5 ${
                sessionResult.dailyProgress.completed
                  ? "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20"
                  : "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20"
              }`}>
                <span className="text-base emoji-icon">{sessionResult.dailyProgress.completed ? "🏆" : "🎯"}</span>
                <p className={`text-xs font-bold ${
                  sessionResult.dailyProgress.completed ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                }`}>
                  {sessionResult.dailyProgress.current}/{sessionResult.dailyProgress.goal}
                </p>
                <p className={`text-[9px] ${
                  sessionResult.dailyProgress.completed ? "text-green-400 dark:text-green-500" : "text-blue-400 dark:text-blue-500"
                }`}>
                  {sessionResult.dailyProgress.completed ? "達成!" : "目標"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 中央スクロール可能エリア */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-2">
          {/* 新しく獲得した実績 */}
          {newAchievements.length > 0 && (
            <div className="mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-card p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">新しい実績を獲得!</p>
              <div className="space-y-1.5">
                {newAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/40"
                  >
                    <span className="text-xl emoji-icon">{achievement.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{achievement.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 出題された全単語一覧 */}
          {answeredWords.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                出題単語一覧（タップで詳細）
              </p>
              <div className="space-y-1.5">
                {answeredWords.map((word) => (
                  <div
                    key={`${word.id}-${word.word}`}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                      word.correct
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/40"
                        : "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/40"
                    }`}
                  >
                    <Link
                      href={`/word/${word.id}?from=quiz`}
                      onClick={() => saveWordNavState(answeredWords.map((w) => w.id), "quiz")}
                      className="flex items-center justify-between flex-1 min-w-0 transition-all hover:scale-[1.01] group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            word.correct
                              ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {word.correct ? "✓" : "✗"}
                        </div>
                        <SpeakButton text={word.word} size="sm" />
                        <div className="text-left min-w-0">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-xs group-hover:text-primary-600 transition-colors truncate">
                            {word.word}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{word.meaning}</p>
                        </div>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                    <div className="w-[140px] flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1 py-0.5 rounded border whitespace-nowrap ${getAccuracyBadgeClass(wordStatsById.get(word.id)?.accuracy)}`}>
                          正答率 {wordStatsById.get(word.id)?.accuracy !== null && wordStatsById.get(word.id)?.accuracy !== undefined
                            ? `${wordStatsById.get(word.id)?.accuracy}%`
                            : "-"}
                        </span>
                      <select
                        value={getDisplayedManualMastery(word.id, wordStatsById, manualMasteryById)}
                        onChange={(e) =>
                          handleManualMasteryChange(word.id, e.target.value as ManualMasteryLevel)
                        }
                        className={`w-full min-w-0 text-[10px] px-1.5 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-primary-400 ${getMasteryBadgeClass(getDisplayedManualMastery(word.id, wordStatsById, manualMasteryById))}`}
                      >
                        {MANUAL_MASTERY_OPTIONS_ORDERED
                          .filter((opt) => (wordStatsById.get(word.id)?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
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
              </div>
            </div>
          )}
        </div>

        {/* 下部固定: アクションボタン */}
        <div className="flex-shrink-0 space-y-1.5">
          {/* メインCTA: 不正解あり→復習 / 全問正解→次の10問 */}
          {wrongQuestionIds.length > 0 ? (
            <Button
              fullWidth
              onClick={() => startRetrySessionWithWordIds(wrongQuestionIds)}
            >
              間違えた問題を復習（{wrongQuestionIds.length}問）
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={() => startNewSession(quizSettings)}
            >
              次の10問へ
            </Button>
          )}

          {/* セカンダリ: 同じ問題で再挑戦 */}
          <Button
            fullWidth
            variant="secondary"
            onClick={() => startRetrySessionWithWordIds(sameQuestionIds)}
            disabled={sameQuestionIds.length === 0}
          >
            同じ{sameQuestionIds.length}問に再チャレンジ
          </Button>

          {/* サブ: 設定変更・ホーム */}
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant="secondary"
              onClick={onSettings}
              className="!px-1 !bg-amber-100 !text-amber-800 !border-amber-300 hover:!bg-amber-200 dark:!bg-amber-900/30 dark:!text-amber-200 dark:!border-amber-700"
            >
              設定変更
            </Button>
            <Link href="/" className="block">
              <Button
                variant="secondary"
                fullWidth
                onClick={onHome}
                className="!px-1 !bg-slate-100 !text-slate-700 !border-slate-300 hover:!bg-slate-200 dark:!bg-slate-700 dark:!text-slate-100 dark:!border-slate-500"
              >
                ホーム
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 実績解除ポップアップ */}
      {showingAchievement && (
        <AchievementUnlockPopup
          achievement={showingAchievement}
          onClose={handleAchievementClose}
        />
      )}

      {/* 全問正解ポップアップ */}
      {showPerfectScore && (
        <PerfectScorePopup
          mode="quiz"
          onClose={() => setShowPerfectScore(false)}
        />
      )}
    </div>
  );
};
