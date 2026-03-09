"use client";

import { useState, useCallback } from "react";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { getDisplayedManualMastery } from "@/lib/manual-mastery";

// ソートオプション
type SortBy =
  | "random"
  | "accuracy-asc"
  | "accuracy-desc"
  | "mastery-asc"
  | "mastery-desc";

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: "random", label: "ランダム" },
  { key: "accuracy-asc", label: "正答率が低い順" },
  { key: "accuracy-desc", label: "正答率が高い順" },
  { key: "mastery-asc", label: "記憶度が低い順" },
  { key: "mastery-desc", label: "記憶度が高い順" },
];

// 記憶度スコア（ソート計算用）
const MASTERY_SCORE: Record<ManualMasteryLevel, number> = {
  unlearned: 0,
  weak: 1,
  vague: 2,
  almost: 3,
  remembered: 4,
};

/**
 * 全単語IDリストをソート＆指定件数にスライスして返す
 */
function computeWordIds(
  allWordIds: number[],
  countMode: "all" | number,
  sortBy: SortBy,
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): number[] {
  let sorted = [...allWordIds];

  if (sortBy === "random") {
    // Fisher-Yates シャッフル
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
  } else if (sortBy === "accuracy-asc" || sortBy === "accuracy-desc") {
    sorted.sort((a, b) => {
      // 未学習（統計なし）は -1 として最低値扱い → 「低い順」では先頭に来る
      const accA = statsMap.get(a)?.accuracy ?? -1;
      const accB = statsMap.get(b)?.accuracy ?? -1;
      return sortBy === "accuracy-asc" ? accA - accB : accB - accA;
    });
  } else if (sortBy === "mastery-asc" || sortBy === "mastery-desc") {
    sorted.sort((a, b) => {
      const ma = MASTERY_SCORE[getDisplayedManualMastery(a, statsMap, manualMap)];
      const mb = MASTERY_SCORE[getDisplayedManualMastery(b, statsMap, manualMap)];
      return sortBy === "mastery-asc" ? ma - mb : mb - ma;
    });
  }

  if (countMode !== "all") {
    sorted = sorted.slice(0, countMode);
  }

  return sorted;
}

type Props = {
  /** 設定対象の全単語IDリスト */
  allWordIds: number[];
  statsMap: Map<number, WordStats>;
  manualMap: Record<number, ManualMasteryLevel>;
  onStartFlashcard(wordIds: number[]): void;
  onStartQuiz(wordIds: number[]): void;
  onClose(): void;
};

export default function BookStudySettingsDialog({
  allWordIds,
  statsMap,
  manualMap,
  onStartFlashcard,
  onStartQuiz,
  onClose,
}: Props) {
  const total = allWordIds.length;
  const [countMode, setCountMode] = useState<"all" | number>("all");
  const [customCount, setCustomCount] = useState(Math.min(10, total));
  const [sortBy, setSortBy] = useState<SortBy>("random");

  const getWordIds = useCallback(() => {
    return computeWordIds(allWordIds, countMode, sortBy, statsMap, manualMap);
  }, [allWordIds, countMode, sortBy, statsMap, manualMap]);

  const handleStartFlashcard = useCallback(() => {
    onStartFlashcard(getWordIds());
  }, [getWordIds, onStartFlashcard]);

  const handleStartQuiz = useCallback(() => {
    onStartQuiz(getWordIds());
  }, [getWordIds, onStartQuiz]);

  const effectiveCount = countMode === "all" ? total : Math.min(customCount, total);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* バックドロップ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ダイアログ本体 */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-lg emoji-icon">⚙️</span>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">出題設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* 出題数 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
              出題数
            </p>
            <div className="space-y-2.5">
              {/* 全単語 */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="countMode"
                  checked={countMode === "all"}
                  onChange={() => {
                    setCountMode("all");
                    // UIと内部状態を一致させるため並び順をリセット
                    setSortBy("random");
                  }}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  全単語 <span className="text-slate-400 dark:text-slate-500">（{total}語）</span>
                </span>
              </label>

              {/* 任意 */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="countMode"
                  checked={countMode !== "all"}
                  onChange={() => setCountMode(customCount)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  任意の単語数
                </span>
              </label>

              {/* スライダー（任意選択時のみ有効） */}
              {countMode !== "all" && (
                <div className="pl-7">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={total}
                      value={customCount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCustomCount(v);
                        setCountMode(v);
                      }}
                      className="flex-1 accent-primary-500"
                    />
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400 w-14 text-right">
                      {customCount}語
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 並び順 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
              並び順
              {countMode === "all" && (
                <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                  （任意の単語数を選択すると有効）
                </span>
              )}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              disabled={countMode === "all"}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 開始ボタン */}
        <div className="px-5 pb-5 pt-1 space-y-2.5">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-1">
            {effectiveCount}語を出題します
          </p>
          <button
            onClick={handleStartFlashcard}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <span className="emoji-icon">🃏</span>
            フラッシュカードを始める
          </button>
          <button
            onClick={handleStartQuiz}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors text-sm shadow-sm"
          >
            <span className="emoji-icon">📝</span>
            クイズを始める
          </button>
        </div>
      </div>
    </div>
  );
}
