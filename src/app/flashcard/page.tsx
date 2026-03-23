"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { words as allWordList } from "@/data/words";
import {
  getFlashcardSession,
  saveQuickFlashcardSession,
  clearFlashcardSession,
} from "@/lib/flashcard-session";
import { unifiedStorage } from "@/lib/unified-storage";
import { getMasteryLevel } from "@/types";
import type { FlashcardWord } from "@/types";
import type { WordStats } from "@/lib/storage";
import FlashcardView from "@/components/features/word-list/FlashcardView";

export default function FlashcardPage() {
  const router = useRouter();
  const [wordIds, setWordIds] = useState<number[] | null>(null);
  const [initialIndex, setInitialIndex] = useState(0);
  const [statsMap, setStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const session = getFlashcardSession();
    if (!session || !session.flashcardWordIds || session.flashcardWordIds.length === 0) {
      router.replace("/word-list/all");
      return;
    }
    setWordIds(session.flashcardWordIds);
    setInitialIndex(session.currentIndex ?? 0);

    // 単語ごとの統計（mastery計算に必要）を非同期で読み込み
    unifiedStorage.getWordStats().then(setStatsMap);
  }, [router]);

  const flashcardWords = useMemo((): FlashcardWord[] => {
    if (!wordIds) return [];
    const wordById = new Map(allWordList.map((w) => [w.id, w]));
    const result: FlashcardWord[] = [];
    for (const id of wordIds) {
      const w = wordById.get(id);
      if (!w) continue;
      const stats = statsMap.get(id);
      const accuracy = stats?.accuracy ?? null;
      const attempts = stats?.totalAttempts ?? 0;
      result.push({
        id: w.id,
        word: w.word,
        meaning: w.meaning,
        mastery: getMasteryLevel(accuracy, attempts),
        example: w.example,
        exampleJa: w.exampleJa,
      });
    }
    return result;
  }, [wordIds, statsMap]);

  if (!isMounted || !wordIds) return null;

  return (
    <div className="main-content flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 px-4 py-3">
      <FlashcardView
        words={flashcardWords}
        initialIndex={initialIndex}
        onExit={() => {
          clearFlashcardSession();
          router.back();
        }}
        onDetailView={(index) => {
          if (!wordIds) return;
          // セッションを更新してからword detailへ遷移（FlashcardViewが<Link>で遷移する）
          saveQuickFlashcardSession(wordIds, index);
        }}
      />
      </div>
    </div>
  );
}
