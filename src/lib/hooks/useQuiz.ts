import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { words, Word } from "@/data/words/compat";
import { unifiedStorage } from "@/lib/unified-storage";
import { Question, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import {
  saveQuizResultState,
  getQuizResultState,
  clearQuizResultState,
  AnsweredWord,
  SessionResult,
} from "@/lib/quiz-session";
import { getInitialSrsProgress, calculateSm2, answerQualityFromResult } from "@/lib/srs";
import {
  QuizSettings,
  defaultQuizSettings,
  loadQuizSettings,
  saveQuizSettings,
} from "@/lib/quiz/settings";
import {
  generateSessionQuestions,
  filterWordsBySettings,
  generateQuestion,
  selectFillBlankExample,
} from "@/lib/quiz/generator";
import { speakWord, speakSentence, isSpeechSynthesisSupported } from "@/lib/audio";

const QUESTIONS_PER_SESSION = 10;
type QuizPhase = "setup" | "quiz" | "result";

export const useQuiz = () => {
  const searchParams = useSearchParams();
  const reviewWordId = searchParams.get("wordId");
  const weakOnly = searchParams.get("weakOnly");
  const srsReview = searchParams.get("srsReview");
  const bookmarksOnly = searchParams.get("bookmarksOnly");

  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(() => loadQuizSettings());

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [dictationInputs, setDictationInputs] = useState<string[]>([]);
  const dictationInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleSelectRef = useRef<(choice: string) => void>(() => {});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wordStatsById, setWordStatsById] = useState<Map<number, WordStats>>(new Map());
  const [manualMasteryById, setManualMasteryById] = useState<Record<number, ManualMasteryLevel>>({});
  const [answeredWords, setAnsweredWords] = useState<AnsweredWord[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [showPerfectScore, setShowPerfectScore] = useState(false);
  const [isRestoredFromSession, setIsRestoredFromSession] = useState(false);

  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [weakWordIds, setWeakWordIds] = useState<number[]>([]);
  const [studiedWordIds, setStudiedWordIds] = useState<number[]>([]);
  const [srsWordIds, setSrsWordIds] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const hasAutoPlayedRef = useRef<Set<number>>(new Set());

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookmarks, weaks, studied, dueWords] = await Promise.all([
          unifiedStorage.getBookmarkedWordIds(),
          unifiedStorage.getWeakWords(70),
          unifiedStorage.getStudiedWordIds(),
          unifiedStorage.getDailyReviewBatch(),
        ]);
        setBookmarkedIds(bookmarks);
        setWeakWordIds(weaks);
        setStudiedWordIds(studied);
        setSrsWordIds(dueWords.map((p) => p.wordId));
      } catch (error) {
        console.error("[Quiz] Failed to load initial data:", error);
      }
      setDataLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    saveQuizSettings(quizSettings);
  }, [quizSettings]);

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= questions.length) {
      let sessionResult: SessionResult | null = null;
      let newAchievements: Achievement[] = [];

      try {
        const previousUserData = await unifiedStorage.getUserData();
        const previousLevel = previousUserData.level;
        const previousStreak = previousUserData.streak;
        const updatedUserData = await unifiedStorage.recordStudySession(score, maxCombo);
        const dailyProgress = unifiedStorage.getDailyProgress(updatedUserData);

        const earnedXp = (score * 10) + (maxCombo * 5);

        const records = await unifiedStorage.getRecords();
        const totalQuestions = records.length;
        const masteredWords = await unifiedStorage.getMasteredWordCount();
        const newAchievementIds = await unifiedStorage.checkAndUnlockAchievements({
          totalQuestions,
          maxCombo,
          streak: updatedUserData.streak,
          masteredWords,
          level: updatedUserData.level,
        });

        newAchievements = newAchievementIds
          .map((id) => getAchievementById(id))
          .filter((a): a is Achievement => a !== undefined);

        sessionResult = {
          earnedXp,
          newLevel: updatedUserData.level,
          previousLevel,
          streak: updatedUserData.streak,
          previousStreak,
          dailyProgress: {
            current: dailyProgress.current,
            goal: dailyProgress.goal,
            completed: dailyProgress.completed,
          },
          newAchievementIds,
        };
      } catch (error) {
        console.error("[Quiz] Error during session completion:", error);
        sessionResult = {
          earnedXp: score * 10 + maxCombo * 5,
          newLevel: 1,
          previousLevel: 1,
          streak: 1,
          previousStreak: 0,
          dailyProgress: { current: score, goal: 10, completed: score >= 10 },
          newAchievementIds: [],
        };
      }

      if (newAchievements.length > 0) {
        setPendingAchievements(newAchievements);
        setShowingAchievement(newAchievements[0]);
      }

      const finishedElapsedSeconds = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
      setElapsedSeconds(finishedElapsedSeconds);
      setSessionResult(sessionResult);
      setIsFinished(true);
      setPhase("result");

      if (score === questions.length) {
        setShowPerfectScore(true);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowTranslation(false);
      setDictationInputs([]);
      dictationInputRefs.current = [];
    }
  }, [currentIndex, questions.length, score, maxCombo]);

  const processAnswer = useCallback((answerText: string, correct: boolean) => {
    if (!currentQuestion) return;

    setSelected(answerText);
    setIsCorrect(correct);

    setAnsweredWords((prev) => [
      ...prev,
      { id: currentQuestion.word.id, word: currentQuestion.word.word, meaning: currentQuestion.word.meaning, correct },
    ]);

    if (correct) {
      setScore((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
    } else {
      setCombo(0);
    }

    unifiedStorage.addRecord({
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      meaning: currentQuestion.word.meaning,
      questionType: currentQuestion.type,
      correct,
    }).catch((error) => console.error("[Quiz] Failed to add record:", error));

    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    const quality = answerQualityFromResult(correct, responseTimeMs);
    (async () => {
      try {
        const existing = await unifiedStorage.getSrsProgress(currentQuestion.word.id);
        const current = existing ?? getInitialSrsProgress(currentQuestion.word.id);
        const updated = calculateSm2(current, quality);
        await unifiedStorage.saveSrsProgress(updated);
      } catch (error) {
        console.error("[Quiz] Failed to update SRS progress:", error);
      }
    })();
  }, [currentQuestion]);

  const handleSelect = useCallback((choice: string) => {
    if (selected !== null || !currentQuestion) return;
    const correct = choice === currentQuestion.correctAnswer;
    if (currentQuestion.type === "ja-to-en" && isSpeechSynthesisSupported()) {
      speakWord(choice);
    }
    processAnswer(choice, correct);
  }, [selected, currentQuestion, processAnswer]);

  handleSelectRef.current = handleSelect;

  const handleDictationSubmit = useCallback(() => {
    if (selected !== null || !currentQuestion) return;
    const answerWords = currentQuestion.correctAnswer.split(/\s+/);
    const allFilled = answerWords.every((_, i) => (dictationInputs[i] ?? "").trim() !== "");
    if (!allFilled) return;

    const correct = answerWords.every(
      (w, i) => (dictationInputs[i] ?? "").trim().toLowerCase() === w.toLowerCase()
    );
    const answerText = dictationInputs.map((s) => s.trim()).join(" ");
    processAnswer(answerText, correct);
  }, [selected, currentQuestion, dictationInputs, processAnswer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || isFinished || e.repeat) return;

      if (e.key === "Enter") {
        if (selected === null) return;
        e.preventDefault();
        handleNext();
        return;
      }

      if (selected !== null || !currentQuestion || currentQuestion.type === "dictation") return;

      const keyIndex = ["a", "b", "c", "d"].indexOf(e.key.toLowerCase());
      if (keyIndex !== -1 && currentQuestion.choices[keyIndex] !== undefined) {
        e.preventDefault();
        handleSelectRef.current(currentQuestion.choices[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, isFinished, handleNext, questions, currentIndex, currentQuestion]);

  const startNewSession = useCallback((
    settings: QuizSettings = defaultQuizSettings,
    options?: { priorityWordId?: number; weakOnlyMode?: boolean; srsReviewMode?: boolean }
  ) => {
    clearQuizResultState();

    let targetWords: Word[];
    const ratios = settings.typeRatios ?? defaultQuizSettings.typeRatios;

    if (options?.srsReviewMode && srsWordIds.length > 0) {
      targetWords = words.filter((w) => srsWordIds.includes(w.id));
    } else if (options?.weakOnlyMode && weakWordIds.length > 0) {
      targetWords = words.filter((w) => weakWordIds.includes(w.id));
    } else {
      targetWords = filterWordsBySettings(words, settings, bookmarkedIds);
    }

    if (ratios.enToJa === 0 && ratios.jaToEn === 0) {
      const sentenceCapable = targetWords.filter((w) => selectFillBlankExample(w) !== null);
      if (sentenceCapable.length > 0) targetWords = sentenceCapable;
    }

    const questionCount = Math.min(QUESTIONS_PER_SESSION, targetWords.length);
    if (questionCount === 0) {
      setPhase("setup");
      return;
    }

    let newQuestions: Question[];
    if (options?.priorityWordId) {
      const priorityWord = words.find((w) => w.id === options.priorityWordId);
      if (priorityWord) {
        const priorityQuestion = generateQuestion(priorityWord, words, ratios);
        const remainingTargetWords = targetWords.filter((w) => w.id !== options.priorityWordId);
        const remainingQuestions = generateSessionQuestions(remainingTargetWords, words, questionCount - 1, weakWordIds, studiedWordIds, ratios);
        newQuestions = [priorityQuestion, ...remainingQuestions];
      } else {
        newQuestions = generateSessionQuestions(targetWords, words, questionCount, weakWordIds, studiedWordIds, ratios);
      }
    } else {
      newQuestions = generateSessionQuestions(targetWords, words, questionCount, weakWordIds, studiedWordIds, ratios);
    }

    setQuestions(newQuestions);
    setQuizSettings(settings);
    setPhase("quiz");
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setSelected(null);
    setIsCorrect(null);
    setDictationInputs([]);
    dictationInputRefs.current = [];
    setSessionResult(null);
    setAnsweredWords([]);
    setElapsedSeconds(0);
    setIsRestoredFromSession(false);
    setShowTranslation(false);
    setShowPerfectScore(false);
    sessionStartTimeRef.current = Date.now();
    hasAutoPlayedRef.current = new Set();
  }, [bookmarkedIds, weakWordIds, studiedWordIds, srsWordIds]);

  const startRetrySessionWithWordIds = useCallback((wordIds: number[]) => {
    const ratios = quizSettings.typeRatios ?? defaultQuizSettings.typeRatios;
    const retryWords = wordIds.map((id) => words.find((w) => w.id === id)).filter((w): w is Word => !!w);
    if (retryWords.length === 0) return;

    clearQuizResultState();
    const retryQuestions = retryWords.map((w) => generateQuestion(w, words, ratios));
    setQuestions(retryQuestions);
    setPhase("quiz");
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setSelected(null);
    setIsCorrect(null);
    setDictationInputs([]);
    dictationInputRefs.current = [];
    setSessionResult(null);
    setAnsweredWords([]);
    setElapsedSeconds(0);
    setIsRestoredFromSession(false);
    setShowTranslation(false);
    setShowPerfectScore(false);
    sessionStartTimeRef.current = Date.now();
    hasAutoPlayedRef.current = new Set();
  }, [quizSettings.typeRatios]);

  useEffect(() => {
    if (!dataLoaded) return;
    const savedState = getQuizResultState();
    if (savedState) {
      setScore(savedState.score);
      setMaxCombo(savedState.maxCombo);
      setAnsweredWords(savedState.answeredWords);
      setElapsedSeconds(savedState.elapsedSeconds ?? 0);
      setSessionResult(savedState.sessionResult);
      setIsFinished(true);
      setIsRestoredFromSession(true);
      setPhase("result");
      return;
    }

    if (reviewWordId) {
      const wordIdNum = parseInt(reviewWordId, 10);
      if (!isNaN(wordIdNum) && words.some((w) => w.id === wordIdNum)) {
        startNewSession(defaultQuizSettings, { priorityWordId: wordIdNum });
        return;
      }
    }
    if (srsReview === "true" && srsWordIds.length > 0) {
      startNewSession(defaultQuizSettings, { srsReviewMode: true });
      return;
    }
    if (weakOnly === "true" && weakWordIds.length > 0) {
      startNewSession(defaultQuizSettings, { weakOnlyMode: true });
      return;
    }
    if (bookmarksOnly === "true") {
      const validBookmarked = bookmarkedIds.filter((id) => words.some((w) => w.id === id));
      if (validBookmarked.length > 0) {
        startNewSession({ ...defaultQuizSettings, includeBookmarksOnly: true });
        return;
      }
    }
    setPhase("setup");
  }, [dataLoaded, reviewWordId, weakOnly, srsReview, bookmarksOnly, weakWordIds, srsWordIds, bookmarkedIds, startNewSession]);

  useEffect(() => {
    if (isFinished && !isRestoredFromSession && answeredWords.length > 0) {
      saveQuizResultState({ score, totalQuestions: answeredWords.length, maxCombo, elapsedSeconds, answeredWords, sessionResult });
    }
  }, [isFinished, isRestoredFromSession, score, maxCombo, elapsedSeconds, answeredWords, sessionResult]);

  useEffect(() => {
    if ((phase !== "result" && !isFinished) || answeredWords.length === 0) return;
    let active = true;
    (async () => {
      const [statsMap, manualMap] = await Promise.all([unifiedStorage.getWordStats(), unifiedStorage.getManualMasteryMap()]);
      if (!active) return;
      const reduced = new Map<number, WordStats>();
      answeredWords.forEach((w) => {
        const s = statsMap.get(w.id);
        if (s) reduced.set(w.id, s);
      });
      setWordStatsById(reduced);
      setManualMasteryById(manualMap);
    })();
    return () => { active = false; };
  }, [phase, isFinished, answeredWords]);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  useEffect(() => {
    if (!currentQuestion || !isSpeechSynthesisSupported() || selected !== null || hasAutoPlayedRef.current.has(currentIndex)) return;
    hasAutoPlayedRef.current.add(currentIndex);
    const timeoutId = setTimeout(() => {
      switch (currentQuestion.type) {
        case "en-to-ja": speakWord(currentQuestion.word.word); break;
        case "listening":
        case "dictation": if (currentQuestion.word.example) speakSentence(currentQuestion.word.example); break;
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [currentQuestion, currentIndex, selected]);

  const handleAchievementClose = () => {
    const remaining = pendingAchievements.slice(1);
    setPendingAchievements(remaining);
    if (remaining.length > 0) {
      setTimeout(() => setShowingAchievement(remaining[0]), 300);
    } else {
      setShowingAchievement(null);
    }
  };

  return {
    phase,
    setPhase,
    quizSettings,
    setQuizSettings,
    questions,
    currentIndex,
    selected,
    isCorrect,
    dictationInputs,
    setDictationInputs,
    dictationInputRefs,
    score,
    combo,
    maxCombo,
    isFinished,
    showTranslation,
    setShowTranslation,
    elapsedSeconds,
    wordStatsById,
    manualMasteryById,
    setManualMasteryById,
    answeredWords,
    sessionResult,
    showingAchievement,
    showPerfectScore,
    setShowPerfectScore,
    bookmarkedIds,
    dataLoaded,
    currentQuestion,
    startNewSession,
    startRetrySessionWithWordIds,
    handleNext,
    handleSelect,
    handleDictationSubmit,
    handleAchievementClose,
  };
};