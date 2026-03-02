"use client";

import { SpeakButton } from "@/components/ui/SpeakButton";
import type { RelatedWordEntry } from "@/types";

type WordRelationsProps = {
  synonyms?: string[];
  relatedWordEntries?: RelatedWordEntry[];
};

export const WordRelations = ({ synonyms, relatedWordEntries }: WordRelationsProps) => {
  const hasSynonyms = synonyms && synonyms.length > 0;
  const hasRelatedEntries = relatedWordEntries && relatedWordEntries.length > 0;

  if (!hasSynonyms && !hasRelatedEntries) {
    return null;
  }

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      {/* 関連語（品詞・意味付きリスト） */}
      {hasRelatedEntries && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="emoji-icon">🌐</span>
            <span>関連語</span>
          </h3>
          <ul className="space-y-1.5">
            {relatedWordEntries?.map((entry) => (
              <li
                key={`${entry.isAntonym ? "antonym" : "related"}-${entry.word}`}
                className="flex items-center gap-2"
              >
                <SpeakButton text={entry.word} size="sm" className="flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {entry.isAntonym && (
                    <span className="text-orange-500 font-medium mr-0.5">↔</span>
                  )}
                  <span className="text-slate-400 dark:text-slate-500 text-xs mr-0.5">
                    ({entry.partOfSpeech})
                  </span>
                  <span className="font-medium">{entry.word}</span>
                  <span className="text-slate-400 dark:text-slate-500 mx-1">:</span>
                  <span className="text-slate-500 dark:text-slate-400">{entry.meaning}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 類義語 */}
      {hasSynonyms && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="emoji-icon">🔗</span>
            <span>類義語</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {synonyms?.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <span>{word}</span>
                <SpeakButton text={word} size="sm" className="!w-5 !h-5" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
