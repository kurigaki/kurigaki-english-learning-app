"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { words, Word } from "@/data/words";
import { storage } from "@/lib/storage";
import { Card, Button, ProgressBar, SpeakButton } from "@/components/ui";
import { Question, QuestionType, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import { AchievementUnlockPopup } from "@/components/features/achievements/AchievementUnlockPopup";
import { speakWord, speakSentence, isSpeechSynthesisSupported } from "@/lib/audio";
import { CATEGORY_EMOJIS, getCategoryGradient } from "@/lib/image";
import {
  saveQuizResultState,
  getQuizResultState,
  clearQuizResultState,
  AnsweredWord,
  SessionResult,
} from "@/lib/quiz-session";

const QUESTIONS_PER_SESSION = 10;

// 問題タイプの出題比率
const QUESTION_TYPE_WEIGHTS: { type: QuestionType; weight: number }[] = [
  { type: "en-to-ja", weight: 50 },
  { type: "ja-to-en", weight: 30 },
  { type: "fill-blank", weight: 20 },
];

function selectQuestionType(): QuestionType {
  const totalWeight = QUESTION_TYPE_WEIGHTS.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { type, weight } of QUESTION_TYPE_WEIGHTS) {
    random -= weight;
    if (random <= 0) return type;
  }
  return "en-to-ja";
}

