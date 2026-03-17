import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import { words } from "@/data/words/compat";
import { isWeakWord } from "@/types";
import { pickDailyWords } from "@/lib/daily-words";
import type { Word } from "@/data/words/compat";
import type { WordStats, ManualMasteryLevel } from "@/lib/storage";
import { getDisplayedManualMastery as getDisplayedManualMasteryUtil } from "@/lib/manual-mastery";
import { saveQuickFlashcardSession } from "@/lib/flashcard-session";
import { saveBookWordIds, getQuizProgressState } from "@/lib/quiz-session";

export type UserProgress = {
  level: number;
  streak: number;
  xpProgress: { current: number; required: number; percentage: number };
  dailyProgress: { current: number; goal: number; percentage: number; completed: boolean };
};

export const useHomeData = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [weakWordCount, setWeakWordCount] = useState(0);
  const [srsReviewCount, setSrsReviewCount] = useState(0);
  const [studiedWordCount, setStudiedWordCount] = useState(0);
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [wordStatsMap, setWordStatsMap] = useState<Map<number, WordStats>>(new Map());
  const [manualMemoryById, setManualMemoryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [savedProgressInfo, setSavedProgressInfo] = useState<{ answeredCount: number; total: number } | null>(null);

  const loadData = useCallback(async () => {
    const userData = await unifiedStorage.getUserData();
    setUserProgress({
      level: userData.level,
      streak: userData.streak,
      xpProgress: unifiedStorage.getXpProgress(userData),
      dailyProgress: unifiedStorage.getDailyProgress(userData),
    });

    const [statsMap, manualMap, bookmarkedIds] = await Promise.all([
      unifiedStorage.getWordStats(),
      unifiedStorage.getManualMasteryMap(),
      unifiedStorage.getBookmarkedWordIds(),
    ]);
    setWordStatsMap(statsMap);
    setManualMemoryById(manualMap);
    setBookmarkedWordIds(bookmarkedIds);
    setStudiedWordCount(statsMap.size);
    let weakCount = 0;
    statsMap.forEach((stats, wordId) => {
      if (isWeakWord(stats.accuracy, stats.totalAttempts) && words.some((w) => w.id === wordId)) {
        weakCount++;
      }
    });
    setWeakWordCount(weakCount);

    const dueWords = await unifiedStorage.getDailyReviewBatch();
    setSrsReviewCount(dueWords.length);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setDailyWords(pickDailyWords(words, today, 10));
    const progress = getQuizProgressState();
    if (progress) {
      setSavedProgressInfo({ answeredCount: progress.currentIndex + 1, total: progress.questions.length });
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      unifiedStorage.cleanupOrphanedData();
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  const getDisplayedMastery = useCallback((wordId: number): ManualMasteryLevel => (
    getDisplayedManualMasteryUtil(wordId, wordStatsMap, manualMemoryById)
  ), [manualMemoryById, wordStatsMap]);

  const handleManualMasteryChange = useCallback(async (wordId: number, mastery: ManualMasteryLevel) => {
    setManualMemoryById((prev) => ({ ...prev, [wordId]: mastery }));
    await unifiedStorage.setManualMastery(wordId, mastery);
  }, []);

  const toggleBookmark = useCallback(async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = await unifiedStorage.toggleBookmark(wordId);
    setBookmarkedWordIds((prev) => (
      next ? (prev.includes(wordId) ? prev : [...prev, wordId]) : prev.filter((id) => id !== wordId)
    ));
  }, []);

  const startFlashcard = useCallback((wordIds: number[], startIndex = 0, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (wordIds.length === 0) return;
    saveQuickFlashcardSession(wordIds, startIndex);
    router.push("/flashcard");
  }, [router]);

  const startDailyQuiz = useCallback((wordIds: number[]) => {
    if (wordIds.length === 0) return;
    saveBookWordIds(wordIds);
    router.push("/quiz?bookWords=true");
  }, [router]);

  return {
    isMounted,
    userProgress,
    weakWordCount,
    srsReviewCount,
    studiedWordCount,
    dailyWords,
    wordStatsMap,
    bookmarkedWordIds,
    savedProgressInfo,
    getDisplayedMastery,
    handleManualMasteryChange,
    toggleBookmark,
    startFlashcard,
    startDailyQuiz,
  };
};
