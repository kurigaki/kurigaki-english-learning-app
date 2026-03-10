import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { words } from "@/data/words/compat";
import { allWords } from "@/data/words";
import { getWordExtension } from "@/data/word-extensions";
import { unifiedStorage } from "@/lib/unified-storage";
import { getWordNavState } from "@/lib/word-nav-state";
import { getDisplayedManualMastery } from "@/lib/manual-mastery";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import type { LearningRecord } from "@/types";

export const useWordDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordId = Number(params.id);

  const fromPage = searchParams.get("from");

  const [navState] = useState(() => getWordNavState());
  const currentNavIndex = navState ? navState.wordIds.indexOf(wordId) : -1;
  const prevNavWordId =
    navState && currentNavIndex > 0 ? navState.wordIds[currentNavIndex - 1] : null;
  const nextNavWordId =
    navState && currentNavIndex >= 0 && currentNavIndex < navState.wordIds.length - 1
      ? navState.wordIds[currentNavIndex + 1]
      : null;

  const [wordStats, setWordStats] = useState<WordStats | null>(null);
  const [manualMastery, setManualMastery] = useState<ManualMasteryLevel | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [quizHistory, setQuizHistory] = useState<LearningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const word = words.find((w) => w.id === wordId);
  const internalWord = allWords.find((w) => w.id === wordId);
  const wordExt = internalWord ? getWordExtension(internalWord) : undefined;

  useEffect(() => {
    if (!word) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      const [statsMap, manual, bookmarked, allRecords] = await Promise.all([
        unifiedStorage.getWordStats(),
        unifiedStorage.getManualMastery(word.id),
        unifiedStorage.isWordBookmarked(word.id),
        unifiedStorage.getRecords(),
      ]);
      setWordStats(statsMap.get(word.id) ?? null);
      setManualMastery(manual);
      setIsBookmarked(bookmarked);
      setQuizHistory(allRecords.filter((r) => r.wordId === word.id));
      setIsLoading(false);
    };
    loadData();
  }, [wordId, word]);

  const handleToggleBookmark = useCallback(async () => {
    if (!word) return;
    const newState = await unifiedStorage.toggleBookmark(word.id);
    setIsBookmarked(newState);
  }, [word]);

  const handleManualMasteryChange = useCallback(async (value: ManualMasteryLevel) => {
    if (!word) return;
    setManualMastery(value);
    await unifiedStorage.setManualMastery(word.id, value);
  }, [word]);

  const currentMastery = getDisplayedManualMastery(
    wordId,
    wordStats ? new Map([[wordId, wordStats]]) : new Map(),
    manualMastery ? { [wordId]: manualMastery } : {}
  );

  const handleBack = useCallback(() => {
    switch (fromPage) {
      case "quiz":
        router.push("/quiz");
        break;
      case "speed":
        router.push("/speed-challenge");
        break;
      case "history":
        router.push("/history");
        break;
      case "weak":
        router.push("/weak-words");
        break;
      case "wordlist":
        router.push("/word-list");
        break;
      case "bookmarks":
        router.push("/word-list/all");
        break;
      default:
        router.back();
    }
  }, [fromPage, router]);

  const getBackLabel = useCallback(() => {
    switch (fromPage) {
      case "quiz": return "リザルトに戻る";
      case "speed": return "リザルトに戻る";
      case "history": return "学習履歴に戻る";
      case "weak": return "苦手単語に戻る";
      case "wordlist": return "単語帳に戻る";
      case "bookmarks": return "ブックマークに戻る";
      default: return "戻る";
    }
  }, [fromPage]);

  return {
    word,
    wordExt,
    isLoading,
    wordStats,
    isBookmarked,
    quizHistory,
    currentMastery,
    handleToggleBookmark,
    handleManualMasteryChange,
    // Navigation
    fromPage,
    navState,
    currentNavIndex,
    prevNavWordId,
    nextNavWordId,
    handleBack,
    getBackLabel,
  };
};
