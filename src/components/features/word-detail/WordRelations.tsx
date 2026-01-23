"use client";

import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { words } from "@/data/words";

type WordRelationsProps = {
  synonyms?: string[];
  antonyms?: string[];
};

export const WordRelations = ({ synonyms, antonyms }: WordRelationsProps) => {
  const hasSynonyms = synonyms && synonyms.length > 0;
  const hasAntonyms = antonyms && antonyms.length > 0;

  if (!hasSynonyms && !hasAntonyms) {
    return null;
  }

  // 単語IDを検索（存在すればリンク可能）
  const findWordId = (word: string): number | null => {
    const found = words.find((w) => w.word.toLowerCase() === word.toLowerCase());
    return found ? found.id : null;
  };

  const renderWordChip = (word: string, type: "synonym" | "antonym") => {
    const wordId = findWordId(word);
    const baseClasses = `
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
      transition-all duration-200
    `;
    const colorClasses =
      type === "synonym"
        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
        : "bg-orange-50 text-orange-700 hover:bg-orange-100";

    const content = (
      <>
        <span>{word}</span>
        <SpeakButton text={word} size="sm" className="!w-5 !h-5" />
      </>
    );

    if (wordId) {
      return (
        <Link
          key={word}
          href={`/word/${wordId}`}
          className={`${baseClasses} ${colorClasses} cursor-pointer`}
        >
          {content}
        </Link>
      );
    }

    return (
      <span key={word} className={`${baseClasses} ${colorClasses}`}>
        {content}
      </span>
    );
  };

  return (
    <div className="py-6 border-b border-gray-100">
      {/* 類義語 */}
      {hasSynonyms && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
            <span>🔗</span> 類義語
          </h3>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((word) => renderWordChip(word, "synonym"))}
          </div>
        </div>
      )}

      {/* 対義語 */}
      {hasAntonyms && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
            <span>↔️</span> 対義語
          </h3>
          <div className="flex flex-wrap gap-2">
            {antonyms.map((word) => renderWordChip(word, "antonym"))}
          </div>
        </div>
      )}
    </div>
  );
};
