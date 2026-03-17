import { useState } from "react";
import { Card } from "@/components/ui";
import { DailyWordItem } from "./DailyWordItem";
import type { Word } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";

const INITIAL_SHOW_COUNT = 3;

type DailyWordListProps = {
  words: Word[];
  wordStatsMap: Map<number, WordStats>;
  bookmarkedWordIds: number[];
  getDisplayedMastery: (wordId: number) => ManualMasteryLevel;
  onToggleBookmark: (wordId: number, e: React.MouseEvent) => void;
  onStartFlashcard: (wordIds: number[], startIndex: number, e?: React.MouseEvent) => void;
  onMasteryChange: (wordId: number, mastery: ManualMasteryLevel) => void;
  onStartQuiz: (wordIds: number[]) => void;
};

export const DailyWordList = ({
  words,
  wordStatsMap,
  bookmarkedWordIds,
  getDisplayedMastery,
  onToggleBookmark,
  onStartFlashcard,
  onMasteryChange,
  onStartQuiz,
}: DailyWordListProps) => {
  const [showAll, setShowAll] = useState(false);

  if (words.length === 0) return null;

  const allWordIds = words.map((w) => w.id);
  const visibleWords = showAll ? words : words.slice(0, INITIAL_SHOW_COUNT);
  const hiddenCount = words.length - INITIAL_SHOW_COUNT;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base emoji-icon">📅</span>
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">今日の単語</h2>
      </div>
      <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
        {visibleWords.map((word, index) => (
          <DailyWordItem
            key={word.id}
            word={word}
            allWordIds={allWordIds}
            startIndex={index}
            isBookmarked={bookmarkedWordIds.includes(word.id)}
            stats={wordStatsMap.get(word.id)}
            displayedMastery={getDisplayedMastery(word.id)}
            onToggleBookmark={onToggleBookmark}
            onStartFlashcard={onStartFlashcard}
            onMasteryChange={onMasteryChange}
          />
        ))}

        {/* もっと表示ボタン */}
        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-b-3xl"
          >
            もっと表示（あと {hiddenCount} 語）
          </button>
        )}

        {/* クイズ開始ボタン（全表示時 or 単語が3語以下のとき） */}
        {(showAll || words.length <= INITIAL_SHOW_COUNT) && (
          <button
            onClick={() => onStartQuiz(allWordIds)}
            className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all rounded-b-3xl flex items-center justify-center gap-1.5"
          >
            <span className="emoji-icon">📝</span>
            <span>今日の {words.length} 語でクイズを始める</span>
          </button>
        )}
      </Card>
    </div>
  );
};
