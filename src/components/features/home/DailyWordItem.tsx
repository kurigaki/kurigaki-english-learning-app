import Link from "next/link";
import { SpeakButton } from "@/components/ui";
import { categoryLabels, type Word } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { MANUAL_MASTERY_OPTIONS_ORDERED } from "@/lib/manual-mastery";

type DailyWordItemProps = {
  word: Word;
  isBookmarked: boolean;
  stats?: WordStats;
  displayedMastery: ManualMasteryLevel;
  onToggleBookmark: (wordId: number, e: React.MouseEvent) => void;
  onStartFlashcard: (wordId: number, e: React.MouseEvent) => void;
  onMasteryChange: (wordId: number, mastery: ManualMasteryLevel) => void;
};

export const DailyWordItem = ({
  word,
  isBookmarked,
  stats,
  displayedMastery,
  onToggleBookmark,
  onStartFlashcard,
  onMasteryChange,
}: DailyWordItemProps) => {
  return (
    <div
      className="flex items-center gap-2 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group first:rounded-t-3xl last:rounded-b-3xl"
    >
      <button
        onClick={(e) => onToggleBookmark(word.id, e)}
        className={`p-1.5 rounded-lg transition-colors ${
          isBookmarked
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-slate-300 hover:text-yellow-400"
        }`}
        title={isBookmarked ? "ブックマーク解除" : "ブックマークに追加"}
      >
        <svg
          className="w-4 h-4"
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>
      <button
        onClick={(e) => onStartFlashcard(word.id, e)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex-shrink-0"
        title="この単語からフラッシュカード開始"
      >
        <span className="text-xs emoji-icon">🃏</span>
      </button>
      <Link href={`/word/${word.id}`} className="flex items-center gap-3 flex-1 min-w-0 group/link">
        <SpeakButton text={word.word} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-800 dark:text-slate-100 group-hover/link:text-primary-600 dark:group-hover/link:text-primary-400 transition-colors">
              {word.word}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {categoryLabels[word.category] ?? word.category}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</p>
        </div>
        <svg
          className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover/link:text-primary-400 group-hover/link:translate-x-0.5 transition-all flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <div className="w-[170px] flex-shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <span className="text-[10px] px-1 py-0.5 rounded bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            正答率 {stats?.accuracy !== undefined && stats?.accuracy !== null
              ? `${stats.accuracy}%`
              : "-"}
          </span>
          <select
            value={displayedMastery}
            onChange={(e) => onMasteryChange(word.id, e.target.value as ManualMasteryLevel)}
            className="text-[10px] px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {MANUAL_MASTERY_OPTIONS_ORDERED
              .filter((opt) => (stats?.totalAttempts ?? 0) === 0 || opt.key !== "unlearned")
              .map((opt) => (
                <option key={`${word.id}-${opt.key}`} value={opt.key}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};