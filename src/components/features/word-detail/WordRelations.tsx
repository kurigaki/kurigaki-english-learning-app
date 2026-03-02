"use client";

import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { findWordId } from "@/lib/word-lookup";
import type { RelatedWordEntry } from "@/types";

type WordRelationsProps = {
  relatedWordEntries?: RelatedWordEntry[];
  currentWord: string;
};

export const WordRelations = ({ relatedWordEntries, currentWord }: WordRelationsProps) => {
  if (!relatedWordEntries || relatedWordEntries.length === 0) {
    return null;
  }

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
        <span className="emoji-icon">🌐</span>
        <span>関連語</span>
      </h3>
      <ul className="space-y-1.5">
        {relatedWordEntries.map((entry) => {
          const wordId = findWordId(entry.word);
          const isCurrentWord = entry.word.toLowerCase() === currentWord.toLowerCase();
          return (
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
                {isCurrentWord ? (
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {entry.word}
                  </span>
                ) : wordId !== null ? (
                  <Link
                    href={`/word/${wordId}`}
                    className="font-medium text-primary-600 dark:text-primary-400 border-b border-dashed border-primary-600 dark:border-primary-400 hover:opacity-70 transition-opacity"
                  >
                    {entry.word}
                  </Link>
                ) : (
                  <span className="font-medium">{entry.word}</span>
                )}
                <span className="text-slate-400 dark:text-slate-500 mx-1">:</span>
                <span className="text-slate-500 dark:text-slate-400">{entry.meaning}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
