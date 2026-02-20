"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SpeakButton } from "@/components/ui";
import { speakWord, isSpeechSynthesisSupported } from "@/lib/audio";
import { unifiedStorage } from "@/lib/unified-storage";
import {
  calculateSm2,
  answerQualityFromResult,
  getInitialSrsProgress,
} from "@/lib/srs";
import type { SrsProgress } from "@/lib/srs";
import type { MasteryLevel } from "@/types";

export type FlashcardWord = {
  id: number;
  word: string;
  meaning: string;
  mastery: MasteryLevel;
  example?: string;
  exampleJa?: string;
};

type Props = {
  words: FlashcardWord[];
  onExit: () => void;
};

export default function FlashcardView({ words, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [srsMap, setSrsMap] = useState<Map<number, SrsProgress>>(new Map());
  const [ratedIds, setRatedIds] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // SRS進捗の初期ロード
  useEffect(() => {
    unifiedStorage.getSrsProgressAll().then((all) => {
      setSrsMap(new Map(all.map((p) => [p.wordId, p])));
    });
  }, []);

  // カード切り替え時に自動読み上げ
  useEffect(() => {
    if (!isSpeechSynthesisSupported() || words.length === 0) return;
    const id = setTimeout(() => speakWord(words[currentIndex].word), 200);
    return () => clearTimeout(id);
  }, [currentIndex, words]);

  const navigate = (dir: "prev" | "next") => {
    if (slideDir) return;
    if (dir === "next" && currentIndex >= words.length - 1) return;
    if (dir === "prev" && currentIndex <= 0) return;
    setSlideDir(dir === "next" ? "left" : "right");
    setTimeout(() => {
      setCurrentIndex((i) => i + (dir === "next" ? 1 : -1));
      setIsFlipped(false);
      setSlideDir(null);
    }, 180);
  };

  const handleFlip = () => {
    if (slideDir) return;
    setIsFlipped((f) => !f);
  };

  const handleRate = async (correct: boolean) => {
    const word = words[currentIndex];
    const current = srsMap.get(word.id) ?? getInitialSrsProgress(word.id);
    const quality = answerQualityFromResult(correct);
    const newProgress = calculateSm2(current, quality);
    await unifiedStorage.saveSrsProgress(newProgress);
    setSrsMap((prev) => new Map(prev).set(word.id, newProgress));
    setRatedIds((prev) => new Set(prev).add(word.id));
    navigate("next");
  };

  const handleSkip = () => {
    navigate("next");
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy =
      e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dy) > Math.abs(dx)) return;
    const THRESHOLD = 50;
    if (dx < -THRESHOLD) navigate("next");
    else if (dx > THRESHOLD) navigate("prev");
  };

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          表示できる単語がありません
        </p>
        <button
          onClick={onExit}
          className="text-primary-500 hover:underline text-sm"
        >
          リストに戻る
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const isRated = ratedIds.has(currentWord.id);
  const progressPct = Math.round(((currentIndex + 1) / words.length) * 100);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === words.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー行 */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          リストに戻る
        </button>
        <div className="flex items-center gap-2">
          {isRated && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ 評価済み
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {currentIndex + 1} / {words.length}
          </span>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="flex-shrink-0 mb-3">
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* カード */}
      <div
        className={`flex-1 card-flip-container cursor-pointer select-none ${
          slideDir === "left"
            ? "animate-slide-out-left"
            : slideDir === "right"
              ? "animate-slide-out-right"
              : ""
        }`}
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "カードを戻す" : "カードをめくる"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleFlip();
        }}
      >
        <div
          className={`card-flip-inner w-full h-full min-h-[260px] ${isFlipped ? "is-flipped" : ""}`}
        >
          {/* 表面 */}
          <div className="card-flip-face bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-primary-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 p-6">
            <div className="flex items-center gap-2">
              <p
                className="text-2xl font-bold text-slate-800 dark:text-slate-100"
                data-testid="card-front-word"
              >
                {currentWord.word}
              </p>
              <SpeakButton text={currentWord.word} size="sm" />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              タップで意味を確認
            </p>
          </div>

          {/* 裏面 */}
          <div
            className="card-flip-face card-flip-back bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-primary-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center"
              data-testid="card-back-meaning"
            >
              {currentWord.meaning}
            </p>
            {currentWord.example && (
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {currentWord.example}
                </p>
                {currentWord.exampleJa && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {currentWord.exampleJa}
                  </p>
                )}
              </div>
            )}

            {/* SRS評価ボタン */}
            <div className="flex gap-2 mt-2 w-full">
              <button
                data-testid="btn-knew"
                onClick={() => handleRate(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
              >
                知ってた 👍
              </button>
              <button
                data-testid="btn-unknown"
                onClick={() => handleRate(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-800/40 transition-colors"
              >
                わからなかった 😓
              </button>
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                スキップ（評価なし）
              </button>
              <span className="text-slate-200 dark:text-slate-700">|</span>
              <Link
                href={`/word/${currentWord.id}?from=wordlist`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary-500 hover:underline"
              >
                詳細を見る →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 前/次ボタン */}
      <div className="flex-shrink-0 flex items-center justify-between mt-3">
        <button
          data-testid="btn-prev"
          onClick={() => navigate("prev")}
          disabled={isFirst}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          前へ
        </button>
        <button
          data-testid="btn-next"
          onClick={() => navigate("next")}
          disabled={isLast}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700"
        >
          次へ
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
