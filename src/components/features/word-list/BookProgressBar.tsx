"use client";

import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { getDisplayedManualMastery } from "@/lib/manual-mastery";

type BookWord = { id: number };

type ProgressCounts = {
  remembered: number;
  almost: number;
  vague: number;
  weak: number;
  unlearned: number;
};

function computeProgress(
  words: BookWord[],
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): ProgressCounts {
  const counts: ProgressCounts = { remembered: 0, almost: 0, vague: 0, weak: 0, unlearned: 0 };
  for (const w of words) {
    const level = getDisplayedManualMastery(w.id, statsMap, manualMap);
    counts[level]++;
  }
  return counts;
}

type Props = {
  words: BookWord[];
  statsMap: Map<number, WordStats>;
  manualMap: Record<number, ManualMasteryLevel>;
};

const SEGMENTS: { key: keyof ProgressCounts; color: string; label: string }[] = [
  { key: "remembered", color: "bg-emerald-500", label: "習得" },
  { key: "almost",     color: "bg-blue-400",    label: "ほぼ" },
  { key: "vague",      color: "bg-amber-400",   label: "うろ覚え" },
  { key: "weak",       color: "bg-red-400",     label: "苦手" },
  { key: "unlearned",  color: "bg-slate-300 dark:bg-slate-600", label: "未学習" },
];

export default function BookProgressBar({ words, statsMap, manualMap }: Props) {
  const total = words.length;
  if (total === 0) return null;

  const progress = computeProgress(words, statsMap, manualMap);
  const masteredCount = progress.remembered;

  return (
    <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
      {/* セグメント棒グラフ */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px bg-slate-200 dark:bg-slate-700">
        {SEGMENTS.map(({ key, color }) => {
          const count = progress[key];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={key}
              className={`${color} flex-shrink-0`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {SEGMENTS.map(({ key, color, label }) => {
            const count = progress[key];
            if (count === 0) return null;
            return (
              <span key={key} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
                {label} {count}
              </span>
            );
          })}
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2">
          {masteredCount}/{total}語習得
        </span>
      </div>
    </div>
  );
}
