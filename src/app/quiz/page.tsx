"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearQuizResultState, getQuizResultState } from "@/lib/quiz-session";
import { useQuiz } from "@/lib/hooks/useQuiz";
import { QuizSession } from "@/components/features/quiz/QuizSession";
import { QuizResult } from "@/components/features/quiz/QuizResult";

export default function QuizPage() {
  const router = useRouter();
  const {
    phase,
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
    isMobile,
    handleSpeakStart,
    handleSpeakingSkip,
    inQuizSettings,
    setInQuizSettings,
    quizSettings,
    savedProgress,
    saveProgress,
    resumeSavedProgress,
  } = useQuiz();

  // Auto-start: when phase is still "setup" and data is loaded, start quiz automatically.
  // ただし useQuiz の復元 effect と同一レンダーで実行されるレース条件を防ぐため、
  // "quiz-show-result" フラグと savedResultState が両方存在する場合はスキップする
  // （復元は useQuiz 側の effect が担当する）。
  useEffect(() => {
    if (phase !== "setup" || !dataLoaded) return;
    const pendingRestore =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("quiz-show-result") === "1" &&
      getQuizResultState() !== null;
    if (pendingRestore) return;
    if (savedProgress) {
      resumeSavedProgress();
    } else {
      startNewSession(quizSettings);
    }
  }, [phase, dataLoaded, savedProgress, resumeSavedProgress, startNewSession, quizSettings]);

  const handleSuspend = () => {
    if (saveProgress()) {
      router.push("/word-list");
    }
  };

  // Loading screen: while waiting for auto-start
  if (!dataLoaded || phase === "setup") {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (phase !== "result" && questions.length === 0) {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (phase === "result" || isFinished) {
    return (
      <QuizResult
        score={score}
        questions={questions}
        answeredWords={answeredWords}
        sessionResult={sessionResult}
        elapsedSeconds={elapsedSeconds}
        maxCombo={maxCombo}
        wordStatsById={wordStatsById}
        manualMasteryById={manualMasteryById}
        setManualMasteryById={setManualMasteryById}
        showingAchievement={showingAchievement}
        showPerfectScore={showPerfectScore}
        setShowPerfectScore={setShowPerfectScore}
        quizSettings={quizSettings}
        startRetrySessionWithWordIds={startRetrySessionWithWordIds}
        startNewSession={startNewSession}
        onClearResult={() => clearQuizResultState()}
        onSettings={() => {
          clearQuizResultState();
          router.push("/word-list");
        }}
        onHome={() => clearQuizResultState()}
        handleAchievementClose={handleAchievementClose}
      />
    );
  }

  return (
    <QuizSession
      questions={questions}
      currentIndex={currentIndex}
      score={score}
      combo={combo}
      currentQuestion={currentQuestion}
      selected={selected}
      isCorrect={isCorrect}
      dictationInputs={dictationInputs}
      setDictationInputs={setDictationInputs}
      dictationInputRefs={dictationInputRefs}
      showTranslation={showTranslation}
      setShowTranslation={setShowTranslation}
      handleNext={handleNext}
      handleSelect={handleSelect}
      handleDictationSubmit={handleDictationSubmit}
      isSpeechRecognitionSupported={isSpeechRecognitionSupported}
      isListening={isListening}
      recognizedText={recognizedText}
      isMobile={isMobile}
      handleSpeakStart={handleSpeakStart}
      handleSpeakingSkip={handleSpeakingSkip}
      inQuizSettings={inQuizSettings}
      setInQuizSettings={setInQuizSettings}
      onSuspend={handleSuspend}
      onSaveProgress={saveProgress}
    />
  );
}
