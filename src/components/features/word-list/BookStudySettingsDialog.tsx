"use client";

import { useState, useCallback } from "react";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { getDisplayedManualMastery } from "@/lib/manual-mastery";
import type { QuestionTypeRatios } from "@/types";
import {
  loadQuizSettings,
  saveQuizSettings,
  defaultTypeRatios,
} from "@/lib/quiz/settings";

// ソートオプション
export type SortBy =
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

const TYPE_ITEMS: { key: keyof QuestionTypeRatios; label: string }[] = [
  { key: "enToJa",    label: "A 英→日" },
  { key: "jaToEn",    label: "B 日→英" },
  { key: "listening", label: "C リスニング" },
  { key: "dictation", label: "D 書き取り" },
  { key: "speaking",  label: "E スピーキング" },
];

/**
 * 全単語IDリストをソート＆指定件数にスライスして返す（親から呼び出し可能）
 */
export function computeWordIds(
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

export type StudySettings = {
  countMode: "all" | number;
  sortBy: SortBy;
};

type Props = {
  /** 設定対象の全単語IDリスト */
  allWordIds: number[];
  /** 現在の設定（ページ側のstateから渡す） */
  currentSettings: StudySettings;
  /** 設定を変更して閉じるときに呼ばれる */
  onSave(settings: StudySettings): void;
  onClose(): void;
};

export default function BookStudySettingsDialog({
  allWordIds,
  currentSettings,
  onSave,
  onClose,
}: Props) {
  const total = allWordIds.length;
  const [countMode, setCountMode] = useState<"all" | number>(currentSettings.countMode);
  const [customCount, setCustomCount] = useState<number>(
    typeof currentSettings.countMode === "number"
      ? currentSettings.countMode
      : Math.min(10, total)
  );
  const [sortBy, setSortBy] = useState<SortBy>(currentSettings.sortBy);

  // typeRatios はクイズ設定と共用（localStorageから読み取り）
  const [typeRatios, setTypeRatios] = useState<QuestionTypeRatios>(
    () => loadQuizSettings().typeRatios
  );

  const handleClose = useCallback(() => {
    // typeRatiosをクイズ設定に保存（/quiz?bookWords=true で自動的に読み込まれる）
    saveQuizSettings({ ...loadQuizSettings(), typeRatios });
    onSave({ countMode, sortBy });
    onClose();
  }, [countMode, sortBy, typeRatios, onSave, onClose]);

  const effectiveCount = countMode === "all" ? total : Math.min(customCount, total);

  const typeTotal = (typeRatios.enToJa ?? 0) + (typeRatios.jaToEn ?? 0)
    + (typeRatios.listening ?? 0) + (typeRatios.dictation ?? 0) + (typeRatios.speaking ?? 0);
  const toPercent = (v: number) => typeTotal > 0 ? Math.round((v / typeTotal) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* バックドロップ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ダイアログ本体 */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg emoji-icon">⚙️</span>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">学習設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="閉じる（変更を破棄）"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1">
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

          {/* 問題タイプの出題比率 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
              問題タイプの出題比率
            </p>
            <div className="space-y-2">
              {TYPE_ITEMS.map(({ key, label }) => {
                const value = typeRatios[key] ?? 0;
                const pct = toPercent(value);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 w-24 flex-shrink-0">{label}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={value}
                      onChange={(e) =>
                        setTypeRatios((prev) => ({
                          ...prev,
                          [key]: parseInt(e.target.value),
                        }))
                      }
                      className="flex-1 h-1.5 accent-primary-500"
                    />
                    <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 w-8 text-right flex-shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {typeTotal === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ※ 全て0の場合は「英→日」のみで出題されます
                </p>
              )}
              <button
                onClick={() => setTypeRatios({ ...defaultTypeRatios })}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                デフォルトに戻す（A〜D 各25% / E 0%）
              </button>
            </div>
          </div>
        </div>

        {/* 完了ボタン */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-3">
            設定を反映: {effectiveCount}語を出題
          </p>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors text-sm shadow-sm"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