function generateChoicesForEnToJa(correctWord: Word, allWords: Word[]): string[] {
  const wrongWords = allWords
    .filter((w) => w.id !== correctWord.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [correctWord.meaning, ...wrongWords.map((w) => w.meaning)];
  return choices.sort(() => Math.random() - 0.5);
}

function generateChoicesForJaToEn(correctWord: Word, allWords: Word[]): string[] {
  const wrongWords = allWords
    .filter((w) => w.id !== correctWord.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [correctWord.word, ...wrongWords.map((w) => w.word)];
  return choices.sort(() => Math.random() - 0.5);
}

/**
 * 例文中に単語が含まれているかチェック（穴あき問題用）
 * 単語境界を考慮し、実際に穴を空けられるか確認
 */
function canCreateFillBlank(example: string, word: string): boolean {
  // 単語境界付きの正規表現でチェック
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
  return regex.test(example);
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 穴あき例文を生成
 */
function createFillBlankSentence(example: string, word: string): string {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
  return example.replace(regex, "_____");
}

function generateQuestion(word: Word, allWords: Word[]): Question {
  let type = selectQuestionType();

  // 穴あき問題の検証
  if (type === "fill-blank") {
    const example = word.example || "";
    // 例文がない、または単語が例文に含まれていない場合は別の問題タイプへ
    if (!example || !canCreateFillBlank(example, word.word)) {
      type = Math.random() > 0.5 ? "en-to-ja" : "ja-to-en";
    }
  }

  const wordData = {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    example: word.example,
    category: word.category,
  };

  switch (type) {
    case "en-to-ja":
      return {
        word: wordData,
        type: "en-to-ja",
        choices: generateChoicesForEnToJa(word, allWords),
        correctAnswer: word.meaning,
      };

    case "ja-to-en":
      return {
        word: wordData,
        type: "ja-to-en",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };

    case "fill-blank":
      return {
        word: wordData,
        type: "fill-blank",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };
  }
}

// セッション構成比率
const SESSION_COMPOSITION = {
  weakWords: 0.4,    // 苦手単語 40%
  newWords: 0.3,     // 未学習単語 30%
  reviewWords: 0.3,  // 復習単語 30%
};

function generateSessionQuestions(allWords: Word[], count: number): Question[] {
  const weakWordIds = storage.getWeakWords(70);
  const studiedWordIds = storage.getStudiedWordIds();

  // カテゴリ別に単語を分類
  const weakWords = allWords.filter((w) => weakWordIds.includes(w.id));
  const newWords = allWords.filter((w) => !studiedWordIds.includes(w.id));
  const reviewWords = allWords.filter(
    (w) => studiedWordIds.includes(w.id) && !weakWordIds.includes(w.id)
  );

  // 目標数を計算
  const targetWeak = Math.floor(count * SESSION_COMPOSITION.weakWords);
  const targetNew = Math.floor(count * SESSION_COMPOSITION.newWords);
  const targetReview = count - targetWeak - targetNew;

  // 各カテゴリからランダムに選択
  const shuffleAndTake = (arr: Word[], n: number): Word[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  const selectedWeak = shuffleAndTake(weakWords, targetWeak);
  const selectedNew = shuffleAndTake(newWords, targetNew);
  const selectedReview = shuffleAndTake(reviewWords, targetReview);

  // 足りない分を他のカテゴリで補充
  let selected = [...selectedWeak, ...selectedNew, ...selectedReview];

  if (selected.length < count) {
    const selectedIds = new Set(selected.map((w) => w.id));
    const remaining = allWords.filter((w) => !selectedIds.has(w.id));
    const additional = shuffleAndTake(remaining, count - selected.length);
    selected = [...selected, ...additional];
  }

  // シャッフルして問題を生成
  const shuffledSelected = selected.sort(() => Math.random() - 0.5);
  return shuffledSelected.map((word) => generateQuestion(word, allWords));
}

function getQuestionPrompt(type: QuestionType): string {
  switch (type) {
    case "en-to-ja":
      return "この単語の意味は?";
    case "ja-to-en":
      return "この意味の英単語は?";
    case "fill-blank":
      return "空欄に入る単語は?";
  }
}

function getQuestionDisplay(question: Question): string {
  switch (question.type) {
    case "en-to-ja":
      return question.word.word;
    case "ja-to-en":
      return question.word.meaning;
    case "fill-blank":
      // 穴あき例文を生成
      return question.word.example
        ? createFillBlankSentence(question.word.example, question.word.word)
        : "";
  }
}

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

function getStreakMilestone(streak: number, previousStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

function getStreakMilestoneMessage(milestone: number): { emoji: string; title: string; description: string } {
  switch (milestone) {
    case 3:
      return { emoji: "🌱", title: "3日連続達成!", description: "良いスタートです！この調子で続けましょう" };
    case 7:
      return { emoji: "🔥", title: "1週間連続!", description: "素晴らしい継続力！習慣化の第一歩です" };
    case 14:
      return { emoji: "⭐", title: "2週間連続!", description: "すごい！もう学習が習慣になっていますね" };
    case 30:
      return { emoji: "🏆", title: "1ヶ月連続!", description: "驚異的な継続力！あなたは本物の学習者です" };
    case 50:
      return { emoji: "💎", title: "50日連続!", description: "圧倒的な努力！尊敬に値します" };
    case 100:
      return { emoji: "👑", title: "100日連続!", description: "伝説の学習者！この領域に達する人はほとんどいません" };
    default:
      return { emoji: "🎉", title: `${milestone}日連続!`, description: "素晴らしい継続です！" };
  }
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredWords, setAnsweredWords] = useState<AnsweredWord[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [isRestoredFromSession, setIsRestoredFromSession] = useState(false);

  const currentQuestion = questions[currentIndex];
  const hasAutoPlayedRef = useRef<Set<number>>(new Set());

  // 保存されたリザルト状態を復元
  useEffect(() => {
    const savedState = getQuizResultState();
    if (savedState) {
      setScore(savedState.score);
      setMaxCombo(savedState.maxCombo);
      setAnsweredWords(savedState.answeredWords);
      setSessionResult(savedState.sessionResult);
      setIsFinished(true);
      setIsRestoredFromSession(true);
      // 復元後、状態をクリア（ページリロード時は新しいセッションになるように）
      // 注: 詳細画面から戻ってきた時のために、状態はクリアしない
    }
  }, []);

  // リザルト画面表示時に状態を保存
  useEffect(() => {
    if (isFinished && !isRestoredFromSession && answeredWords.length > 0) {
      saveQuizResultState({
        score,
        totalQuestions: answeredWords.length,
        maxCombo,
        answeredWords,
        sessionResult,
      });
    }
  }, [isFinished, isRestoredFromSession, score, maxCombo, answeredWords, sessionResult]);

  // 問題出題時の自動読み上げ
  useEffect(() => {
    if (!currentQuestion || !isSpeechSynthesisSupported()) return;

    // 既に回答済み（フィードバック表示中）の場合は再生しない
    if (selected !== null) return;

    // 同じ問題で既に自動再生済みの場合はスキップ
    if (hasAutoPlayedRef.current.has(currentIndex)) return;

    // 自動再生済みとしてマーク
    hasAutoPlayedRef.current.add(currentIndex);

    // 問題タイプに応じて読み上げ
    // 少し遅延を入れて画面表示後に再生（ユーザー体験向上）
    const timeoutId = setTimeout(() => {
      switch (currentQuestion.type) {
        case "en-to-ja":
          // 英単語を読み上げ
          speakWord(currentQuestion.word.word);
          break;
        case "fill-blank":
          // 穴埋め問題の場合は例文を読み上げ
          if (currentQuestion.word.example) {
            speakSentence(currentQuestion.word.example);
          }
          break;
        // ja-to-en の場合は日本語なので読み上げなし
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuestion, currentIndex, selected]);

  const startNewSession = useCallback(() => {
    // 新しいセッション開始時は保存された状態をクリア
    clearQuizResultState();

    const newQuestions = generateSessionQuestions(words, QUESTIONS_PER_SESSION);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setSelected(null);
    setIsCorrect(null);
    setSessionResult(null);
    setAnsweredWords([]);
    setIsRestoredFromSession(false);
    // 自動再生済みの記録をリセット
    hasAutoPlayedRef.current = new Set();
  }, []);

  // 初回ロード時（復元されていない場合のみ）
  useEffect(() => {
    const savedState = getQuizResultState();
    if (!savedState) {
      startNewSession();
    }
  }, [startNewSession]);

  const handleSelect = (choice: string) => {
    if (selected !== null || !currentQuestion) return;

    setSelected(choice);
    const correct = choice === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    // 全単語の結果を記録
    setAnsweredWords((prev) => [
      ...prev,
      {
        id: currentQuestion.word.id,
        word: currentQuestion.word.word,
        meaning: currentQuestion.word.meaning,
        correct,
      },
    ]);

    if (correct) {
      setScore((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
    } else {
      setCombo(0);
    }

    storage.addRecord({
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      meaning: currentQuestion.word.meaning,
      questionType: currentQuestion.type,
      correct,
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      // セッション完了時にXP・レベル・ストリークを記録
      const previousUserData = storage.getUserData();
      const previousLevel = previousUserData.level;
      const previousStreak = previousUserData.streak;
      const updatedUserData = storage.recordStudySession(score, maxCombo);
      const dailyProgress = storage.getDailyProgress(updatedUserData);

      const earnedXp = (score * 10) + (maxCombo * 5); // XP_PER_CORRECT + combo bonus

      // 実績チェック
      const totalQuestions = storage.getRecords().length;
      const masteredWords = storage.getMasteredWordCount();
      const newAchievementIds = storage.checkAndUnlockAchievements({
        totalQuestions,
        maxCombo,
        streak: updatedUserData.streak,
        masteredWords,
        level: updatedUserData.level,
      });

      const newAchievements = newAchievementIds
        .map((id) => getAchievementById(id))
        .filter((a): a is Achievement => a !== undefined);

      // 実績ポップアップ表示用にキュー
      if (newAchievements.length > 0) {
        setPendingAchievements(newAchievements);
        setShowingAchievement(newAchievements[0]);
      }

      const result: SessionResult = {
        earnedXp,
        newLevel: updatedUserData.level,
        previousLevel,
        streak: updatedUserData.streak,
        previousStreak,
        dailyProgress: {
          current: dailyProgress.current,
          goal: dailyProgress.goal,
          completed: dailyProgress.completed,
        },
        newAchievementIds,
      };

      setSessionResult(result);
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  };

  const handleAchievementClose = () => {
    const remaining = pendingAchievements.slice(1);
    setPendingAchievements(remaining);
    if (remaining.length > 0) {
      setTimeout(() => setShowingAchievement(remaining[0]), 300);
    } else {
      setShowingAchievement(null);
    }
  };

  if (!isFinished && questions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (isFinished) {
    const totalQuestions = answeredWords.length || questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
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

    // 解除された実績を取得
    const newAchievements = sessionResult
      ? sessionResult.newAchievementIds
          .map((id) => getAchievementById(id))
          .filter((a): a is Achievement => a !== undefined)
      : [];

    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          {/* ストリークマイルストーン達成 */}
          {streakMilestoneMessage && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 rounded-2xl border-2 border-orange-300 animate-pulse">
              <span className="text-5xl">{streakMilestoneMessage.emoji}</span>
              <p className="text-xl font-bold text-orange-700 mt-2">
                {streakMilestoneMessage.title}
              </p>
              <p className="text-orange-600 text-sm">
                {streakMilestoneMessage.description}
              </p>
            </div>
          )}

          {/* レベルアップ表示 */}
          {leveledUp && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-300 animate-pulse">
              <span className="text-4xl">🎊</span>
              <p className="text-xl font-bold text-yellow-700 mt-2">
                レベルアップ!
              </p>
              <p className="text-yellow-600">
                Lv.{sessionResult?.previousLevel} → Lv.{sessionResult?.newLevel}
              </p>
            </div>
          )}

          <div className="animate-bounce-slow mb-4">
            <span className="text-7xl">{message.emoji}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{message.text}</h1>
          <p className="text-slate-500 mb-6">セッション完了!</p>

          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-gradient mb-2">
              {score} / {totalQuestions}
            </div>
            <p className="text-slate-600">正答率 {percentage}%</p>
            {maxCombo >= 3 && (
              <p className="text-sm text-accent-500 mt-2">
                最大コンボ: {maxCombo}連続正解!
              </p>
            )}
          </div>

          {/* XP・ストリーク・デイリー目標 */}
          {sessionResult && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* XP獲得 */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-3">
                <span className="text-2xl">✨</span>
                <p className="text-xl font-bold text-purple-600">+{sessionResult.earnedXp}</p>
                <p className="text-xs text-purple-400">XP獲得</p>
              </div>

              {/* ストリーク */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-3">
                <span className="text-2xl">🔥</span>
                <p className="text-xl font-bold text-orange-600">{sessionResult.streak}</p>
                <p className="text-xs text-orange-400">日連続</p>
              </div>

              {/* デイリー目標 */}
              <div className={`rounded-xl p-3 ${
                sessionResult.dailyProgress.completed
                  ? "bg-gradient-to-br from-green-100 to-green-50"
                  : "bg-gradient-to-br from-blue-100 to-blue-50"
              }`}>
                <span className="text-2xl">{sessionResult.dailyProgress.completed ? "🏆" : "🎯"}</span>
                <p className={`text-xl font-bold ${
                  sessionResult.dailyProgress.completed ? "text-green-600" : "text-blue-600"
                }`}>
                  {sessionResult.dailyProgress.current}/{sessionResult.dailyProgress.goal}
                </p>
                <p className={`text-xs ${
                  sessionResult.dailyProgress.completed ? "text-green-400" : "text-blue-400"
                }`}>
                  {sessionResult.dailyProgress.completed ? "達成!" : "今日の目標"}
                </p>
              </div>
            </div>
          )}

          {/* 新しく獲得した実績 */}
          {newAchievements.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">新しい実績を獲得!</p>
              <div className="space-y-2">
                {newAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{achievement.name}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 出題された全単語一覧 */}
          {answeredWords.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">
                出題単語一覧（タップで詳細）
              </p>
              <div className="space-y-2">
                {answeredWords.map((word) => (
                  <Link
                    key={`${word.id}-${word.word}`}
                    href={`/word/${word.id}?from=quiz`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] group ${
                      word.correct
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 正誤アイコン */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          word.correct
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {word.correct ? "✓" : "✗"}
                      </div>
                      <SpeakButton text={word.word} size="sm" />
                      <div className="text-left">
                        <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {word.word}
                        </p>
                        <p className="text-xs text-gray-500">{word.meaning}</p>
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button fullWidth onClick={startNewSession}>
              もう1セット挑戦
            </Button>
            <Link href="/" className="block">
              <Button variant="secondary" fullWidth onClick={() => clearQuizResultState()}>
                ホームに戻る
              </Button>
            </Link>
          </div>
        </Card>

        {/* 実績解除ポップアップ */}
        {showingAchievement && (
          <AchievementUnlockPopup
            achievement={showingAchievement}
            onClose={handleAchievementClose}
          />
        )}
      </div>
    );
  }

  const questionDisplay = getQuestionDisplay(currentQuestion);
  const isFillBlank = currentQuestion.type === "fill-blank";

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        {/* Score & Combo Badge */}
        <div className="flex justify-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-card border border-primary-100">
            <span className="text-xl animate-float-bounce">✨</span>
            <span className="font-bold text-primary-500 text-lg">{score}</span>
            <span className="text-slate-400 text-sm">正解</span>
          </div>
          {combo >= 2 && (
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-lg animate-pop-in ${
              combo >= 5
                ? "bg-gradient-to-r from-orange-500 to-red-500 animate-glow"
                : combo >= 3
                  ? "bg-gradient-to-r from-accent-500 to-primary-500"
                  : "bg-gradient-to-r from-blue-400 to-primary-400"
            }`}>
              <span className="text-xl">{combo >= 5 ? "🔥" : "⚡"}</span>
              <span className="font-bold text-white text-lg">{combo}</span>
              <span className="text-white/90 text-sm font-medium">連続!</span>
            </div>
          )}
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          {/* カテゴリ表示（画像の代わり） */}
          {currentQuestion.word.category && (
            <div className={`w-full h-20 mb-4 rounded-xl bg-gradient-to-br ${getCategoryGradient(currentQuestion.word.category)} flex items-center justify-center border border-slate-100`}>
              <span className="text-4xl">{CATEGORY_EMOJIS[currentQuestion.word.category] || "📝"}</span>
            </div>
          )}

          <div className="text-center mb-8">
            <p className="text-sm text-slate-400 mb-2">{getQuestionPrompt(currentQuestion.type)}</p>
            <h2 className={`font-bold text-gradient ${isFillBlank ? "text-xl leading-relaxed" : "text-4xl"}`}>
              {questionDisplay}
            </h2>
            {currentQuestion.type === "en-to-ja" && (
              <div className="mt-3">
                <SpeakButton text={currentQuestion.word.word} size="md" />
              </div>
            )}
            {currentQuestion.type === "fill-blank" && currentQuestion.word.example && (
              <div className="mt-3">
                <SpeakButton text={currentQuestion.word.example} type="sentence" size="sm" />
              </div>
            )}
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice, index) => {
              let buttonClass = "choice-btn";

              if (selected !== null) {
                if (choice === currentQuestion.correctAnswer) {
                  buttonClass = "choice-btn choice-btn-correct";
                } else if (choice === selected) {
                  buttonClass = "choice-btn choice-btn-wrong";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(choice)}
                  disabled={selected !== null}
                  className={buttonClass}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Result & Next */}
        {selected !== null && (
          <div className={`text-center ${isCorrect ? "animate-pop-in" : "animate-shake"}`}>
            <Card className={`mb-4 ${
              isCorrect
                ? "bg-gradient-to-r from-success-50 to-green-50 border-success-300 correct-celebration"
                : "bg-gradient-to-r from-error-50 to-red-50 border-error-300 wrong-shake"
            } border-2`}>
              <div className="flex items-center justify-center gap-4">
                <span className={`text-5xl ${isCorrect ? "animate-bounce" : ""}`}>
                  {isCorrect ? (combo >= 3 ? "🔥" : "🎉") : "😢"}
                </span>
                <div>
                  <p className={`text-2xl font-bold ${isCorrect ? "text-success-600" : "text-error-600"}`}>
                    {isCorrect ? (
                      combo >= 5 ? `${combo}連続! すごい!` :
                      combo >= 3 ? `${combo}連続正解!` : "正解!"
                    ) : "不正解..."}
                  </p>
                  {isCorrect && combo >= 2 && (
                    <p className="text-sm text-accent-500 font-medium">+{10 + (combo > 2 ? 5 : 0)} XP</p>
                  )}
                  {!isCorrect && (
                    <div className="text-sm text-slate-600 mt-2">
                      <p className="font-medium">
                        正解: <span className="text-primary-600 font-bold">{currentQuestion.correctAnswer}</span>
                        {currentQuestion.type !== "en-to-ja" && (
                          <span className="text-slate-500 ml-1">({currentQuestion.word.meaning})</span>
                        )}
                      </p>
                      <div className="flex justify-center mt-1">
                        <SpeakButton text={currentQuestion.word.word} size="sm" />
                      </div>
                      {currentQuestion.word.example && (
                        <p className="mt-2 text-xs bg-white/70 rounded-lg p-2 border border-slate-200">
                          {currentQuestion.word.example}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Button onClick={handleNext} fullWidth className="animate-slide-up">
              {currentIndex + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
