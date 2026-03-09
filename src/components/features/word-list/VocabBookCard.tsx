"use client";

import Link from "next/link";

type VocabBookCardProps = {
  bookId: string;
  name: string;
  emoji: string;
  /** Tailwind gradient クラス（例: "from-blue-400 to-indigo-500"） */
  gradientClass: string;
  wordCount?: number;
};

export default function VocabBookCard({
  bookId,
  name,
  emoji,
  gradientClass,
  wordCount,
}: VocabBookCardProps) {
  const href = `/word-list/book/${encodeURIComponent(bookId)}`;

  return (
    <Link
      href={href}
      className="flex-shrink-0 w-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
    >
      {/* 画像エリア */}
      <div className={`relative h-24 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <span className="text-4xl emoji-icon drop-shadow">{emoji}</span>
      </div>
      {/* テキストエリア */}
      <div className="px-2 py-2">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
          {name}
        </p>
        {wordCount !== undefined && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{wordCount}語</p>
        )}
      </div>
    </Link>
  );
}
