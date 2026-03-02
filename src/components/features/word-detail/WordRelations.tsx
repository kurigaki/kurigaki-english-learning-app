"use client";

import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { words } from "@/data/words/compat";

type WordRelationsProps = {
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
};

export const WordRelations = ({ synonyms, antonyms, relatedWords }: WordRelationsProps) => {
  const hasSynonyms = synonyms && synonyms.length > 0;
  const hasAntonyms = antonyms && antonyms.length > 0;
  const hasRelatedWords = relatedWords && relatedWords.length > 0;

  if (!hasSynonyms && !hasAntonyms && !hasRelatedWords) {
    return null;
  }

  // 単語IDを検索（存在すればリンク可能）
  const findWordId = (word: string): number | null => {
    const found = words.find((w) => w.word.toLowerCase() === word.toLowerCase());
    return found ? found.id : null;
  };

  const renderWordChip = (word: string, type: "synonym" | "antonym" | "related") => {
    const wordId = findWordId(word);
    const baseClasses = `
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
      transition-all duration-200
    `;
    const colorClasses =
      type === "synonym"
        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        : type === "antonym"
        ? "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
        : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50";

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
    <div className="py-6 border-b border-slate-100 dark:border-slate-700">
      {/* 関連語 */}
      {hasRelatedWords && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="emoji-icon">🌐</span>
            <span>関連語</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedWords.map((word) => renderWordChip(word, "related"))}
          </div>
        </div>
      )}

      {/* 類義語 */}
      {hasSynonyms && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="emoji-icon">🔗</span>
            <span>類義語</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {synonyms.map((word) => renderWordChip(word, "synonym"))}
          </div>
        </div>
      )}

      {/* 対義語 */}
      {hasAntonyms && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="emoji-icon">↔️</span>
            <span>対義語</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {antonyms.map((word) => renderWordChip(word, "antonym"))}
          </div>
        </div>
      )}
    </div>
  );
};
