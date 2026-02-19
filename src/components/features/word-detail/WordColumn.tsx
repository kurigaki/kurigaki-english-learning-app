"use client";

import { useState } from "react";
import { WordColumn as WordColumnType } from "@/types";

type WordColumnProps = {
  column: WordColumnType;
};

export const WordColumn = ({ column }: WordColumnProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // コンテンツが長い場合は折りたたむ
  const shouldTruncate = column.content.length > 150;
  const displayContent =
    shouldTruncate && !isExpanded
      ? column.content.slice(0, 150) + "..."
      : column.content;

  return (
    <div className="py-6">
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span className="emoji-icon">📚</span>
        <span>コラム</span>
      </h2>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100">
        {/* タイトル */}
        <h3 className="font-bold text-purple-800 mb-3">{column.title}</h3>

        {/* 本文 */}
        <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>

        {/* 続きを読むボタン */}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {isExpanded ? "閉じる" : "続きを読む →"}
          </button>
        )}
      </div>
    </div>
  );
};
