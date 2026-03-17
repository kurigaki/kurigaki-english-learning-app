"use client";

import { words } from "@/data/words/compat";
import { clearQuizResultState } from "@/lib/quiz-session";
import { useQuiz } from "@/lib/hooks/useQuiz";
import { QuizSetup } from "@/components/features/quiz/QuizSetup";
import { QuizSession } from "@/components/features/quiz/QuizSession";
import { QuizResult } from "@/components/features/quiz/QuizResult";

export default function QuizPage() {
  const {
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
    isMobile,
    handleSpeakStart,
    handleSpeakingSkip,
    inQuizSettings,
    setInQuizSettings,
    savedProgress,
    saveProgress,
    resumeSavedProgress,
    discardSavedProgress,
  } = useQuiz();

  const handleSuspend = () => {
    if (saveProgress()) {
      setPhase("setup");
    }
  };

  // 設定画面
  if (phase === "setup") {
    return (
      <QuizSetup
        quizSettings={quizSettings}
        setQuizSettings={setQuizSettings}
        startNewSession={startNewSession}
        bookmarkedIds={bookmarkedIds}
        words={words}
        savedProgress={savedProgress}
        onResumeSaved={resumeSavedProgress}
        onDiscardSaved={discardSavedProgress}
      />
    );
  }

  if (!dataLoaded || (phase !== "result" && questions.length === 0)) {
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
          setPhase("setup");
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
