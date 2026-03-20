import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { words, Word } from "@/data/words/compat";
import { unifiedStorage } from "@/lib/unified-storage";
import { Question, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import type { ManualMasteryLevel, WordStats } from "@/lib/storage";
import { storage } from "@/lib/storage";
import {
  saveQuizResultState,
  getQuizResultState,
  clearQuizResultState,
  saveQuizProgressState,
  getQuizProgressState,
  clearQuizProgressState,
  getAndClearBookWordIds,
  AnsweredWord,
  SessionResult,
  QuizProgressState,
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
import { InQuizSettings, loadInQuizSettings, saveInQuizSettings } from "@/lib/quiz/in-quiz-settings";
import { isDictationWordCorrect } from "@/lib/quiz/dictation-match";
import { levenshteinDistance } from "@/lib/string-utils";

const QUESTIONS_PER_SESSION = 10;
type QuizPhase = "setup" | "quiz" | "result";

export const useQuiz = () => {
  const searchParams = useSearchParams();
  const reviewWordId = searchParams.get("wordId");
  const weakOnly = searchParams.get("weakOnly");
  const srsReview = searchParams.get("srsReview");
  const bookmarksOnly = searchParams.get("bookmarksOnly");
  const bookWordsParam = searchParams.get("bookWords");

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
  const [savedProgress, setSavedProgress] = useState<QuizProgressState | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [weakWordIds, setWeakWordIds] = useState<number[]>([]);
  const [studiedWordIds, setStudiedWordIds] = useState<number[]>([]);
  const [srsWordIds, setSrsWordIds] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const hasAutoPlayedRef = useRef<Set<number>>(new Set());

  // === クイズ中設定 ===
  const [inQuizSettings, setInQuizSettings] = useState<InQuizSettings>(() => loadInQuizSettings());
  const inQuizSettingsRef = useRef(inQuizSettings);
  inQuizSettingsRef.current = inQuizSettings;

  useEffect(() => {
    saveInQuizSettings(inQuizSettings);
  }, [inQuizSettings]);

  // === スピーキングモード: 音声認識 ===
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const isMobileQuizRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionQuizRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookmarks, weaks, studied, dueWords] = await Promise.all([
          unifiedStorage.getBookmarkedWordIds(),
          unifiedStorage.getWeakWords(60),
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

  // 音声認識のサポート確認（Chrome iOS / Firefox iOS は WKWebView のため除外）
  useEffect(() => {
    const ua = typeof window !== "undefined" ? navigator.userAgent : "";
    const isWebViewBrowser = /CriOS|FxiOS/i.test(ua);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasApi = !!(typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    setIsSpeechRecognitionSupported(hasApi && !isWebViewBrowser);
    isMobileQuizRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // アンマウント時に音声認識を停止
  useEffect(() => {
    return () => {
      if (recognitionQuizRef.current) {
        try { recognitionQuizRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  useEffect(() => {
    const saved = getQuizProgressState();
    if (saved) {
      setSavedProgress(saved);
    }
  }, []);

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= questions.length) {
      let sessionResult: SessionResult | null = null;
      let newAchievements: Achievement[] = [];

      try {
        const previousUserData = await unifiedStorage.getUserData();
        const previousLevel = previousUserData.level;
        const previousStreak = previousUserData.streak;
        // ミッション進捗記録
        storage.recordModePlay("quiz");
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
      clearQuizProgressState();
      setSavedProgress(null);

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

  const saveProgress = useCallback(() => {
    if (phase !== "quiz" || questions.length === 0) return false;
    const elapsed = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
    const progressState = {
      questions,
      currentIndex,
      score,
      combo,
      maxCombo,
      selected,
      isCorrect,
      dictationInputs,
      showTranslation,
      answeredWords,
      elapsedSeconds: elapsed,
      quizSettings,
    };
    saveQuizProgressState(progressState);
    setSavedProgress({ ...progressState, timestamp: Date.now() });
    return true;
  }, [phase, questions, currentIndex, score, combo, maxCombo, selected, isCorrect, dictationInputs, showTranslation, answeredWords, quizSettings]);

  const discardSavedProgress = useCallback(() => {
    clearQuizProgressState();
    setSavedProgress(null);
  }, []);

  const resumeSavedProgress = useCallback(() => {
    if (!savedProgress) return;
    setInQuizSettings(loadInQuizSettings());
    setQuestions(savedProgress.questions);
    setQuizSettings(savedProgress.quizSettings);
    setPhase("quiz");
    setCurrentIndex(savedProgress.currentIndex);
    setScore(savedProgress.score);
    setCombo(savedProgress.combo);
    setMaxCombo(savedProgress.maxCombo);
    setSelected(savedProgress.selected);
    setIsCorrect(savedProgress.isCorrect);
    setDictationInputs(savedProgress.dictationInputs);
    dictationInputRefs.current = [];
    setAnsweredWords(savedProgress.answeredWords);
    setElapsedSeconds(savedProgress.elapsedSeconds);
    setIsFinished(false);
    setSessionResult(null);
    setIsRestoredFromSession(false);
    setShowTranslation(savedProgress.showTranslation);
    setShowPerfectScore(false);
    hasAutoPlayedRef.current = new Set();
    sessionStartTimeRef.current = Date.now() - savedProgress.elapsedSeconds * 1000;
    clearQuizProgressState();
    setSavedProgress(null);
  }, [savedProgress]);

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
    if ((currentQuestion.type === "ja-to-en" || currentQuestion.type === "speaking") && isSpeechSynthesisSupported()) {
      speakWord(choice);
    }
    processAnswer(choice, correct);
  }, [selected, currentQuestion, processAnswer]);

  // スピーキング問題: 音声認識を開始する（デスクトップ自動起動 / モバイル手動起動共通）
  const startSpeakingRecognition = useCallback((question: Question) => {
    if (!isSpeechRecognitionSupported || selected !== null) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (recognitionQuizRef.current) {
      try { recognitionQuizRef.current.stop(); } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionQuizRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    const answer = question.correctAnswer.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      if (!transcript) return;
      const difficulty = inQuizSettingsRef.current.speakingDifficulty;
      let isMatch: boolean;
      if (difficulty === "strict") {
        isMatch = transcript === answer;
      } else if (difficulty === "easy") {
        // 単語長の最大 25% の誤差を許容（最低1文字）
        const EASY_MODE_TOLERANCE_RATIO = 0.25;
        const strip = (s: string) => s.replace(/^(a|an|the)\s+/i, "").trim();
        isMatch = transcript === answer
          || transcript.includes(answer)
          || levenshteinDistance(strip(transcript), strip(answer)) <= Math.max(1, Math.floor(answer.length * EASY_MODE_TOLERANCE_RATIO));
      } else {
        isMatch = transcript === answer || transcript.includes(answer);
      }
      setRecognizedText({ text: transcript, isCorrect: isMatch });
      if (isMatch) {
        processAnswer(question.correctAnswer, true);
      }
    };
    recognition.onerror = () => setIsListening(false);

    try { recognition.start(); } catch { /* ignore */ }
  }, [isSpeechRecognitionSupported, selected, processAnswer]);

  // デスクトップ: スピーキング問題が表示されたら自動的に音声認識を起動
  useEffect(() => {
    if (!isSpeechRecognitionSupported || isMobileQuizRef.current) return;
    if (!currentQuestion || currentQuestion.type !== "speaking" || selected !== null || phase !== "quiz") return;

    const timer = setTimeout(() => {
      startSpeakingRecognition(currentQuestion);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (recognitionQuizRef.current) {
        try { recognitionQuizRef.current.stop(); } catch { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isSpeechRecognitionSupported, phase]);

  // 回答済みになったら音声認識を停止
  useEffect(() => {
    if (selected !== null && recognitionQuizRef.current) {
      try { recognitionQuizRef.current.stop(); } catch { /* ignore */ }
    }
  }, [selected]);

  // 問題が変わったら認識テキストをクリア
  useEffect(() => {
    setRecognizedText(null);
  }, [currentIndex]);

  // モバイル用: ボタン押下で音声認識を開始
  const handleSpeakStart = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== "speaking") return;
    startSpeakingRecognition(currentQuestion);
  }, [currentQuestion, startSpeakingRecognition]);

  // スピーキング問題をスキップ（不正解として進む）
  const handleSpeakingSkip = useCallback(() => {
    if (!currentQuestion || selected !== null) return;
    if (recognitionQuizRef.current) {
      try { recognitionQuizRef.current.stop(); } catch { /* ignore */ }
    }
    processAnswer(currentQuestion.correctAnswer, false);
  }, [currentQuestion, selected, processAnswer]);

  handleSelectRef.current = handleSelect;

  const handleDictationSubmit = useCallback(() => {
    if (selected !== null || !currentQuestion) return;
    const answerWords = currentQuestion.correctAnswer.split(/\s+/);
    const allFilled = answerWords.every((_, i) => (dictationInputs[i] ?? "").trim() !== "");
    if (!allFilled) return;

    const difficulty = inQuizSettingsRef.current.dictationDifficulty;
    const correct = answerWords.every(
      (w, i) => isDictationWordCorrect(dictationInputs[i] ?? "", w, difficulty)
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

      if (selected !== null || !currentQuestion || currentQuestion.type === "dictation" || currentQuestion.type === "speaking") return;

      const keyIndex = ["1", "2", "3", "4"].indexOf(e.key);
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
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("quiz-show-result");
      window.sessionStorage.removeItem("quiz-result-scroll");
    }
    setInQuizSettings(loadInQuizSettings());
    clearQuizResultState();
    clearQuizProgressState();
    setSavedProgress(null);

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

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("quiz-show-result");
      window.sessionStorage.removeItem("quiz-result-scroll");
    }
    setInQuizSettings(loadInQuizSettings());
    clearQuizResultState();
    clearQuizProgressState();
    setSavedProgress(null);
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
    const canRestoreResult =
      typeof window !== "undefined"
        && window.sessionStorage.getItem("quiz-show-result") === "1";
    if (savedState && canRestoreResult) {
      clearQuizProgressState();
      setSavedProgress(null);
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
    if (savedState && !canRestoreResult) {
      clearQuizResultState();
    }

    // Don't reset phase if quiz is already showing result
    if (phase === "result") return;

    if (reviewWordId) {
      const wordIdNum = parseInt(reviewWordId, 10);
      if (!isNaN(wordIdNum) && words.some((w) => w.id === wordIdNum)) {
        startNewSession(quizSettings, { priorityWordId: wordIdNum });
        return;
      }
    }
    if (srsReview === "true" && srsWordIds.length > 0) {
      startNewSession(quizSettings, { srsReviewMode: true });
      return;
    }
    if (weakOnly === "true" && weakWordIds.length > 0) {
      startNewSession(quizSettings, { weakOnlyMode: true });
      return;
    }
    if (bookmarksOnly === "true") {
      const validBookmarked = bookmarkedIds.filter((id) => words.some((w) => w.id === id));
      if (validBookmarked.length > 0) {
        startNewSession({ ...quizSettings, includeBookmarksOnly: true });
        return;
      }
    }
    if (bookWordsParam === "true") {
      const bookWordIds = getAndClearBookWordIds();
      if (bookWordIds && bookWordIds.length > 0) {
        startRetrySessionWithWordIds(bookWordIds);
        return;
      }
    }
    if (phase === "quiz" && questions.length > 0) return;
    setPhase("setup");
  }, [dataLoaded, reviewWordId, weakOnly, srsReview, bookmarksOnly, bookWordsParam, weakWordIds, srsWordIds, bookmarkedIds, startNewSession, startRetrySessionWithWordIds, phase, questions.length, quizSettings]);

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
    if (phase !== "quiz" || isFinished || questions.length === 0) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveProgress();
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase, isFinished, questions.length, saveProgress]);

  useEffect(() => {
    const currentAudioMode =
      currentQuestion?.type === "listening"
        ? inQuizSettings.listeningAudioMode
        : currentQuestion?.type === "dictation"
        ? inQuizSettings.writingAudioMode
        : currentQuestion?.type === "speaking"
        ? inQuizSettings.speakingAudioMode
        : inQuizSettings.readingAudioMode;
    // 書き取り: 和訳がOFF かつ 音声が "button" の場合は auto-play に昇格
    const shouldAutoPlay =
      currentAudioMode === "auto" ||
      (currentQuestion?.type === "dictation" &&
        inQuizSettings.writingTranslationMode === "none" &&
        currentAudioMode === "button");
    if (!shouldAutoPlay) return;
    // 音声認識（マイク）動作中は TTS を呼ばない（競合防止）
    if (isListening) return;
    if (!currentQuestion || !isSpeechSynthesisSupported() || selected !== null || hasAutoPlayedRef.current.has(currentIndex)) return;
    hasAutoPlayedRef.current.add(currentIndex);
    const timeoutId = setTimeout(() => {
      switch (currentQuestion.type) {
        case "en-to-ja": speakWord(currentQuestion.word.word); break;
        case "listening":
        case "dictation": if (currentQuestion.word.example) speakSentence(currentQuestion.word.example); break;
        // speaking: 自動読み上げなし（ユーザーが声に出して答える）
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [
    currentQuestion,
    currentIndex,
    selected,
    inQuizSettings.readingAudioMode,
    inQuizSettings.writingAudioMode,
    inQuizSettings.speakingAudioMode,
    inQuizSettings.listeningAudioMode,
    inQuizSettings.writingTranslationMode,
    isListening,
  ]);

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
    isSpeechRecognitionSupported,
    isListening,
    recognizedText,
    isMobile: isMobileQuizRef.current,
    handleSpeakStart,
    handleSpeakingSkip,
    inQuizSettings,
    setInQuizSettings,
    savedProgress,
    saveProgress,
    resumeSavedProgress,
    discardSavedProgress,
  };
};
