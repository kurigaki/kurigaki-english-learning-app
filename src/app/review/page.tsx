"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words as allWords, categoryLabels } from "@/data/words/compat";
import { SpeakButton, Card, ProgressBar } from "@/components/ui";
import type { Word } from "@/data/words/compat";
import type { SrsStatus, SrsProgress } from "@/lib/srs";
import {
  getInitialSrsProgress,
  calculateSm2,
  answerQualityFromResult,
} from "@/lib/srs";
import { generateReviewChoices, formatNextReviewDate } from "@/lib/review-quiz";
import { speakWord, isSpeechSynthesisSupported } from "@/lib/audio";
import { isWeakWord } from "@/types";
import type { ReviewMode } from "@/types";

// ===== 型定義 =====

type ReviewPhase = "list" | "quiz" | "result";

type ReviewWord = Word & {
  accuracy?: number;
  attempts?: number;
  srsStatus?: SrsStatus;
};

type AnsweredResult = {
  word: ReviewWord;
  correct: boolean;
  updatedProgress: SrsProgress;
};

// ===== 定数 =====

const srsStatusConfig: Record<SrsStatus, { label: string; color: string }> = {
  new:      { label: "新規",   color: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700" },
  learning: { label: "学習中", color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40" },
  review:   { label: "復習",   color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40" },
  mastered: { label: "習得済", color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40" },
};

// ===== メインコンポーネント =====

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ReviewMode) ?? "srs";
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // ----- リストフェーズの状態 -----
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ----- フェーズ管理 -----
  const [phase, setPhase] = useState<ReviewPhase>("list");

  // ----- クイズフェーズの状態 -----
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answeredResults, setAnsweredResults] = useState<AnsweredResult[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const hasAutoPlayedRef = useRef<Set<number>>(new Set());

  // ===== 単語の読み込み =====

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    if (mode === "srs") {
      const dueWords = await unifiedStorage.getDueWords();
      const dueMap = new Map(dueWords.map((p) => [p.wordId, p]));
      const result: ReviewWord[] = allWords
        .filter((w) => dueMap.has(w.id))
        .map((w) => ({ ...w, srsStatus: dueMap.get(w.id)!.status }));
      setReviewWords(result);
    } else {
      const statsMap = await unifiedStorage.getWordStats();
      const result: ReviewWord[] = [];
      statsMap.forEach((stats, wordId) => {
        if (isWeakWord(stats.accuracy, stats.totalAttempts)) {
          const word = allWords.find((w) => w.id === wordId);
          if (word) {
            result.push({ ...word, accuracy: stats.accuracy, attempts: stats.totalAttempts });
          }
        }
      });
      result.sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100));
      setReviewWords(result);
    }
    setIsLoading(false);
  }, [mode]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadWords();
    }
  }, [isAuthLoading, isAuthenticated, loadWords]);

  // ===== クイズ開始 =====

  const startQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setAnsweredResults([]);
    hasAutoPlayedRef.current = new Set();
    questionStartTimeRef.current = Date.now();
    // 選択肢は useEffect（phase/currentIndex の変化を監視）が生成するため、ここでは設定しない
    setPhase("quiz");
  }, []);

  // ===== 問題切り替え時の処理 =====

  const currentWord = reviewWords[currentIndex];

  // 問題切り替え時に選択肢を更新・タイマーリセット
  useEffect(() => {
    if (phase !== "quiz" || !currentWord) return;
    setChoices(generateReviewChoices(currentWord, allWords));
    questionStartTimeRef.current = Date.now();
  }, [phase, currentIndex, currentWord]);

  // 問題切り替え時の自動読み上げ
  useEffect(() => {
    if (phase !== "quiz" || !currentWord) return;
    if (selected !== null) return;
    if (hasAutoPlayedRef.current.has(currentIndex)) return;
    if (!isSpeechSynthesisSupported()) return;

    hasAutoPlayedRef.current.add(currentIndex);

    const timeoutId = setTimeout(() => {
      speakWord(currentWord.word);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [phase, currentWord, currentIndex, selected]);

  // ===== 回答処理 =====

  const handleSelect = useCallback(async (choice: string) => {
    if (selected !== null || !currentWord) return;

    setSelected(choice);
    const correct = choice === currentWord.meaning;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    // 学習記録を保存（バックグラウンド）
    unifiedStorage.addRecord({
      wordId: currentWord.id,
      word: currentWord.word,
      meaning: currentWord.meaning,
      questionType: "en-to-ja",
      correct,
    }).catch((err) => console.error("[Review] addRecord failed:", err));

    // SRS 進捗を更新
    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    const quality = answerQualityFromResult(correct, responseTimeMs);
    let updatedProgress: SrsProgress;
    try {
      const existing = await unifiedStorage.getSrsProgress(currentWord.id);
      const current = existing ?? getInitialSrsProgress(currentWord.id);
      updatedProgress = calculateSm2(current, quality);
      await unifiedStorage.saveSrsProgress(updatedProgress);
    } catch (err) {
      console.error("[Review] saveSrsProgress failed:", err);
      // エラー時はデフォルト進捗を計算（UIは止めない）
      updatedProgress = calculateSm2(getInitialSrsProgress(currentWord.id), quality);
    }

    setAnsweredResults((prev) => [
      ...prev,
      { word: currentWord, correct, updatedProgress },
    ]);
  }, [selected, currentWord]);

  // ===== 次の問題へ =====

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= reviewWords.length) {
      setPhase("result");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  }, [currentIndex, reviewWords.length]);

  // Enter キーで次へ
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || selected === null || phase !== "quiz") return;
      e.preventDefault();
      handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, phase, handleNext]);

  // ===== 再挑戦 =====

  const handleRetry = useCallback(() => {
    // 結果から不正解だった単語だけ再セット
    const wrongWords = answeredResults
      .filter((r) => !r.correct)
      .map((r) => r.word);
    if (wrongWords.length === 0) {
      setPhase("list");
      return;
    }
    setReviewWords(wrongWords);
    setCurrentIndex(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setAnsweredResults([]);
    hasAutoPlayedRef.current = new Set();
    questionStartTimeRef.current = Date.now();
    // 選択肢は useEffect が reviewWords/currentIndex の変化を検知して生成する
    setPhase("quiz");
  }, [answeredResults]);

  // ===== 共通ヘッダー情報 =====

  const isSrs = mode === "srs";
  const title = isSrs ? "今日の復習" : "苦手単語の復習";
  const icon = isSrs ? "🧠" : "🔄";
  const emptyMessage = isSrs
    ? "今日復習すべき単語はありません"
    : "苦手な単語はありません";

  // ===== レンダリング =====

  // ---- リストフェーズ ----
  if (phase === "list") {
    return (
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-2xl w-full mx-auto flex flex-col h-full">

          {/* ヘッダー */}
          <div className="flex-shrink-0 flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl emoji-icon">{icon}</span>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            </div>
            {!isLoading && reviewWords.length > 0 && (
              <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                {reviewWords.length}語
              </span>
            )}
          </div>

          {/* 説明文 */}
          <p className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400 mb-2">
            {isSrs
              ? "記憶を定着させるタイミングです。クイズ形式で復習し、SRS間隔を更新しましょう。"
              : "正答率が低い単語です。クイズ形式で確認しましょう。"}
          </p>

          {/* 単語リスト */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reviewWords.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-4xl mb-3 emoji-icon">{isSrs ? "✅" : "🎉"}</p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{emptyMessage}</p>
                <Link href="/" className="mt-4 inline-block text-sm text-primary-500 hover:underline">
                  ホームに戻る
                </Link>
              </Card>
            ) : (
              <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
                {reviewWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-3xl last:rounded-b-3xl"
                  >
                    <SpeakButton text={word.word} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {word.word}
                        </p>
                        {isSrs && word.srsStatus && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${srsStatusConfig[word.srsStatus].color}`}>
                            {srsStatusConfig[word.srsStatus].label}
                          </span>
                        )}
                        {!isSrs && word.accuracy !== undefined && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40">
                            正答率 {Math.round(word.accuracy)}%
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {categoryLabels[word.category] ?? word.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </Card>
            )}
          </div>

          {/* クイズ開始ボタン */}
          {!isLoading && reviewWords.length > 0 && (
            <div className="flex-shrink-0 pt-3">
              <button
                onClick={startQuiz}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-button hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="emoji-icon">{icon}</span>
                クイズを始める（{reviewWords.length}語）
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- クイズフェーズ ----
  if (phase === "quiz" && currentWord) {
    const progress = currentIndex + 1;
    const total = reviewWords.length;

    return (
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-2xl w-full mx-auto flex flex-col h-full gap-3">

          {/* ヘッダー：戻るボタン + タイトル + 進捗 */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => setPhase("list")}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label="リストに戻る"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl emoji-icon">{icon}</span>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            </div>
            <span className="ml-auto text-sm font-medium text-slate-500 dark:text-slate-400">
              {progress} / {total}
            </span>
          </div>

          {/* プログレスバー */}
          <div className="flex-shrink-0">
            <ProgressBar current={progress} total={total} showLabel={false} size="sm" />
          </div>

          {/* 問題カード */}
          <Card className="flex-shrink-0 text-center py-6 px-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">この単語の意味は？</p>
            <div className="flex items-center justify-center gap-3">
              <SpeakButton text={currentWord.word} size="md" />
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {currentWord.word}
              </p>
            </div>
            {currentWord.srsStatus && isSrs && (
              <span className={`mt-3 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${srsStatusConfig[currentWord.srsStatus].color}`}>
                {srsStatusConfig[currentWord.srsStatus].label}
              </span>
            )}
          </Card>

          {/* 選択肢 */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-2">
            {choices.map((choice) => {
              let btnClass =
                "py-3 px-3 rounded-2xl text-sm font-medium border-2 transition-all duration-150 text-left leading-tight ";

              if (selected === null) {
                btnClass +=
                  "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-95";
              } else if (choice === currentWord.meaning) {
                // 正解
                btnClass +=
                  "border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300";
              } else if (choice === selected) {
                // 選択した誤答
                btnClass +=
                  "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300";
              } else {
                // 非選択の誤答
                btnClass +=
                  "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-50";
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={selected !== null}
                  className={btnClass}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* フィードバック + 次へ */}
          {selected !== null && (
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className={`flex-1 flex items-center gap-2 py-2.5 px-3 rounded-xl ${isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <span className="text-lg emoji-icon">{isCorrect ? "✅" : "❌"}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                    {isCorrect ? "正解！" : "不正解"}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      正解: {currentWord.meaning}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="flex-shrink-0 py-2.5 px-5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                {currentIndex + 1 >= reviewWords.length ? "結果を見る" : "次へ →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- 結果フェーズ ----
  if (phase === "result") {
    const total = answeredResults.length;
    const isPerfect = score === total;
    const wrongCount = total - score;

    return (
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-2xl w-full mx-auto flex flex-col h-full gap-3">

          {/* ヘッダー */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl emoji-icon">📊</span>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">復習結果</h1>
            </div>
          </div>

          {/* スコアカード */}
          <Card className="flex-shrink-0 text-center py-5">
            <p className="text-5xl emoji-icon mb-1">{isPerfect ? "🎉" : score >= total / 2 ? "👍" : "😢"}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {score} <span className="text-slate-400 dark:text-slate-500 text-xl">/ {total}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isPerfect ? "全問正解！素晴らしい！" : `正解 ${score}語 / 不正解 ${wrongCount}語`}
            </p>
          </Card>

          {/* 単語ごとの結果リスト */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
              {answeredResults.map(({ word, correct, updatedProgress }) => (
                <Link
                  key={word.id}
                  href={`/word/${word.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-3xl last:rounded-b-3xl"
                >
                  {/* 正誤アイコン */}
                  <span className="text-lg emoji-icon flex-shrink-0">
                    {correct ? "✅" : "❌"}
                  </span>

                  {/* 単語情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`font-bold text-sm ${correct ? "text-slate-800 dark:text-slate-100" : "text-red-700 dark:text-red-300"} group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}>
                        {word.word}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${srsStatusConfig[updatedProgress.status].color}`}>
                        {srsStatusConfig[updatedProgress.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
                  </div>

                  {/* 次回復習日 */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">次回</p>
                    <p className={`text-xs font-medium ${correct ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                      {formatNextReviewDate(updatedProgress.nextReviewDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </Card>
          </div>

          {/* アクションボタン */}
          <div className="flex-shrink-0 flex gap-2 pt-1">
            {wrongCount > 0 && (
              <button
                onClick={handleRetry}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm flex items-center justify-center gap-1.5"
              >
                <span className="emoji-icon">🔄</span>
                不正解を再挑戦（{wrongCount}語）
              </button>
            )}
            <Link
              href="/"
              className={`${wrongCount > 0 ? "flex-shrink-0" : "flex-1"} py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-sm flex items-center justify-center gap-1.5`}
            >
              <span className="emoji-icon">🏠</span>
              ホーム
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // フォールバック（通常到達しない）
  return null;
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-2xl w-full mx-auto">
          <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
