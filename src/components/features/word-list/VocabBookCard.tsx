"use client";

import Link from "next/link";

type VocabBookCardProps = {
  bookId: string;
  name: string;
  emoji: string;
  /** Tailwind gradient クラス（例: "from-blue-400 to-indigo-500"） */
  gradientClass: string;
  wordCount?: number;
  cardClassName?: string;
  bodyClassName?: string;
};

export default function VocabBookCard({
  bookId,
  name,
  emoji,
  gradientClass,
  wordCount,
  cardClassName,
  bodyClassName,
}: VocabBookCardProps) {
  const href = `/word-list/book/${encodeURIComponent(bookId)}`;
  const gradientSafelist =
    "from-blue-400 to-indigo-500 from-green-400 to-teal-500 from-purple-400 to-pink-500 " +
    "from-slate-400 to-slate-600 from-orange-600 to-amber-700 from-emerald-600 to-cyan-700 " +
    "from-fuchsia-600 to-rose-700 from-amber-600 to-orange-700 from-teal-600 to-emerald-700 " +
    "from-blue-600 to-cyan-700 from-purple-600 to-indigo-700 from-rose-600 to-pink-700 " +
    "from-orange-600 to-red-700 from-lime-600 to-green-700 from-indigo-600 to-violet-700 " +
    "from-rose-600 to-rose-700 from-orange-600 to-orange-700 from-amber-600 to-amber-700 " +
    "from-sky-600 to-sky-700 from-violet-600 to-violet-700";

  return (
    <Link
      href={href}
      className={`flex-shrink-0 w-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        cardClassName ?? "bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700"
      }`}
    >
      {/* Tailwind safelist for dynamic gradients */}
      <span className={`hidden ${gradientSafelist}`} />

      {/* 画像エリア */}
      <div className={`relative h-24 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <span className="text-4xl emoji-icon drop-shadow">{emoji}</span>
      </div>
      {/* テキストエリア */}
      <div className={`px-2 py-2 ${bodyClassName ?? "bg-slate-200 dark:bg-slate-800"}`}>
        <p className={`text-xs font-medium leading-snug line-clamp-2 ${
          bodyClassName ? "text-inherit" : "text-slate-800 dark:text-slate-200"
        }`}>
          {name}
        </p>
        {wordCount !== undefined && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{wordCount}語</p>
        )}
      </div>
    </Link>
  );
}
