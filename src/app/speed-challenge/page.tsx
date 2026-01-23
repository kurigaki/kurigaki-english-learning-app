"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { words, Word } from "@/data/words";
import { storage } from "@/lib/storage";
import { Card, Button, SpeakButton } from "@/components/ui";
import { Question, QuestionType, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import { AchievementUnlockPopup } from "@/components/features/achievements/AchievementUnlockPopup";
import { speakWord, isSpeechSynthesisSupported } from "@/lib/audio";

const TIME_LIMIT = 30; // 30秒

type QuestionTypeWeight = { type: QuestionType; weight: number };
const QUESTION_TYPE_WEIGHTS: QuestionTypeWeight[] = [
  { type: "en-to-ja", weight: 60 },
  { type: "ja-to-en", weight: 40 },
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

function generateQuestion(word: Word, allWords: Word[]): Question {
  const type = selectQuestionType();
  switch (type) {
    case "en-to-ja":
      return {
        word: { id: word.id, word: word.word, meaning: word.meaning },
        type: "en-to-ja",
        choices: generateChoicesForEnToJa(word, allWords),
        correctAnswer: word.meaning,
      };
    case "ja-to-en":
      return {
        word: { id: word.id, word: word.word, meaning: word.meaning },
        type: "ja-to-en",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };
    default:
      return {
        word: { id: word.id, word: word.word, meaning: word.meaning },
        type: "en-to-ja",
        choices: generateChoicesForEnToJa(word, allWords),
        correctAnswer: word.meaning,
      };
  }
}

function getNextQuestion(usedWordIds: Set<number>): Question {
  const availableWords = words.filter((w) => !usedWordIds.has(w.id));
  const wordsToChooseFrom = availableWords.length > 0 ? availableWords : words;
  const randomWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
  return generateQuestion(randomWord, words);
}

type GameState = "ready" | "playing" | "finished";

export default function SpeedChallengePage() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<Set<number>>(new Set());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; show: boolean } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const totalQuestionsRef = useRef(0);

  // Refを同期
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    totalQuestionsRef.current = totalQuestions;
  }, [totalQuestions]);

  useEffect(() => {
    const hs = storage.getSpeedChallengeHighScore();
    setHighScore(hs);
  }, []);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    const finalTotal = totalQuestionsRef.current;

    setGameState("finished");

    // 結果を保存
    storage.addSpeedChallengeResult({
      score: finalScore,
      correctCount: finalScore,
      totalQuestions: finalTotal,
      timeLimit: TIME_LIMIT,
    });

    // ハイスコアチェック
    const prevHighScore = storage.getSpeedChallengeHighScore();
    if (finalScore > prevHighScore) {
      setIsNewHighScore(true);
      setHighScore(finalScore);
    }

    // 実績チェック
    const newAchievementIds = storage.checkAndUnlockAchievements({
      speedScore: finalScore,
      isSpeedChallenge: true,
    });

    const newAchievements = newAchievementIds
      .map((id) => getAchievementById(id))
      .filter((a): a is Achievement => a !== undefined);

    if (newAchievements.length > 0) {
      setPendingAchievements(newAchievements);
      setShowingAchievement(newAchievements[0]);
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState("playing");
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalQuestions(0);
    setUsedWordIds(new Set());
    setIsNewHighScore(false);
    setFeedback(null);
    scoreRef.current = 0;
    totalQuestionsRef.current = 0;
    const firstQuestion = getNextQuestion(new Set());
    setQuestion(firstQuestion);
    setUsedWordIds(new Set([firstQuestion.word.id]));
  }, []);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      endGame();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft, endGame]);

  // 問題出題時の自動読み上げ（英→日タイプの場合のみ）
  useEffect(() => {
    if (gameState !== "playing" || !question || !isSpeechSynthesisSupported()) return;

    // 英→日の場合のみ自動再生
    if (question.type === "en-to-ja") {
      // スピードチャレンジは短い遅延で即座に再生
      const timeoutId = setTimeout(() => {
        speakWord(question.word.word);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [question, gameState]);

  const handleSelect = (choice: string) => {
    if (!question || gameState !== "playing") return;

    const correct = choice === question.correctAnswer;
    setTotalQuestions((t) => t + 1);

    // フィードバック表示
    setFeedback({ correct, show: true });
    setTimeout(() => setFeedback(null), 300);

    if (correct) {
      const newCombo = combo + 1;
      setScore((s) => s + 1 + (newCombo >= 5 ? 1 : 0)); // コンボボーナス
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
    } else {
      setCombo(0);
    }

    // 次の問題
    const newQuestion = getNextQuestion(usedWordIds);
    setQuestion(newQuestion);
    setUsedWordIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(newQuestion.word.id);
      return newSet;
    });
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

  // 準備画面
  if (gameState === "ready") {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <span className="text-7xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            スピードチャレンジ
          </h1>
          <p className="text-gray-500 mb-6">
            {TIME_LIMIT}秒間で何問正解できるか挑戦！
          </p>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">ハイスコア</p>
            <p className="text-4xl font-bold text-orange-600">{highScore}</p>
          </div>

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">1️⃣</span>
              <p className="text-gray-600">正解するとスコア+1</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">2️⃣</span>
              <p className="text-gray-600">5連続正解でボーナス+1</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">3️⃣</span>
              <p className="text-gray-600">不正解でもどんどん次へ！</p>
            </div>
          </div>

          <Button fullWidth onClick={startGame} className="text-lg py-4">
            スタート！
          </Button>
        </Card>
      </div>
    );
  }

  // プレイ中
  if (gameState === "playing" && question) {
    const isEnToJa = question.type === "en-to-ja";
    const timePercentage = (timeLeft / TIME_LIMIT) * 100;
    const isLowTime = timeLeft <= 10;

    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-4">
        <div className="max-w-md mx-auto">
          {/* タイマー & スコア */}
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isLowTime ? "bg-red-100 animate-pulse" : "bg-gray-100"
            }`}>
              <span className="text-xl">⏱️</span>
              <span className={`text-2xl font-bold ${isLowTime ? "text-red-600" : "text-gray-700"}`}>
                {timeLeft}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="text-2xl font-bold">{score}</span>
            </div>
          </div>

          {/* タイムバー */}
          <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isLowTime ? "bg-red-500" : "bg-gradient-to-r from-primary-400 to-accent-400"
              }`}
              style={{ width: `${timePercentage}%` }}
            />
          </div>

          {/* コンボ */}
          {combo >= 2 && (
            <div className="text-center mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold ${
                combo >= 5 ? "bg-gradient-to-r from-orange-500 to-red-500 animate-bounce" : "bg-gradient-to-r from-blue-500 to-primary-500"
              }`}>
                {combo >= 5 ? "🔥" : "⚡"} {combo}連続正解！
              </span>
            </div>
          )}

          {/* 問題カード */}
          <Card className={`mb-4 transition-all ${
            feedback?.show
              ? feedback.correct
                ? "ring-4 ring-green-400 bg-green-50"
                : "ring-4 ring-red-400 bg-red-50"
              : ""
          }`}>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400 mb-2">
                {isEnToJa ? "この単語の意味は?" : "この意味の英単語は?"}
              </p>
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-4xl font-bold text-gradient">
                  {isEnToJa ? question.word.word : question.word.meaning}
                </h2>
                {isEnToJa && <SpeakButton text={question.word.word} size="md" />}
              </div>
            </div>

            {/* 選択肢 */}
            <div className="grid grid-cols-2 gap-3">
              {question.choices.map((choice, index) => (
                <button
                  key={`${question.word.id}-${index}`}
                  onClick={() => handleSelect(choice)}
                  className="p-4 text-left bg-white border-2 border-gray-200 rounded-xl font-medium hover:border-primary-400 hover:bg-primary-50 active:scale-95 transition-all"
                >
                  {choice}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 結果画面
  if (gameState === "finished") {
    const getMessage = () => {
      if (score >= 20) return { emoji: "🏆", text: "神速！" };
      if (score >= 15) return { emoji: "🔥", text: "素晴らしい！" };
      if (score >= 10) return { emoji: "⚡", text: "いい調子！" };
      if (score >= 5) return { emoji: "👍", text: "ナイスファイト！" };
      return { emoji: "💪", text: "次はもっと！" };
    };
    const message = getMessage();
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          {isNewHighScore && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-300 animate-bounce">
              <span className="text-4xl">🎉</span>
              <p className="text-xl font-bold text-yellow-700 mt-2">
                新記録達成！
              </p>
            </div>
          )}

          <div className="mb-4">
            <span className="text-7xl">{message.emoji}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{message.text}</h1>
          <p className="text-gray-500 mb-6">タイムアップ！</p>

          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-6">
            <div className="text-6xl font-bold text-gradient mb-2">{score}</div>
            <p className="text-gray-600">スコア</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-700">{totalQuestions}</p>
              <p className="text-xs text-gray-400">回答数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-700">{accuracy}%</p>
              <p className="text-xs text-gray-400">正答率</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-700">{maxCombo}</p>
              <p className="text-xs text-gray-400">最大コンボ</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button fullWidth onClick={startGame}>
              もう一度挑戦
            </Button>
            <Link href="/" className="block">
              <Button variant="secondary" fullWidth>
                ホームに戻る
              </Button>
            </Link>
          </div>
        </Card>

        {showingAchievement && (
          <AchievementUnlockPopup
            achievement={showingAchievement}
            onClose={handleAchievementClose}
          />
        )}
      </div>
    );
  }

  return null;
}
