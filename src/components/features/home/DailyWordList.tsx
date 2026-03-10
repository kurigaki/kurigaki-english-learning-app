import { Card } from "@/components/ui";
import { DailyWordItem } from "./DailyWordItem";
import type { Word } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";

type DailyWordListProps = {
  words: Word[];
  wordStatsMap: Map<number, WordStats>;
  bookmarkedWordIds: number[];
  getDisplayedMastery: (wordId: number) => ManualMasteryLevel;
  onToggleBookmark: (wordId: number, e: React.MouseEvent) => void;
  onStartFlashcard: (wordIds: number[], startIndex: number, e?: React.MouseEvent) => void;
  onMasteryChange: (wordId: number, mastery: ManualMasteryLevel) => void;
};

export const DailyWordList = ({
  words,
  wordStatsMap,
  bookmarkedWordIds,
  getDisplayedMastery,
  onToggleBookmark,
  onStartFlashcard,
  onMasteryChange,
}: DailyWordListProps) => {
  if (words.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base emoji-icon">📅</span>
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">今日の単語</h2>
      </div>
      <Card className="divide-y divide-slate-100 dark:divide-slate-700 !p-0">
        {words.map((word, index) => (
          <DailyWordItem
            key={word.id}
            word={word}
            allWordIds={words.map((w) => w.id)}
            startIndex={index}
            isBookmarked={bookmarkedWordIds.includes(word.id)}
            stats={wordStatsMap.get(word.id)}
            displayedMastery={getDisplayedMastery(word.id)}
            onToggleBookmark={onToggleBookmark}
            onStartFlashcard={onStartFlashcard}
            onMasteryChange={onMasteryChange}
          />
        ))}
      </Card>
    </div>
  );
};
