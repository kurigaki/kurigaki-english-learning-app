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
  const hasEntries = !!relatedWordEntries && relatedWordEntries.length > 0;

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="emoji-icon">🌐</span>
          <span>関連語</span>
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            hasEntries
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {hasEntries ? "登録済み" : "準備中"}
        </span>
      </div>
      {hasEntries ? (
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
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-sm italic">
          この単語の関連語は今後追加予定です
        </p>
      )}
    </div>
  );
};
