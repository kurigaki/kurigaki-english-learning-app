"use client";

import { useState } from "react";
import type { BookDetailFilter } from "@/types";

type ManualMasteryLevel = "unlearned" | "weak" | "vague" | "almost" | "remembered";

const MASTERY_OPTIONS: { key: ManualMasteryLevel; label: string }[] = [
  { key: "unlearned", label: "未学習" },
  { key: "weak",      label: "苦手" },
  { key: "vague",     label: "うろ覚え" },
  { key: "almost",    label: "ほぼ覚えた" },
  { key: "remembered",label: "覚えた" },
];

type Props = {
  filter: BookDetailFilter;
  onApply: (filter: BookDetailFilter) => void;
  onClose: () => void;
};

export default function BookFilterSheet({ filter, onApply, onClose }: Props) {
  const [accMin, setAccMin] = useState(filter.accuracyRange[0]);
  const [accMax, setAccMax] = useState(filter.accuracyRange[1]);
  const [daysSinceEnabled, setDaysSinceEnabled] = useState(filter.daysSince !== null);
  const [daysSinceVal, setDaysSinceVal] = useState(filter.daysSince ?? 7);
  const [masteryLevels, setMasteryLevels] = useState<ManualMasteryLevel[]>(
    filter.masteryLevels as ManualMasteryLevel[]
  );

  const toggleMastery = (key: ManualMasteryLevel) => {
    setMasteryLevels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleReset = () => {
    setAccMin(0);
    setAccMax(100);
    setDaysSinceEnabled(false);
    setDaysSinceVal(7);
    setMasteryLevels([]);
  };

  const handleApply = () => {
    onApply({
      accuracyRange: [accMin, accMax],
      daysSince: daysSinceEnabled ? daysSinceVal : null,
      masteryLevels,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* バックドロップ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* パネル */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl px-4 pt-4 pb-6 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">絞り込み</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 正答率 */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">正答率の範囲</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium tabular-nums">
              {accMin}% 〜 {accMax}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">下限</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={accMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAccMin(Math.min(v, accMax));
                }}
                className="flex-1 accent-primary-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 w-8 tabular-nums">{accMin}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">上限</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={accMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAccMax(Math.max(v, accMin));
                }}
                className="flex-1 accent-primary-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 w-8 tabular-nums">{accMax}%</span>
            </div>
          </div>
        </div>

        {/* 最終遭遇日 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <input
              id="days-since-enabled"
              type="checkbox"
              checked={daysSinceEnabled}
              onChange={(e) => setDaysSinceEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary-500"
            />
            <label
              htmlFor="days-since-enabled"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              最終遭遇日で絞り込む
            </label>
          </div>
          {daysSinceEnabled && (
            <div className="flex items-center gap-2 ml-6">
              <input
                type="number"
                min={1}
                value={daysSinceVal}
                onChange={(e) => setDaysSinceVal(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">日以上前の単語</span>
            </div>
          )}
        </div>

        {/* 記憶度 */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            記憶度
            <span className="text-xs font-normal text-slate-400 ml-1">（選択なしで全て表示）</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {MASTERY_OPTIONS.map((opt) => {
              const isChecked = masteryLevels.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleMastery(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isChecked
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            リセット
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}
