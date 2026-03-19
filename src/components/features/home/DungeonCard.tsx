"use client";

import Link from "next/link";
import { storage } from "@/lib/storage";

export const DungeonCard = () => {
  const stats = storage.getDungeonStats();
  const hasPlayed = stats.attempts > 0;

  return (
    <Link href="/dungeon" className="block">
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 hover:from-indigo-800 hover:via-purple-800 hover:to-slate-800 transition-colors">
        <div className="flex items-center gap-3 p-3">
          <div className="w-11 h-11 bg-indigo-600/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl emoji-icon">⚔️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">WORD DUNGEON</p>
            {hasPlayed ? (
              <p className="text-xs text-indigo-300">
                最高 B{stats.maxFloor}F &nbsp;·&nbsp; 累計 {stats.kills} 体撃破 &nbsp;·&nbsp; {stats.correct} 問正解
              </p>
            ) : (
              <p className="text-xs text-indigo-300">単語で戦うローグライクRPG — 挑戦してみよう！</p>
            )}
          </div>
          <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
